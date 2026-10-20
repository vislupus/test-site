import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { loadProjects } from "./lib/neon-projects.js";

// Блогът: всеки .md / .mdx файл в src/content/blog е публикация.
const blog = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Проектите: от Neon, ако е зададен DATABASE_URL, иначе от src/data/projects.json.
const projects = defineCollection({
  loader: async () => {
    const { source, projects } = await loadProjects("./src/data/projects.json");
    return projects.map((p, i) => ({ ...p, source, order: i }));
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number().nullable(),
    tags: z.array(z.string()),
    repo: z.string().nullable(),
    url: z.string().nullable(),
    featured: z.boolean(),
    source: z.enum(["neon", "local"]),
    order: z.number(),
  }),
});

export const collections = { blog, projects };
