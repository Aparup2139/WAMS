from datetime import datetime, timezone
from app.extensions import db


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    dealer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    part_id = db.Column(db.Integer, db.ForeignKey("parts.id"), nullable=False)
    quantity_ordered = db.Column(db.Integer, nullable=False)
    order_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    delivery_address = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="Pending")  # Pending / Validated / Fulfilled / Rejected
    total_amount = db.Column(db.Numeric(12, 2), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "dealer_id": self.dealer_id,
            "dealer_name": self.dealer.username if self.dealer else None,
            "part_id": self.part_id,
            "part_name": self.part.part_name if self.part else None,
            "quantity_ordered": self.quantity_ordered,
            "order_date": self.order_date.isoformat() if self.order_date else None,
            "delivery_address": self.delivery_address,
            "status": self.status,
            "total_amount": float(self.total_amount) if self.total_amount else None,
        }
