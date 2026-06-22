#!/usr/bin/env bash
# Diagnose HTTP/HTTPS + Let's Encrypt on EC2. Run from project root:
#   ./deploy/check-ssl.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DOMAIN="${DOMAIN:-medprep.study}"
CERT_DIR="deploy/certbot/conf/live/${DOMAIN}"

echo "=== SSL check for ${DOMAIN} ==="
echo ""

echo "--- DNS ---"
for host in "$DOMAIN" "www.$DOMAIN" "api.$DOMAIN" "admin.$DOMAIN"; do
  ip=$(dig +short "$host" 2>/dev/null | tail -1 || true)
  if [[ -n "$ip" ]]; then
    echo "  OK  $host → $ip"
  else
    echo "  FAIL $host → no DNS record"
  fi
done
echo ""

echo "--- Local ports (host) ---"
for port in 80 443; do
  if ss -tlnp 2>/dev/null | grep -q ":${port} "; then
    echo "  OK  port $port listening"
  else
    echo "  FAIL port $port not listening (check security group + docker compose)"
  fi
done
echo ""

echo "--- Docker ---"
docker compose ps nginx certbot 2>/dev/null || docker compose ps nginx
echo ""

echo "--- Nginx config (443/ssl?) ---"
if grep -q "listen 443 ssl" deploy/nginx/conf.d/medprep.conf 2>/dev/null; then
  echo "  OK  HTTPS blocks present in medprep.conf"
else
  echo "  WARN HTTP-only config — run: ./deploy/setup-ssl.sh admin@${DOMAIN}"
fi
echo ""

echo "--- Certificates ---"
if [[ -f "${CERT_DIR}/fullchain.pem" ]]; then
  echo "  OK  cert found: ${CERT_DIR}/fullchain.pem"
  openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -subject -dates 2>/dev/null || true
else
  echo "  FAIL no cert at ${CERT_DIR}/fullchain.pem"
  echo "       Run: ./deploy/setup-ssl.sh admin@${DOMAIN}"
fi
echo ""

echo "--- Nginx inside container ---"
if docker compose exec -T nginx nginx -t 2>&1; then
  echo "  nginx -t OK"
else
  echo "  nginx config test FAILED"
fi
echo ""

echo "--- HTTP test ---"
curl -sI --connect-timeout 5 "http://${DOMAIN}" | head -3 || echo "  HTTP request failed"
echo ""

echo "--- HTTPS test ---"
if curl -sI --connect-timeout 5 "https://${DOMAIN}" 2>/dev/null | head -3; then
  echo "  HTTPS OK"
else
  echo "  HTTPS failed (connection refused, cert missing, or port 443 closed in AWS security group)"
fi
