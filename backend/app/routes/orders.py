"""Processes 0.2 (Accept Orders), 0.3.1 (Validate), 0.3.2 (Check Inventory), 0.3.4 (Update Statuses)."""

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.order import Order
from app.models.part import Part
from app.models.user import User
from app.models.admin_log import AdminActionLog
from app.utils.decorators import role_required

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@orders_bp.route("", methods=["GET"])
@jwt_required()
def list_orders():
    user = User.query.get(int(get_jwt_identity()))
    if user.role == "Dealer":
        orders = Order.query.filter_by(dealer_id=user.id).order_by(Order.order_date.desc()).all()
    elif user.role == "Admin":
        orders = Order.query.order_by(Order.order_date.desc()).all()
    else:
        return jsonify({"error": "Access denied"}), 403

    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.route("", methods=["POST"])
@jwt_required()
@role_required("Dealer")
def place_order():
    """
    Process 0.2 (Accept Orders)
    → 0.3.1 (Validate Orders) — check required fields + part exists
    → 0.3.2 (Check Inventory) — verify stock availability
    → 0.3.4 (Update Statuses) — set initial status
    """
    data = request.get_json()
    required = ["part_id", "quantity_ordered", "delivery_address"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields: part_id, quantity_ordered, delivery_address"}), 400

    # --- Process 0.3.1: Validate Orders ---
    part = Part.query.get(data["part_id"])
    if not part:
        return jsonify({"error": "Part not found", "validation": "failed"}), 404

    qty = data["quantity_ordered"]
    if not isinstance(qty, int) or qty <= 0:
        return jsonify({"error": "Quantity must be a positive integer", "validation": "failed"}), 400

    # --- Process 0.3.2: Check Inventory ---
    if part.quantity_in_stock < qty:
        return jsonify({
            "error": "Insufficient stock",
            "validation": "passed",
            "inventory_check": "failed",
            "available": part.quantity_in_stock,
            "requested": qty,
        }), 409

    # --- Process 0.3.4: Update Statuses ---
    # Compute total from the latest accepted quotation price, or a default
    from app.models.quotation import Quotation

    accepted_quote = (
        Quotation.query
        .filter_by(part_id=part.id, status="Accepted")
        .order_by(Quotation.submission_date.desc())
        .first()
    )
    unit_price = float(accepted_quote.unit_price) if accepted_quote else 0.0
    total = unit_price * qty

    user_id = int(get_jwt_identity())
    order = Order(
        dealer_id=user_id,
        part_id=part.id,
        quantity_ordered=qty,
        delivery_address=data["delivery_address"],
        status="Validated",
        total_amount=total,
    )
    db.session.add(order)
    db.session.commit()

    return jsonify({
        "message": "Order placed and validated",
        "order": order.to_dict(),
        "validation": "passed",
        "inventory_check": "passed",
    }), 201


@orders_bp.route("/<int:oid>", methods=["GET"])
@jwt_required()
def get_order(oid):
    order = Order.query.get_or_404(oid)
    user = User.query.get(int(get_jwt_identity()))
    if user.role == "Dealer" and order.dealer_id != user.id:
        return jsonify({"error": "Access denied"}), 403
    return jsonify(order.to_dict()), 200


@orders_bp.route("/<int:oid>/status", methods=["PUT"])
@jwt_required()
@role_required("Admin")
def update_order_status(oid):
    """Process 0.3.4 — Update Statuses (Admin fulfills or rejects)."""
    order = Order.query.get_or_404(oid)
    data = request.get_json()
    new_status = data.get("status")
    if new_status not in ("Fulfilled", "Rejected"):
        return jsonify({"error": "Status must be 'Fulfilled' or 'Rejected'"}), 400

    if new_status == "Fulfilled":
        part = Part.query.get(order.part_id)
        if part.quantity_in_stock < order.quantity_ordered:
            return jsonify({"error": "Insufficient stock to fulfill"}), 409
        part.quantity_in_stock -= order.quantity_ordered
        part.last_updated = datetime.now(timezone.utc)

    order.status = new_status
    admin_id = int(get_jwt_identity())

    log = AdminActionLog(
        admin_id=admin_id,
        action_type="UPDATE_ORDER_STATUS",
        action_details=f"Order #{oid} marked as {new_status}",
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": f"Order {new_status}", "order": order.to_dict()}), 200
