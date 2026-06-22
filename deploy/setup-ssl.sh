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

CERT_DOMAINS=(-d "$DOMAIN" -d "api.$DOMAIN" -d "admin.$DOMAIN")
if dig +short "www.$DOMAIN" | grep -q .; then
  CERT_DOMAINS+=(-d "www.$DOMAIN")
else
  echo "    (skipping www.$DOMAIN — no DNS record; add A/CNAME for www if you need it)"
fi

docker compose --profile certbot run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  "${CERT_DOMAINS[@]}"

if [[ ! -f "deploy/certbot/conf/live/${DOMAIN}/fullchain.pem" ]]; then
  echo "ERROR: Certificate files not found after certbot. Check errors above."
  exit 1
fi

echo "==> Enabling HTTPS nginx config..."
cp deploy/nginx/templates/medprep-https.conf deploy/nginx/conf.d/medprep.conf

echo "==> Restarting nginx (reload is not enough after adding SSL)..."
docker compose restart nginx
sleep 2
docker compose exec nginx nginx -t

echo ""
echo "SSL setup complete."
echo "  https://${DOMAIN}"
echo "  https://api.${DOMAIN}/api/v1/health"
echo "  https://admin.${DOMAIN}"
echo ""
echo "Set up auto-renewal (cron weekly):"
echo "  0 3 * * 1 cd $ROOT && docker compose --profile certbot run --rm certbot renew && docker compose exec nginx nginx -s reload"
