import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


def _normalise_db_url(url: str) -> str:
    # SQLAlchemy 1.4+ rejects the "postgres://" scheme that Supabase copies
    # from the dashboard — silently fix it here.
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "wams-dev-secret-key-change-in-prod")

    _raw_db_url = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'wams.db')}")
    SQLALCHEMY_DATABASE_URI = _normalise_db_url(_raw_db_url)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Pool keep-alive ping so stale Supabase connections are recycled.
    # For SQLite (local dev without Supabase) this is harmless.
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }

    # Supabase requires TLS; inject sslmode only for PostgreSQL URLs.
    if _normalise_db_url(_raw_db_url).startswith("postgresql://"):
        SQLALCHEMY_ENGINE_OPTIONS["connect_args"] = {"sslmode": "require"}

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "wams-jwt-secret-change-in-prod")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
