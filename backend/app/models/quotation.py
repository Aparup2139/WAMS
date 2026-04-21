from datetime import datetime, timezone
from app.extensions import db


class Quotation(db.Model):
    __tablename__ = "quotations"

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    part_id = db.Column(db.Integer, db.ForeignKey("parts.id"), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity_offered = db.Column(db.Integer, nullable=False)
    terms = db.Column(db.Text, nullable=True)
    submission_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    expiry_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default="Pending")  # Pending / Accepted / Rejected

    def to_dict(self):
        return {
            "id": self.id,
            "supplier_id": self.supplier_id,
            "supplier_name": self.supplier.username if self.supplier else None,
            "part_id": self.part_id,
            "part_name": self.part.part_name if self.part else None,
            "unit_price": float(self.unit_price),
            "quantity_offered": self.quantity_offered,
            "terms": self.terms,
            "submission_date": self.submission_date.isoformat() if self.submission_date else None,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "status": self.status,
        }
