#!/bin/bash

# Renew Let's Encrypt certificates for app.mon-idelec.fr
# This script should be run periodically (e.g., via cron)

set -e

DOMAIN="app.mon-idelec.fr"
CERTBOT_DIR="./certbot"

echo "🔄 Checking certificate renewal for $DOMAIN..."

if [ ! -d "$CERTBOT_DIR/conf/live/$DOMAIN" ]; then
    echo "❌ No certificates found for $DOMAIN"
    echo "Please run ./init-letsencrypt.sh first"
    exit 1
fi

CERT_FILE="$CERTBOT_DIR/conf/live/$DOMAIN/fullchain.pem"
EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_TIMESTAMP - $CURRENT_TIMESTAMP) / 86400 ))

echo "📅 Certificate expires in $DAYS_UNTIL_EXPIRY days ($EXPIRY_DATE)"

if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
    echo "✅ Certificate is still valid for more than 30 days. No renewal needed."
    exit 0
fi

echo "🔄 Certificate expires soon. Starting renewal process..."

docker-compose -f docker-compose.prod.yml exec certbot \
    certbot renew --webroot -w /var/www/certbot --quiet

if [ $? -eq 0 ]; then
    echo "✅ Certificate renewal successful!"
    
    echo "🔄 Reloading nginx configuration..."
    docker-compose -f docker-compose.prod.yml exec frontend nginx -s reload
    
    echo "🎉 Certificate renewal completed successfully!"
else
    echo "❌ Certificate renewal failed!"
    exit 1
fi
