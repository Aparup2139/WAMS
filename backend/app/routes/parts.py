"""Processes 0.4.1 (Add/Modify Product Info) and 0.4.2 (Assess Part Availability)."""

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.part import Part
from app.models.admin_log import AdminActionLog
from app.utils.decorators import role_required

parts_bp = Blueprint("parts", __name__, url_prefix="/api/parts")


@parts_bp.route("", methods=["GET"])
@jwt_required()
def list_parts():
    """Process 0.4.2 — List all parts with availability info."""
    parts = Part.query.order_by(Part.part_name).all()
    return jsonify([p.to_dict() for p in parts]), 200


@parts_bp.route("", methods=["POST"])
@jwt_required()
@role_required("Admin")
def add_part():
    """Process 0.4.1 — Add new part."""
    data = request.get_json()
    if not data.get("part_name"):
        return jsonify({"error": "part_name is required"}), 400

    part = Part(
        part_name=data["part_name"],
        description=data.get("description", ""),
        category=data.get("category", ""),
        quantity_in_stock=data.get("quantity_in_stock", 0),
        reorder_level=data.get("reorder_level", 10),
        unit_of_measure=data.get("unit_of_measure", "pieces"),
    )
    db.session.add(part)

    admin_id = int(get_jwt_identity())
    log = AdminActionLog(
        admin_id=admin_id,
        action_type="ADD_PART",
        action_details=f"Added part: {part.part_name}",
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Part added", "part": part.to_dict()}), 201


@parts_bp.route("/<int:pid>", methods=["PUT"])
@jwt_required()
@role_required("Admin")
def modify_part(pid):
    """Process 0.4.1 — Modify existing part."""
    part = Part.query.get_or_404(pid)
    data = request.get_json()

    if "part_name" in data:
        part.part_name = data["part_name"]
    if "description" in data:
        part.description = data["description"]
    if "category" in data:
        part.category = data["category"]
    if "quantity_in_stock" in data:
        part.quantity_in_stock = data["quantity_in_stock"]
    if "reorder_level" in data:
        part.reorder_level = data["reorder_level"]
    if "unit_of_measure" in data:
        part.unit_of_measure = data["unit_of_measure"]

    part.last_updated = datetime.now(timezone.utc)

    admin_id = int(get_jwt_identity())
    log = AdminActionLog(
        admin_id=admin_id,
        action_type="MODIFY_PART",
        action_details=f"Modified part #{pid}: {part.part_name}",
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Part updated", "part": part.to_dict()}), 200


@parts_bp.route("/<int:pid>/availability", methods=["GET"])
@jwt_required()
def check_availability(pid):
    """Process 0.4.2 — Assess Part Availability."""
    part = Part.query.get_or_404(pid)
    return jsonify({
        "part": part.to_dict(),
        "in_stock": part.quantity_in_stock > 0,
        "needs_reorder": part.quantity_in_stock <= part.reorder_level,
    }), 200
