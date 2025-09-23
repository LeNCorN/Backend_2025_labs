#!/bin/sh

set -e

host="$1"
shift
command="$@"

echo "Waiting for PostgreSQL to be available on host: $host"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - executing command: $command"
exec $command