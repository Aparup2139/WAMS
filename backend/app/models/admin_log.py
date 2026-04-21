from datetime import datetime, timezone
from app.extensions import db


class AdminActionLog(db.Model):
    __tablename__ = "admin_action_logs"

    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    action_details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "admin_name": self.admin.username if self.admin else None,
            "action_type": self.action_type,
            "action_details": self.action_details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
