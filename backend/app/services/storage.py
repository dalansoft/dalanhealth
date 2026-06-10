"""Cloudflare R2 object storage (S3-compatible, accessed with boto3).

All buckets are PRIVATE — nothing is ever served from a public bucket URL.
Browsers upload and download exclusively through short-lived presigned URLs
minted here, so credentials never leave the backend and links expire on
their own.

Requires:  pip install boto3   (listed in requirements.txt)
Env:       R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY
"""

from __future__ import annotations

from functools import lru_cache

from app.config import settings

# Fixed bucket set — create these once in the Cloudflare dashboard
# (deploy/DEPLOYMENT.md § Cloudflare R2). Keep names in sync.
BUCKETS = {
    "clinic_logos": "clinic-logos",
    "doctor_profiles": "doctor-profiles",
    "patient_profiles": "patient-profiles",
    "prescriptions": "prescriptions",
    "reports": "reports",
    "exports": "exports",
    "invoices": "invoices",
    "backups": "backups",
}

# Per-bucket upload restrictions enforced when presigning.
MAX_UPLOAD_BYTES = {
    "clinic-logos": 2 * 1024 * 1024,        # 2 MB
    "doctor-profiles": 4 * 1024 * 1024,
    "patient-profiles": 4 * 1024 * 1024,
    "prescriptions": 10 * 1024 * 1024,
    "reports": 25 * 1024 * 1024,
    "exports": 50 * 1024 * 1024,
    "invoices": 10 * 1024 * 1024,
    "backups": 500 * 1024 * 1024,
}

ALLOWED_CONTENT_TYPES = {
    "clinic-logos": {"image/png", "image/jpeg", "image/webp", "image/svg+xml"},
    "doctor-profiles": {"image/png", "image/jpeg", "image/webp"},
    "patient-profiles": {"image/png", "image/jpeg", "image/webp"},
    "prescriptions": {"application/pdf", "image/png", "image/jpeg"},
    "reports": {"application/pdf", "image/png", "image/jpeg"},
    "exports": {"text/csv", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
    "invoices": {"application/pdf"},
    "backups": {"application/gzip", "application/zip"},
}

DEFAULT_URL_TTL_SECONDS = 15 * 60  # 15 minutes


@lru_cache
def _client():
    import boto3  # imported lazily so the app boots without boto3 installed

    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint,
        aws_access_key_id=settings.r2_access_key,
        aws_secret_access_key=settings.r2_secret_key,
        region_name="auto",
    )


def presign_upload(
    bucket: str,
    key: str,
    content_type: str,
    ttl: int = DEFAULT_URL_TTL_SECONDS,
) -> dict:
    """Mint a presigned PUT URL the browser uploads to directly.

    Raises ValueError for unknown buckets or disallowed content types so the
    API layer can return a clean 400.
    """
    if bucket not in BUCKETS.values():
        raise ValueError(f"Unknown bucket: {bucket}")
    allowed = ALLOWED_CONTENT_TYPES.get(bucket, set())
    if allowed and content_type not in allowed:
        raise ValueError(f"{content_type} not allowed in {bucket}")

    url = _client().generate_presigned_url(
        "put_object",
        Params={"Bucket": bucket, "Key": key, "ContentType": content_type},
        ExpiresIn=ttl,
    )
    return {
        "url": url,
        "method": "PUT",
        "headers": {"Content-Type": content_type},
        "max_bytes": MAX_UPLOAD_BYTES.get(bucket),
        "expires_in": ttl,
    }


def presign_download(bucket: str, key: str, ttl: int = DEFAULT_URL_TTL_SECONDS) -> str:
    """Mint a presigned GET URL for a private object."""
    if bucket not in BUCKETS.values():
        raise ValueError(f"Unknown bucket: {bucket}")
    return _client().generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=ttl,
    )


def delete_object(bucket: str, key: str) -> None:
    if bucket not in BUCKETS.values():
        raise ValueError(f"Unknown bucket: {bucket}")
    _client().delete_object(Bucket=bucket, Key=key)


def check_storage() -> tuple[bool, str]:
    """Health probe — verifies credentials + reachability by listing buckets."""
    try:
        _client().list_buckets()
        return True, ""
    except Exception as exc:  # noqa: BLE001 — surfaced via /health/storage
        return False, str(exc)
