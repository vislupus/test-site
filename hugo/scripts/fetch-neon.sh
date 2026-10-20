#!/usr/bin/env bash
# Hugo не може да говори с Postgres, затова преди билда изтегляме проектите от Neon
# в data/neon/projects.json. Ако DATABASE_URL липсва, сайтът ползва data/projects.json.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[neon] DATABASE_URL не е зададен – ползвам data/projects.json."
  rm -f data/neon/projects.json
  exit 0
fi

mkdir -p data/neon
psql "$DATABASE_URL" --no-psqlrc --tuples-only --no-align -v ON_ERROR_STOP=1 -c "
  select coalesce(json_agg(p), '[]'::json)
  from (
    select id, title, description, year, tags, repo, url, featured
    from projects
    order by featured desc, sort_order asc, year desc nulls last, title asc
  ) p" > data/neon/projects.json.tmp
mv data/neon/projects.json.tmp data/neon/projects.json
echo "[neon] Заредени $(grep -o '"title"' data/neon/projects.json | wc -l) проекта от Neon."
