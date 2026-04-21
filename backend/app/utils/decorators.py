from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.extensions import db
from app.models.user import User


def role_required(*roles):
    """Restrict access to users with specific roles.

    Self-contained: validates the JWT itself so it is safe to use without
    a separate @jwt_required() decorator above it (though stacking both
    is still fine and is the conventional style in the routes).
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = db.session.get(User, int(get_jwt_identity()))
            if not user:
                return jsonify({"error": "User not found"}), 404
            if user.role not in roles:
                return jsonify({"error": "Access denied"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
