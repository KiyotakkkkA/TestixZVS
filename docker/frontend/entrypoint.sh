#!/usr/bin/env sh
set -e

node /app/server.js &

exec nginx -g "daemon off;"
