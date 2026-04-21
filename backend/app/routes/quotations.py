"""Process 0.1 (Accept Quotations) and 0.3.3 (Evaluate Quotations)."""

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.quotation import Quotation
from app.models.part import Part
from app.models.user import User
from app.models.admin_log import AdminActionLog
from app.utils.decorators import role_required

quotations_bp = Blueprint("quotations", __name__, url_prefix="/api/quotations")


@quotations_bp.route("", methods=["GET"])
@jwt_required()
def list_quotations():
    user = User.query.get(int(get_jwt_identity()))
    if user.role == "Supplier":
        quotations = Quotation.query.filter_by(supplier_id=user.id).order_by(Quotation.submission_date.desc()).all()
    elif user.role == "Admin":
        quotations = Quotation.query.order_by(Quotation.submission_date.desc()).all()
    else:
        return jsonify({"error": "Access denied"}), 403

    return jsonify([q.to_dict() for q in quotations]), 200


@quotations_bp.route("", methods=["POST"])
@jwt_required()
@role_required("Supplier")
def submit_quotation():
    """Process 0.1 — Accept Quotations."""
    data = request.get_json()
    required = ["part_id", "unit_price", "quantity_offered"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    part = Part.query.get(data["part_id"])
    if not part:
        return jsonify({"error": "Part not found"}), 404

    user_id = int(get_jwt_identity())
    expiry = None
    if data.get("expiry_date"):
        expiry = datetime.fromisoformat(data["expiry_date"])

    quotation = Quotation(
        supplier_id=user_id,
        part_id=data["part_id"],
        unit_price=data["unit_price"],
        quantity_offered=data["quantity_offered"],
        terms=data.get("terms", ""),
        expiry_date=expiry,
    )
    db.session.add(quotation)
    db.session.commit()

    return jsonify({"message": "Quotation submitted", "quotation": quotation.to_dict()}), 201


@quotations_bp.route("/<int:qid>", methods=["GET"])
@jwt_required()
def get_quotation(qid):
    quotation = Quotation.query.get_or_404(qid)
    user = User.query.get(int(get_jwt_identity()))
    if user.role == "Supplier" and quotation.supplier_id != user.id:
        return jsonify({"error": "Access denied"}), 403
    return jsonify(quotation.to_dict()), 200


@quotations_bp.route("/<int:qid>/evaluate", methods=["PUT"])
@jwt_required()
@role_required("Admin")
def evaluate_quotation(qid):
    """Process 0.3.3 — Evaluate Quotations."""
    quotation = Quotation.query.get_or_404(qid)
    data = request.get_json()
    new_status = data.get("status")
    if new_status not in ("Accepted", "Rejected"):
        return jsonify({"error": "Status must be 'Accepted' or 'Rejected'"}), 400

    quotation.status = new_status
    admin_id = int(get_jwt_identity())

    log = AdminActionLog(
        admin_id=admin_id,
        action_type="EVALUATE_QUOTATION",
        action_details=f"Quotation #{qid} marked as {new_status}",
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": f"Quotation {new_status}", "quotation": quotation.to_dict()}), 200
