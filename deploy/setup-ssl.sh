#!/usr/bin/env bash
# Obtain Let's Encrypt certs and enable HTTPS nginx config.
# Run from project root on EC2 after DNS points to this server.
#
# Usage:
#   chmod +x deploy/setup-ssl.sh
#   ./deploy/setup-ssl.sh admin@medprep.study
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DOMAIN="${DOMAIN:-medprep.study}"
EMAIL="${1:-}"

if [[ -z "$EMAIL" ]]; then
  echo "Usage: ./deploy/setup-ssl.sh your-email@example.com"
  exit 1
fi

mkdir -p deploy/certbot/conf deploy/certbot/www

echo "==> Starting stack (HTTP nginx)..."
docker compose up -d

echo "==> Requesting SSL certificate for:"
echo "    ${DOMAIN}, www.${DOMAIN}, api.${DOMAIN}, admin.${DOMAIN}"
docker compose --profile certbot run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  -d "api.$DOMAIN" \
  -d "admin.$DOMAIN"

echo "==> Enabling HTTPS nginx config..."
cp deploy/nginx/templates/medprep-https.conf deploy/nginx/conf.d/medprep.conf

echo "==> Reloading nginx..."
docker compose exec nginx nginx -s reload

echo ""
echo "SSL setup complete."
echo "  https://${DOMAIN}"
echo "  https://api.${DOMAIN}/api/v1/health"
echo "  https://admin.${DOMAIN}"
echo ""
echo "Set up auto-renewal (cron weekly):"
echo "  0 3 * * 1 cd $ROOT && docker compose --profile certbot run --rm certbot renew && docker compose exec nginx nginx -s reload"
