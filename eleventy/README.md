# Бележник – версия с Eleventy

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # готовият сайт е в _site/
```

Изисква Node.js 22 или по-нов.

## Къде е какво

| Какво | Къде |
| --- | --- |
| Име, описание, `githubUser` | `src/_data/site.js` |
| Публикации | `src/blog/*.md` |
| Снимки към публикация | `src/blog/images/`, в текста `![описание](./images/снимка.jpg)` |
| Галерия | снимки в `src/gallery/`, заглавия и ред в `src/_data/gallery.json` |
| Проекти без Neon | `data/projects.json` |
| Neon | `lib/neon-projects.js`, викан от `src/_data/projects.js` |
| Shortcode-ове (`map`, `repo`, `gallery`) | `lib/shortcodes.js` |
| GitHub API | `lib/github.js` (кешира отговорите в `.cache/` за един час) |
| Шаблони | `src/_includes/layouts/` и `src/_includes/partials/` |
| Настройки, плъгини, филтри | `eleventy.config.js` |
| Стил | `src/assets/css/site.css`, оцветяване на код в `prism.css` |

## Нова публикация

Създай `src/blog/moyat-post.md`:

```markdown
---
title: Заглавие
description: Едно изречение за списъка и RSS.
date: 2026-10-20
tags: [бележки]
---

Текст с формула $a^2 + b^2 = c^2$.

{% map { lat: 42.1797, lng: 23.5853, zoom: 13, markers: [{ lat: 42.1797, lng: 23.5853, label: "Мусала" }] } %}

{% repo "11ty/eleventy" %}
```

`draft: true` скрива публикацията. Leaflet и CSS-ът на KaTeX се добавят само на страниците, които ги ползват.

## Променливи при билда

| Променлива | За какво |
| --- | --- |
| `DATABASE_URL` | Connection string от Neon. Без нея се ползва `data/projects.json` |
| `GITHUB_TOKEN` | По-висок лимит за GitHub API (в GitHub Actions се подава автоматично) |
| `SITE_URL`, `PATH_PREFIX` | Адрес и подпът в GitHub Pages (подават се от workflow-а) |

## Публикуване

`.github/workflows/deploy.yml` публикува в GitHub Pages при push в `main` и веднъж на ден. В хранилището: **Settings → Pages → Source: GitHub Actions**, а за Neon добави secret `DATABASE_URL`.
