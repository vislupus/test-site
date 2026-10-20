import { readFile } from "node:fs/promises";
import Image from "@11ty/eleventy-img";
import { getRepo } from "./github.js";
import { escapeHtml, dateShort, number, langColor } from "./format.js";

// {% map { lat: 42.2, lng: 23.3, zoom: 13, markers: [{ lat: .., lng: .., label: ".." }], route: true, fit: true, caption: ".." } %}
// Връща HTML на един ред (празен ред би прекъснал HTML блока в Markdown).
export function mapShortcode({ lat, lng, zoom = 12, markers = [], route = false, fit = false, caption = "", height } = {}) {
  const osm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
  const label = caption ? `Карта: ${caption}` : "Карта";
  return (
    `<figure class="map-figure"><div class="map" role="region" aria-label="${escapeHtml(label)}"` +
    ` data-lat="${lat}" data-lng="${lng}" data-zoom="${zoom}" data-markers="${escapeHtml(JSON.stringify(markers))}"` +
    ` data-route="${Boolean(route)}" data-fit="${Boolean(fit)}"${height ? ` style="height: ${escapeHtml(height)}"` : ""}></div>` +
    `<figcaption>${caption ? `<span>${escapeHtml(caption)}</span>` : ""}<a href="${osm}">Отвори в OpenStreetMap</a></figcaption></figure>`
  );
}

export function repoMetaHtml(repo) {
  const items = [];
  if (repo.language)
    items.push(`<li><span class="lang-dot" style="--lang: ${langColor[repo.language] ?? "var(--slate)"}"></span>${escapeHtml(repo.language)}</li>`);
  items.push(`<li aria-label="${repo.stars} звезди">★ ${number(repo.stars)}</li>`);
  if (repo.forks > 0) items.push(`<li>${number(repo.forks)} разклонения</li>`);
  if (repo.pushedAt) items.push(`<li>обновено ${dateShort(repo.pushedAt)}</li>`);
  return `<ul class="repo-meta">${items.join("")}</ul>`;
}

// {% repo "owner/name" %} – карта на хранилище с данни от GitHub API (при билда).
export async function repoShortcode(fullName) {
  const repo = await getRepo(fullName);
  if (!repo)
    return `<aside class="repo-card is-offline"><a class="repo-name" href="https://github.com/${escapeHtml(fullName)}">${escapeHtml(fullName)}</a></aside>`;
  return (
    `<aside class="repo-card"><a class="repo-name" href="${repo.url}">${escapeHtml(repo.fullName)}</a>` +
    (repo.description ? `<p class="repo-desc">${escapeHtml(repo.description)}</p>` : "") +
    repoMetaHtml(repo) +
    `</aside>`
  );
}

// {% gallery %} или {% gallery { limit: 4, strip: true } %}
// Eleventy Image прави WebP в няколко размера; връзката води към версия 1600 px за lightbox-а.
export async function galleryShortcode({ limit, strip = false } = {}) {
  const list = JSON.parse(await readFile("./src/_data/gallery.json", "utf8")).slice(0, limit);
  const items = await Promise.all(
    list.map(async ({ file, title }) => {
      const meta = await Image(`./src/gallery/${file}`, {
        widths: [400, 800, 1600],
        formats: ["webp"],
        outputDir: "./_site/img/",
        urlPath: "/img/",
      });
      const sizes = meta.webp;
      const thumbs = sizes.filter((s) => s.width <= 800);
      const full = sizes.at(-1);
      const small = thumbs[0];
      return (
        `<li><figure><a href="${full.url}" data-lightbox data-caption="${escapeHtml(title)}">` +
        `<img eleventy:ignore src="${small.url}" srcset="${thumbs.map((s) => s.srcset).join(", ")}"` +
        ` sizes="(min-width: 72rem) 22rem, (min-width: 40rem) 45vw, 100vw" width="${small.width}" height="${small.height}"` +
        ` alt="${escapeHtml(title)}" loading="lazy" decoding="async"></a>` +
        (strip ? "" : `<figcaption>${escapeHtml(title)}</figcaption>`) +
        `</figure></li>`
      );
    })
  );
  return `<ul class="gallery${strip ? " gallery-strip" : ""}">${items.join("")}</ul>`;
}
