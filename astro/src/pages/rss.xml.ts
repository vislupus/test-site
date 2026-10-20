import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE } from "../site.config";
import { url } from "../lib/format";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: new URL(url(), context.site).href,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: url(`blog/${p.id}/`),
      categories: p.data.tags,
    })),
    customData: "<language>bg</language>",
  });
}
