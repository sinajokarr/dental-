#!/bin/sh
# Daily PostgreSQL backup (runs inside the `backup` service of compose.prod.yml).
# Custom-format dumps restore with: pg_restore --clean --if-exists -d <database> <file>
set -eu
while true; do
  pg_dump --format=custom --file="/backups/jokar-$(date +%F).dump"
  # Keep two weeks of daily dumps.
  find /backups -name 'jokar-*.dump' -mtime +14 -exec rm -f {} +
  sleep 86400
done
