from flask import Flask, jsonify
from app.config import Config
from app.extensions import cors, db, jwt, migrate


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # JWT error handlers — all return 401 with a JSON body so the
    # frontend Axios interceptor can reliably redirect to /login.
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization required"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has been revoked"}), 401

    # Import models so Migrate can detect them
    from app import models  # noqa: F401

    from app.routes.auth import auth_bp
    from app.routes.quotations import quotations_bp
    from app.routes.orders import orders_bp
    from app.routes.parts import parts_bp
    from app.routes.admin import admin_bp
    from app.routes.bills import bills_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(quotations_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(parts_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(bills_bp)

    return app
