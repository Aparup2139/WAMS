"""Bills — UML Bills class: generateBill(), printBill()."""

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.bill import Bill
from app.models.order import Order
from app.models.user import User
from app.utils.decorators import role_required

bills_bp = Blueprint("bills", __name__, url_prefix="/api/bills")


@bills_bp.route("", methods=["GET"])
@jwt_required()
def list_bills():
    """Dealers see their own bills; Admins see all."""
    user = db.session.get(User, int(get_jwt_identity()))
    if user.role == "Dealer":
        bills = (
            Bill.query
            .join(Order)
            .filter(Order.dealer_id == user.id)
            .order_by(Bill.generated_at.desc())
            .all()
        )
    elif user.role == "Admin":
        bills = Bill.query.order_by(Bill.generated_at.desc()).all()
    else:
        return jsonify({"error": "Access denied"}), 403

    return jsonify([b.to_dict() for b in bills]), 200


@bills_bp.route("/<int:bid>", methods=["GET"])
@jwt_required()
def get_bill(bid):
    bill = db.get_or_404(Bill, bid)
    user = db.session.get(User, int(get_jwt_identity()))
    if user.role == "Dealer" and bill.order.dealer_id != user.id:
        return jsonify({"error": "Access denied"}), 403
    return jsonify(bill.to_dict()), 200


@bills_bp.route("/generate/<int:order_id>", methods=["POST"])
@jwt_required()
@role_required("Admin")
def generate_bill(order_id):
    """generateBill() — Admin triggers bill creation for a Fulfilled order."""
    order = db.get_or_404(Order, order_id)

    if order.status != "Fulfilled":
        return jsonify({"error": "Bill can only be generated for Fulfilled orders"}), 400

    if order.bill:
        return jsonify({"message": "Bill already exists", "bill": order.bill.to_dict()}), 200

    bill = Bill(order_id=order.id, amount=order.total_amount or 0)
    db.session.add(bill)
    db.session.commit()

    return jsonify({"message": "Bill generated", "bill": bill.to_dict()}), 201


@bills_bp.route("/<int:bid>/print", methods=["PUT"])
@jwt_required()
@role_required("Admin")
def print_bill(bid):
    """printBill() — marks bill as printed."""
    bill = db.get_or_404(Bill, bid)
    bill.printed = True
    db.session.commit()
    return jsonify({"message": "Bill marked as printed", "bill": bill.to_dict()}), 200
