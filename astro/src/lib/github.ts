// Данни от GitHub API по време на билда (без JavaScript в браузъра).
// В GitHub Actions подай GITHUB_TOKEN, за да не удариш лимита от 60 заявки на час.
const API = (process.env.GITHUB_API_URL || "https://api.github.com").replace(/\/$/, "");
const cache = new Map<string, Promise<any>>();

export interface Repo {
  fullName: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: string | null;
  homepage: string | null;
  pagesUrl: string | null;
}

async function api(path: string): Promise<any | null> {
  if (!cache.has(path)) {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "astro-site-build",
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    cache.set(
      path,
      fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(10_000) })
        .then(async (res) => {
          if (!res.ok) {
            console.warn(`[github] ${path}: HTTP ${res.status}`);
            return null;
          }
          return res.json();
        })
        .catch((err) => {
          console.warn(`[github] ${path}: ${err.message}`);
          return null;
        })
    );
  }
  return cache.get(path)!;
}

function pagesUrl(r: any): string | null {
  if (!r.has_pages) return null;
  const [owner, name] = r.full_name.split("/");
  return name.toLowerCase() === `${owner.toLowerCase()}.github.io`
    ? `https://${owner.toLowerCase()}.github.io/`
    : `https://${owner.toLowerCase()}.github.io/${name}/`;
}

function toRepo(r: any): Repo {
  return {
    fullName: r.full_name,
    url: r.html_url,
    description: r.description,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    language: r.language,
    pushedAt: r.pushed_at,
    homepage: r.homepage || null,
    pagesUrl: pagesUrl(r),
  };
}

/** Едно хранилище, напр. "withastro/astro". Връща null, ако API-то не отговори. */
export async function getRepo(fullName: string): Promise<Repo | null> {
  const data = await api(`/repos/${fullName}`);
  return data ? toRepo(data) : null;
}

/** Последните публични хранилища на потребител (без forks и архивирани). */
export async function getUserRepos(username: string, limit = 8): Promise<Repo[] | null> {
  const data = await api(`/users/${username}/repos?sort=pushed&per_page=100&type=owner`);
  if (!Array.isArray(data)) return null;
  return data.filter((r) => !r.fork && !r.archived).slice(0, limit).map(toRepo);
}
