// Зарежда проектите от Neon (Postgres) по време на билда.
// - Ако DATABASE_URL е зададен: чете таблицата projects (виж neon/schema.sql).
//   При грешка билдът спира нарочно, за да не се публикува сайт с липсващи данни
//   (GitHub Pages продължава да показва последната успешна версия).
// - Ако DATABASE_URL липсва: чете локалния JSON файл, за да работи всичко и без база.
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

let cached;

export async function loadProjects(localJsonPath) {
  cached ??= load(localJsonPath);
  return cached;
}

async function load(localJsonPath) {
  const url = process.env.DATABASE_URL;

  if (url) {
    const sql = neon(url);
    let rows;
    try {
      rows = await sql`
        select id, title, description, year, tags, repo, url, featured
        from projects
        order by featured desc, sort_order asc, year desc nulls last, title asc`;
    } catch (err) {
      throw new Error(
        `[neon] Заявката към Neon не успя: ${err.message}\n` +
          "Провери DATABASE_URL и дали таблицата projects съществува (neon/schema.sql)."
      );
    }
    console.log(`[neon] Заредени ${rows.length} проекта от Neon.`);
    return { source: "neon", projects: rows.map(normalize) };
  }

  const raw = JSON.parse(await readFile(localJsonPath, "utf8"));
  const projects = raw
    .map(normalize)
    .map((p, i) => ({ ...p, order: i }))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)
    .map(({ order, ...p }) => p);
  console.log(`[neon] DATABASE_URL не е зададен – ползвам ${localJsonPath}.`);
  return { source: "local", projects };
}

function normalize(p, i) {
  return {
    id: String(p.id ?? i + 1),
    title: p.title,
    description: p.description ?? "",
    year: p.year ?? null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    repo: p.repo || null,
    url: p.url || null,
    featured: Boolean(p.featured),
  };
}
