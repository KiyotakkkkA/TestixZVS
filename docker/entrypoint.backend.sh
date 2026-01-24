#!/usr/bin/env sh
set -e

if [ -d /var/www/backend/storage ]; then
  chown -R www-data:www-data /var/www/backend/storage || true
  chmod -R 775 /var/www/backend/storage || true
fi

if [ -d /var/www/backend/bootstrap/cache ]; then
  chown -R www-data:www-data /var/www/backend/bootstrap/cache || true
  chmod -R 775 /var/www/backend/bootstrap/cache || true
fi

exec php-fpm
