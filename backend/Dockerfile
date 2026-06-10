# DalanHealth API — FastAPI + Uvicorn on Python 3.12.
# Built by Railway from this Dockerfile (see railway.json). Railway injects
# PORT at runtime; default 8000 keeps `docker run` working locally.

FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dependency layer first — cached unless requirements.txt changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as non-root.
RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Container-level healthcheck (Railway also probes /health over HTTP).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,os;urllib.request.urlopen(f'http://127.0.0.1:{os.environ.get(\"PORT\",8000)}/health')" || exit 1

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
