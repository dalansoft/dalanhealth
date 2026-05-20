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

    cors_origins: str = "http://localhost:5173,http://localhost:19006"

    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
