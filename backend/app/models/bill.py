from datetime import datetime, timezone
from app.extensions import db


class Bill(db.Model):
    __tablename__ = "bills"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False, unique=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    generated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    printed = db.Column(db.Boolean, default=False)

    order = db.relationship("Order", backref=db.backref("bill", uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "dealer_name": self.order.dealer.username if self.order and self.order.dealer else None,
            "part_name": self.order.part.part_name if self.order and self.order.part else None,
            "quantity_ordered": self.order.quantity_ordered if self.order else None,
            "amount": float(self.amount),
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "printed": self.printed,
        }
