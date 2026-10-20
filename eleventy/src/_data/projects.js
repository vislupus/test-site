// Проектите: от Neon, ако е зададен DATABASE_URL, иначе от data/projects.json.
// Всеки проект с поле repo се обогатява с данни от GitHub (звезди, език, последна промяна).
import { loadProjects } from "../../lib/neon-projects.js";
import { getRepo } from "../../lib/github.js";

export default async function () {
  const { source, projects } = await loadProjects("./data/projects.json");
  const items = await Promise.all(projects.map(async (p) => ({ ...p, gh: p.repo ? await getRepo(p.repo) : null })));
  return { source, items, featured: items.filter((p) => p.featured) };
}
