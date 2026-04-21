"""Process 0.4.3 (Log Admin Actions), dashboard stats, user management, and reports."""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.admin_log import AdminActionLog
from app.models.bill import Bill
from app.models.order import Order
from app.models.part import Part
from app.models.quotation import Quotation
from app.models.user import User
from app.utils.decorators import role_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/logs", methods=["GET"])
@jwt_required()
@role_required("Admin")
def get_logs():
    """Process 0.4.3 — Retrieve admin action logs."""
    logs = AdminActionLog.query.order_by(AdminActionLog.timestamp.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200


@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@role_required("Admin")
def dashboard_stats():
    total_parts = Part.query.count()
    low_stock = Part.query.filter(Part.quantity_in_stock <= Part.reorder_level).count()
    total_orders = Order.query.count()
    pending_orders = Order.query.filter_by(status="Validated").count()
    total_quotations = Quotation.query.count()
    pending_quotations = Quotation.query.filter_by(status="Pending").count()
    total_users = User.query.count()
    total_bills = Bill.query.count()

    return jsonify({
        "total_parts": total_parts,
        "low_stock_alerts": low_stock,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_quotations": total_quotations,
        "pending_quotations": pending_quotations,
        "total_users": total_users,
        "total_bills": total_bills,
    }), 200


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required("Admin")
def list_users():
    """manageRoles() — list all users."""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.route("/users/<int:uid>/role", methods=["PUT"])
@jwt_required()
@role_required("Admin")
def update_user_role(uid):
    """manageRoles() — change a user's role."""
    user = db.get_or_404(User, uid)
    data = request.get_json()
    new_role = data.get("role")
    if new_role not in ("Admin", "Supplier", "Dealer"):
        return jsonify({"error": "Invalid role. Must be Admin, Supplier, or Dealer"}), 400

    old_role = user.role
    user.role = new_role

    admin_id = int(get_jwt_identity())
    log = AdminActionLog(
        admin_id=admin_id,
        action_type="MODIFY_USER_ROLE",
        action_details=f"User #{uid} ({user.username}) role changed from {old_role} to {new_role}",
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Role updated", "user": user.to_dict()}), 200


@admin_bp.route("/reports", methods=["GET"])
@jwt_required()
@role_required("Admin")
def generate_reports():
    """generateReports() — full system report."""
    # Inventory summary
    parts = Part.query.order_by(Part.part_name).all()
    inventory_summary = [p.to_dict() for p in parts]
    low_stock_parts = [p.to_dict() for p in parts if p.quantity_in_stock <= p.reorder_level]

    # Orders by status
    order_counts = {}
    for status in ("Pending", "Validated", "Fulfilled", "Rejected"):
        order_counts[status] = Order.query.filter_by(status=status).count()

    # Quotations by status
    quotation_counts = {}
    for status in ("Pending", "Accepted", "Rejected"):
        quotation_counts[status] = Quotation.query.filter_by(status=status).count()

    # Revenue from fulfilled orders
    fulfilled_orders = Order.query.filter_by(status="Fulfilled").all()
    total_revenue = sum(
        float(o.total_amount) for o in fulfilled_orders if o.total_amount
    )

    # Users by role
    user_counts = {}
    for role in ("Admin", "Supplier", "Dealer"):
        user_counts[role] = User.query.filter_by(role=role).count()

    return jsonify({
        "inventory_summary": inventory_summary,
        "low_stock_parts": low_stock_parts,
        "order_counts": order_counts,
        "quotation_counts": quotation_counts,
        "total_revenue": total_revenue,
        "user_counts": user_counts,
    }), 200
