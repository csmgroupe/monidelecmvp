#!/usr/bin/env bash
set -e

# ─── Configuration ─────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >& /dev/null && pwd)"
CERTBOT_DIR="$SCRIPT_DIR/certbot"
DOMAIN="app.mon-idelec.fr"
RSA_KEY_SIZE=4096
DEFAULT_EMAIL="admin@mon-idelec.fr"
EMAIL="${SSL_EMAIL:-$DEFAULT_EMAIL}"

# ─── Load .env.prod (if present) ───────────────────────────────────────────────
if [ -f "$SCRIPT_DIR/.env.prod" ]; then
  echo "🔑 Loading environment from .env.prod..."
  set -o allexport
  source <(grep -v '^\s*#' "$SCRIPT_DIR/.env.prod")
  set +o allexport
  EMAIL="${SSL_EMAIL:-$EMAIL}"
fi

echo "🔒 Initializing Let's Encrypt for $DOMAIN…"

# ─── Prepare directories ────────────────────────────────────────────────────────
mkdir -p \
  "$CERTBOT_DIR/conf" \
  "$CERTBOT_DIR/lib" \
  "$CERTBOT_DIR/log" \
  "$CERTBOT_DIR/www"

# ─── Existing‐certificate logic ─────────────────────────────────────────────────
if [ -d "$CERTBOT_DIR/conf/live/$DOMAIN" ]; then
  echo "⚠️  Certificates for $DOMAIN already exist!"
  read -p "Do you want to recreate them? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Using existing certificates. You can now run ./deploy.sh"
    exit 0
  fi
  echo "🗑️  Removing existing certificates..."
  sudo rm -rf \
    "$CERTBOT_DIR/conf/live/$DOMAIN" \
    "$CERTBOT_DIR/conf/archive/$DOMAIN" \
    "$CERTBOT_DIR/conf/renewal/$DOMAIN.conf"
fi

# ─── DNS check ──────────────────────────────────────────────────────────────────
echo "🔍 Checking DNS configuration for $DOMAIN..."
DOMAIN_IP=$(dig +short "$DOMAIN")
if [ -z "$DOMAIN_IP" ]; then
  echo "❌ Error: Domain $DOMAIN does not resolve to an IP address!"
  echo "Please configure your DNS to point to this server’s IP address."
  exit 1
fi
echo "✅ Domain $DOMAIN resolves to: $DOMAIN_IP"

# ─── Fire up temporary Nginx for HTTP-01 challenge ─────────────────────────────
echo "🚀 Starting temporary web server for Let's Encrypt challenge..."
cat > "$CERTBOT_DIR/nginx-temp.conf" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 200 'Let\'s Encrypt challenge server';
        add_header Content-Type text/plain;
    }
}
EOF

docker run -d --name temp-nginx \
  -p 80:80 \
  -v "$CERTBOT_DIR/www:/var/www/certbot" \
  -v "$CERTBOT_DIR/nginx-temp.conf:/etc/nginx/conf.d/default.conf" \
  nginx:alpine

sleep 3

# ─── Request the certificate ───────────────────────────────────────────────────
echo "📜 Requesting SSL certificate from Let's Encrypt..."
docker run --rm \
  -v "$CERTBOT_DIR/conf:/etc/letsencrypt" \
  -v "$CERTBOT_DIR/lib:/var/lib/letsencrypt" \
  -v "$CERTBOT_DIR/log:/var/log/letsencrypt" \
  -v "$CERTBOT_DIR/www:/var/www/certbot" \
  certbot/certbot certonly \
    --config-dir    /etc/letsencrypt \
    --work-dir      /var/lib/letsencrypt \
    --logs-dir      /var/log/letsencrypt \
    --webroot       -w /var/www/certbot \
    --email         "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    --rsa-key-size  "$RSA_KEY_SIZE" \
    -d "$DOMAIN"
CERTBOT_EXIT=$?

# ─── Tear down temporary server ────────────────────────────────────────────────
echo "🛑 Stopping temporary web server..."
docker stop temp-nginx >/dev/null
docker rm   temp-nginx >/dev/null
rm "$CERTBOT_DIR/nginx-temp.conf"

# ─── Fix permissions so you can read the cert files ────────────────────────────
echo "🔧 Adjusting certificate file ownership..."
sudo chown -R "$(id -u):$(id -g)" "$CERTBOT_DIR/conf"

# ─── Final outcome ──────────────────────────────────────────────────────────────
if [ $CERTBOT_EXIT -ne 0 ]; then
  echo "❌ Failed to obtain SSL certificate!"
  echo "Please check the logs in $CERTBOT_DIR/log for errors."
  exit 1
else
  echo "✅ SSL certificate successfully obtained for $DOMAIN"
  echo "📅 Certificate expires at: $(openssl x509 -enddate -noout -in "$CERTBOT_DIR/conf/live/$DOMAIN/fullchain.pem")"
  echo ""
  echo "🚀 You can now:"
  echo "   1. Ensure your .env.prod is configured"
  echo "   2. chmod +x deploy.sh"
  echo "   3. ./deploy.sh"
  exit 0
fi
