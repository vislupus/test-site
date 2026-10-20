const MONTHS = ["яну", "фев", "мар", "апр", "май", "юни", "юли", "авг", "сеп", "окт", "ное", "дек"];

export const dateLong = (d) =>
  new Date(d).toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const dateShort = (input) => {
  const d = new Date(input);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

export const isoDate = (d) => new Date(d).toISOString().slice(0, 10);

export const number = (n) => Number(n).toLocaleString("bg-BG");

export const readingTime = (text = "") =>
  Math.max(1, Math.round(String(text).replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 200));

export const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Цветове на езиците (както в GitHub) за малката точка до езика.
export const langColor = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Go: "#00ADD8", Rust: "#dea584",
  "C++": "#f34b7d", C: "#555555", HTML: "#e34c26", CSS: "#663399", Astro: "#ff5a03", Java: "#b07219",
  Shell: "#89e051", Vue: "#41b883", Svelte: "#ff3e00", MDX: "#fcb32c", Nunjucks: "#3d8137",
};
