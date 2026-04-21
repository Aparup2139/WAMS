from datetime import datetime, timezone
from app.extensions import db


class Part(db.Model):
    __tablename__ = "parts"

    id = db.Column(db.Integer, primary_key=True)
    part_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(80), nullable=True)
    quantity_in_stock = db.Column(db.Integer, default=0)
    reorder_level = db.Column(db.Integer, default=10)
    unit_of_measure = db.Column(db.String(30), default="pieces")
    last_updated = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    quotations = db.relationship("Quotation", backref="part", lazy=True)
    orders = db.relationship("Order", backref="part", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "part_name": self.part_name,
            "description": self.description,
            "category": self.category,
            "quantity_in_stock": self.quantity_in_stock,
            "reorder_level": self.reorder_level,
            "unit_of_measure": self.unit_of_measure,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
        }
