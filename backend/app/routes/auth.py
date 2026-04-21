"""Processes 0.5 (Dealer Auth), 0.6 (Admin Auth), 0.7 (Supplier Auth)."""

from datetime import datetime, timezone

import bcrypt
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

from app.extensions import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    required = ["username", "password", "email", "role"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    if data["role"] not in ("Admin", "Supplier", "Dealer"):
        return jsonify({"error": "Invalid role"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 409
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 409

    password_hash = bcrypt.hashpw(
        data["password"].encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    user = User(
        username=data["username"],
        password_hash=password_hash,
        role=data["role"],
        email=data["email"],
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data.get("username") or not data.get("password"):
        return jsonify({"error": "Username and password required"}), 400

    user = User.query.filter_by(username=data["username"]).first()
    if not user or not bcrypt.checkpw(
        data["password"].encode("utf-8"), user.password_hash.encode("utf-8")
    ):
        return jsonify({"error": "Invalid credentials"}), 401

    user.last_login = datetime.now(timezone.utc)
    db.session.commit()

    identity = str(user.id)
    access_token = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Issue a new access token using a valid refresh token."""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token}), 200
