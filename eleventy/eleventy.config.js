import { HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { katex } from "@mdit/plugin-katex";
import site from "./src/_data/site.js";
import { mapShortcode, repoShortcode, galleryShortcode, repoMetaHtml } from "./lib/shortcodes.js";
import { dateLong, dateShort, isoDate, readingTime, number, langColor } from "./lib/format.js";

export default function (eleventyConfig) {
  // --- Файлове, които се копират без промяна ---
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets", "src/favicon.svg": "favicon.svg" });
  // Leaflet и KaTeX се хостват локално от node_modules (без CDN).
  eleventyConfig.addPassthroughCopy({
    "node_modules/leaflet/dist/leaflet.js": "assets/vendor/leaflet/leaflet.js",
    "node_modules/leaflet/dist/leaflet.css": "assets/vendor/leaflet/leaflet.css",
    "node_modules/katex/dist/katex.min.css": "assets/vendor/katex/katex.min.css",
    // Само woff2 – всички съвременни браузъри го поддържат.
    "node_modules/katex/dist/fonts/*.woff2": "assets/vendor/katex/fonts",
  });

  // --- Плъгини ---
  eleventyConfig.addPlugin(HtmlBasePlugin); // добавя pathPrefix към всички абсолютни връзки
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // Всяка <img> в публикациите става WebP в няколко размера (със srcset).
    formats: ["webp"],
    widths: [800, 1400],
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async", sizes: "(min-width: 48rem) 44rem, 100vw" },
    },
  });
  eleventyConfig.addPlugin(feedPlugin, {
    type: "rss",
    outputPath: "/rss.xml",
    collection: { name: "posts", limit: 20 },
    metadata: { language: "bg", title: site.title, subtitle: site.description, base: site.url, author: { name: site.author } },
  });

  // --- Markdown: $...$ и $$...$$ се рендират с KaTeX при билда ---
  eleventyConfig.amendLibrary("md", (md) => md.use(katex, { output: "htmlAndMathml", throwOnError: false }));

  // --- Колекции ---
  const isPublished = (p) => !p.data.draft;
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/blog/*.md").filter(isPublished).sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("tagList", (api) => {
    const counts = new Map();
    for (const p of api.getFilteredByGlob("src/blog/*.md").filter(isPublished))
      for (const t of p.data.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name, "bg"));
  });

  // --- Филтри и shortcode-ове ---
  eleventyConfig.addFilter("dateLong", dateLong);
  eleventyConfig.addFilter("dateShort", dateShort);
  eleventyConfig.addFilter("isoDate", isoDate);
  eleventyConfig.addFilter("readingTime", readingTime);
  eleventyConfig.addFilter("number", number);
  eleventyConfig.addFilter("langColor", (lang) => langColor[lang] ?? "var(--slate)");
  eleventyConfig.addFilter("withTag", (posts, tag) => posts.filter((p) => (p.data.tags ?? []).includes(tag)));
  eleventyConfig.addFilter("includes", (html, needle) => String(html ?? "").includes(needle));
  eleventyConfig.addFilter("repoMeta", repoMetaHtml);

  eleventyConfig.addShortcode("map", mapShortcode); // {% map { lat: .., lng: .., markers: [...] } %}
  eleventyConfig.addAsyncShortcode("repo", repoShortcode); // {% repo "owner/name" %}
  eleventyConfig.addAsyncShortcode("gallery", galleryShortcode); // {% gallery %}
}

export const config = {
  dir: { input: "src", output: "_site" },
  // Nunjucks в Markdown, за да работят {% map %} и {% repo %} в публикациите.
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
  // PATH_PREFIX се подава от GitHub Actions (напр. /име-на-repo/).
  pathPrefix: process.env.PATH_PREFIX || "/",
};
