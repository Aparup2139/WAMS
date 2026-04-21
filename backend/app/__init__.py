from flask import Flask
from app.config import Config
from app.extensions import cors, db, jwt, migrate


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Import models so Migrate can detect them
    from app import models  # noqa: F401

    # Register blueprints
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
