#!/bin/sh
set -e
cd "$(dirname "$0")/.."
mkdir -p certificates
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")
KEY=certificates/localhost-key.pem
CERT=certificates/localhost.pem

if [ -f "$CERT" ] && [ -f "$KEY" ]; then
  echo "Certificati già presenti in certificates/"
  exit 0
fi

echo "Genero certificato HTTPS (IP: $IP)…"
openssl req -x509 -newkey rsa:2048 \
  -keyout "$KEY" \
  -out "$CERT" \
  -days 825 -nodes \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$IP" 2>/dev/null \
  || openssl req -x509 -newkey rsa:2048 \
  -keyout "$KEY" \
  -out "$CERT" \
  -days 825 -nodes \
  -subj "/CN=localhost"

echo "OK: $CERT"
