# syntax=docker/dockerfile:1
# Django API + admin behind gunicorn (ARCHITECTURE.md §7). Static admin files are collected at start-up into a
# volume that Caddy serves (no whitenoise).
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
RUN adduser --system --group --no-create-home app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=app:app . .
# The static volume is initialised from this directory, so it must already belong to the app user.
RUN mkdir -p /app/staticfiles && chown app:app /app/staticfiles
USER app
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "30", "--access-logfile", "-"]
