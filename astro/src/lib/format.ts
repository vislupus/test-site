declare const __SITE_BASE__: string;
const base = __SITE_BASE__;

/** Връзка спрямо base (нужно за GitHub Pages на проектно хранилище: /име-на-repo/...). */
export const url = (path = "") => `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

export const dateLong = (d: Date) =>
  d.toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const MONTHS = ["яну", "фев", "мар", "апр", "май", "юни", "юли", "авг", "сеп", "окт", "ное", "дек"];
export const dateShort = (input: Date | string) => {
  const d = new Date(input);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

export const number = (n: number) => n.toLocaleString("bg-BG");

export const readingTime = (text = "") => Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));

export const tagPath = (tag: string) => url(`tags/${tag}/`);

// Цветове на езиците (както в GitHub) за малката точка до езика.
export const langColor: Record<string, string> = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Go: "#00ADD8", Rust: "#dea584",
  "C++": "#f34b7d", C: "#555555", HTML: "#e34c26", CSS: "#663399", Astro: "#ff5a03", Java: "#b07219",
  Shell: "#89e051", Vue: "#41b883", Svelte: "#ff3e00", MDX: "#fcb32c", Nunjucks: "#3d8137",
};
