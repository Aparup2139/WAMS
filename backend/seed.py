"""Seed the database with sample data for all three roles."""

import bcrypt
from datetime import datetime, timezone, timedelta
from app import create_app
from app.extensions import db
from app.models import User, Part, Quotation, Order, AdminActionLog


def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        # Clear existing data
        AdminActionLog.query.delete()
        Order.query.delete()
        Quotation.query.delete()
        Part.query.delete()
        User.query.delete()
        db.session.commit()

        # --- Users ---
        admin = User(username="admin", password_hash=hash_pw("admin123"), role="Admin", email="admin@wams.com")
        supplier = User(username="supplier1", password_hash=hash_pw("supplier123"), role="Supplier", email="supplier1@wams.com")
        dealer = User(username="dealer1", password_hash=hash_pw("dealer123"), role="Dealer", email="dealer1@wams.com")
        db.session.add_all([admin, supplier, dealer])
        db.session.flush()

        # --- Parts (DB2) ---
        parts = [
            Part(part_name="Brake Pad Set", description="Front brake pads for sedans", category="Brakes", quantity_in_stock=150, reorder_level=20, unit_of_measure="sets"),
            Part(part_name="Oil Filter", description="Standard engine oil filter", category="Filters", quantity_in_stock=300, reorder_level=50, unit_of_measure="pieces"),
            Part(part_name="Spark Plug", description="Iridium spark plug", category="Ignition", quantity_in_stock=500, reorder_level=100, unit_of_measure="pieces"),
            Part(part_name="Air Filter", description="Engine air intake filter", category="Filters", quantity_in_stock=200, reorder_level=30, unit_of_measure="pieces"),
            Part(part_name="Timing Belt", description="Engine timing belt", category="Engine", quantity_in_stock=8, reorder_level=10, unit_of_measure="pieces"),
            Part(part_name="Alternator", description="12V vehicle alternator", category="Electrical", quantity_in_stock=25, reorder_level=5, unit_of_measure="pieces"),
            Part(part_name="Radiator Hose", description="Upper radiator coolant hose", category="Cooling", quantity_in_stock=60, reorder_level=15, unit_of_measure="pieces"),
            Part(part_name="Clutch Kit", description="Complete clutch replacement kit", category="Transmission", quantity_in_stock=12, reorder_level=5, unit_of_measure="kits"),
        ]
        db.session.add_all(parts)
        db.session.flush()

        now = datetime.now(timezone.utc)

        # --- Quotations (DB1) ---
        quotations = [
            Quotation(supplier_id=supplier.id, part_id=parts[0].id, unit_price=45.00, quantity_offered=200, terms="Net 30", expiry_date=now + timedelta(days=30), status="Accepted"),
            Quotation(supplier_id=supplier.id, part_id=parts[1].id, unit_price=8.50, quantity_offered=500, terms="Net 15", expiry_date=now + timedelta(days=15), status="Pending"),
            Quotation(supplier_id=supplier.id, part_id=parts[2].id, unit_price=12.00, quantity_offered=1000, terms="COD", expiry_date=now + timedelta(days=45), status="Pending"),
            Quotation(supplier_id=supplier.id, part_id=parts[4].id, unit_price=35.00, quantity_offered=50, terms="Net 30", expiry_date=now + timedelta(days=20), status="Rejected"),
        ]
        db.session.add_all(quotations)

        # --- Orders (DB3) ---
        orders = [
            Order(dealer_id=dealer.id, part_id=parts[0].id, quantity_ordered=10, delivery_address="123 Main St, Springfield", status="Fulfilled", total_amount=450.00),
            Order(dealer_id=dealer.id, part_id=parts[1].id, quantity_ordered=50, delivery_address="456 Oak Ave, Shelbyville", status="Validated", total_amount=425.00),
            Order(dealer_id=dealer.id, part_id=parts[3].id, quantity_ordered=25, delivery_address="789 Elm Rd, Capital City", status="Pending", total_amount=0.00),
        ]
        db.session.add_all(orders)

        # --- Admin Action Logs ---
        logs = [
            AdminActionLog(admin_id=admin.id, action_type="ADD_PART", action_details="Added part: Brake Pad Set"),
            AdminActionLog(admin_id=admin.id, action_type="EVALUATE_QUOTATION", action_details="Quotation #1 marked as Accepted"),
            AdminActionLog(admin_id=admin.id, action_type="UPDATE_ORDER_STATUS", action_details="Order #1 marked as Fulfilled"),
        ]
        db.session.add_all(logs)

        db.session.commit()
        print("Database seeded successfully!")
        print(f"  Users: admin/admin123, supplier1/supplier123, dealer1/dealer123")
        print(f"  Parts: {len(parts)}")
        print(f"  Quotations: {len(quotations)}")
        print(f"  Orders: {len(orders)}")
        print(f"  Admin logs: {len(logs)}")


if __name__ == "__main__":
    seed()
