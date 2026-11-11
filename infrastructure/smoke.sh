#!/bin/sh
# Smoke test of a running production stack (H06/H07):
#   ADMIN_PATH=<DJANGO_ADMIN_PATH> sh infrastructure/smoke.sh https://<domain>
# -k accepts Caddy's local certificate when the domain is localhost; drop it to also verify the real certificate.
set -eu
BASE=${1:?usage: smoke.sh <base-url>}

check() {
  got=$(curl -sk -o /dev/null -w '%{http_code}' "$2")
  if [ "$got" = "$1" ]; then echo "ok    $1  $3"; else echo "FAIL  $3: expected $1, got $got"; exit 1; fi
}

check 200 "$BASE/en" "home (en)"
check 200 "$BASE/fa" "home (fa)"
check 200 "$BASE/de/zahnimplantate" "treatment page (de)"
check 200 "$BASE/tr/ucretsiz-danismanlik" "consultation page (tr)"
check 200 "$BASE/sitemap.xml" "sitemap"
check 200 "$BASE/robots.txt" "robots"
check 404 "$BASE/en/no-such-page" "localized 404"
check 404 "$BASE/api/v1/leads/" "lead API not reachable from outside (D-033)"
check 404 "$BASE/api/v1/health/" "health endpoint internal only"
if [ -n "${ADMIN_PATH:-}" ]; then
  check 302 "$BASE/$ADMIN_PATH/" "admin redirects to its login"
  check 200 "$BASE/django-static/admin/css/base.css" "admin static files"
fi

headers=$(curl -skI "$BASE/en")
for name in strict-transport-security content-security-policy x-frame-options x-content-type-options referrer-policy permissions-policy; do
  if echo "$headers" | grep -qi "^$name:"; then echo "ok    header $name"; else echo "FAIL  missing header $name"; exit 1; fi
done
if echo "$headers" | grep -qi "^server:"; then echo "FAIL  Server header exposed"; exit 1; fi
echo "ok    no Server header"
echo "smoke test passed: $BASE"
