// Данни от GitHub API по време на билда, с кеш на диска (@11ty/eleventy-fetch, папка .cache).
// В GitHub Actions подай GITHUB_TOKEN, за да не удариш лимита от 60 заявки на час.
import EleventyFetch from "@11ty/eleventy-fetch";

const API = (process.env.GITHUB_API_URL || "https://api.github.com").replace(/\/$/, "");

async function api(path) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "eleventy-site-build",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    return await EleventyFetch(`${API}${path}`, {
      duration: "1h",
      type: "json",
      fetchOptions: { headers, signal: AbortSignal.timeout(10_000) },
    });
  } catch (err) {
    console.warn(`[github] ${path}: ${err.message.split("\n")[0]}`);
    return null;
  }
}

function pagesUrl(r) {
  if (!r.has_pages) return null;
  const [owner, name] = r.full_name.split("/");
  return name.toLowerCase() === `${owner.toLowerCase()}.github.io`
    ? `https://${owner.toLowerCase()}.github.io/`
    : `https://${owner.toLowerCase()}.github.io/${name}/`;
}

const toRepo = (r) => ({
  fullName: r.full_name,
  name: r.name,
  url: r.html_url,
  description: r.description,
  stars: r.stargazers_count ?? 0,
  forks: r.forks_count ?? 0,
  language: r.language,
  pushedAt: r.pushed_at,
  homepage: r.homepage || null,
  pagesUrl: pagesUrl(r),
});

/** Едно хранилище, напр. "11ty/eleventy". Връща null, ако API-то не отговори. */
export async function getRepo(fullName) {
  const data = await api(`/repos/${fullName}`);
  return data ? toRepo(data) : null;
}

/** Последните публични хранилища на потребител (без forks и архивирани). */
export async function getUserRepos(username, limit = 8) {
  const data = await api(`/users/${username}/repos?sort=pushed&per_page=100&type=owner`);
  if (!Array.isArray(data)) return null;
  return data.filter((r) => !r.fork && !r.archived).slice(0, limit).map(toRepo);
}
