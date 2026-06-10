from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "DalanHealth"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "dalanhealth"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 720

    otp_demo_code: str = "123456"

    cors_origins: str = "http://localhost:5173,http://localhost:5180,http://localhost:19006"

    # ── Redis (Upstash) — sessions / rate limiting / pub-sub fan-out ──
    # Use the rediss:// TLS URL from the Upstash console.
    redis_url: str = ""

    # ── Object storage (Cloudflare R2, S3-compatible) ──
    r2_account_id: str = ""
    r2_access_key: str = ""
    r2_secret_key: str = ""
    # Bucket names are fixed constants in app/services/storage.py.

    # ── Transactional email (Resend) ──
    resend_api_key: str = ""
    email_from: str = "DalanHealth <info@dalanhealth.com>"

    # ── Payments ──
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    cashfree_client_id: str = ""
    cashfree_secret_key: str = ""

    # ── Rate limiting (in-memory, per instance) ──
    rate_limit_per_minute: int = 120

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def r2_endpoint(self) -> str:
        return f"https://{self.r2_account_id}.r2.cloudflarestorage.com" if self.r2_account_id else ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
