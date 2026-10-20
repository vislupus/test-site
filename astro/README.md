# Бележник – версия с Astro

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # готовият сайт е в dist/
```

Изисква Node.js 22.22 или по-нов.

## Къде е какво

| Какво | Къде |
| --- | --- |
| Име, описание, `githubUser` | `src/site.config.ts` |
| Публикации | `src/content/blog/*.md` (обикновени) и `*.mdx` (с карти или карти на хранилища) |
| Снимки към публикация | `src/content/blog/images/`, в текста `![описание](./images/снимка.jpg)` |
| Галерия | снимки в `src/assets/gallery/`, заглавия и ред в `src/data/gallery.json` |
| Проекти без Neon | `src/data/projects.json` |
| Neon | `src/lib/neon-projects.js`, колекция `projects` в `src/content.config.ts` |
| Компоненти | `src/components/` (`Map.astro`, `RepoCard.astro`, `Gallery.astro` …) |
| Страници | `src/pages/` |
| Стил | `src/styles/site.css` |
| KaTeX | `src/lib/satteri-katex.mjs` (плъгин за Markdown процесора на Astro 7) |

## Нова публикация

Създай `src/content/blog/moyat-post.md`:

```markdown
---
title: Заглавие
description: Едно изречение за списъка и RSS.
date: 2026-10-20
tags: [бележки]
---

Текст с формула $a^2 + b^2 = c^2$.
```

За карта или карта на хранилище файлът трябва да е `.mdx`. `Map` и `RepoCard` са достъпни без `import`:

```mdx
<Map lat={42.1797} lng={23.5853} zoom={13} markers={[{ lat: 42.1797, lng: 23.5853, label: "Мусала" }]} />

<RepoCard repo="withastro/astro" />
```

`draft: true` скрива публикацията.

## Променливи при билда

| Променлива | За какво |
| --- | --- |
| `DATABASE_URL` | Connection string от Neon. Без нея се ползва `src/data/projects.json` |
| `GITHUB_TOKEN` | По-висок лимит за GitHub API (в GitHub Actions се подава автоматично) |
| `SITE_URL`, `BASE_PATH` | Адрес и подпът в GitHub Pages (подават се от workflow-а) |

## Публикуване

`.github/workflows/deploy.yml` публикува в GitHub Pages при push в `main` и веднъж на ден. В хранилището: **Settings → Pages → Source: GitHub Actions**, а за Neon добави secret `DATABASE_URL`.
