# Бележник – версия с Jekyll

```bash
bundle install
bundle exec jekyll serve    # http://localhost:4000
bundle exec jekyll build    # готовият сайт е в _site/
```

Изисква:
- Ruby 3.2 или по-нов. На Windows: RubyInstaller с DevKit.
- Node.js — KaTeX се рендира през ExecJS.
- ImageMagick (`magick` или `convert`) — за галерията.

## Къде е какво

| Какво | Къде |
| --- | --- |
| Име, описание, `github_user` | `_config.yml` |
| Публикации | `_posts/ГГГГ-ММ-ДД-име.md` |
| Снимки към публикация | `assets/blog/`, в текста `![описание]({{ "/assets/blog/снимка.jpg" \| relative_url }})` |
| Галерия | снимки в `_gallery/`, заглавия и ред в `_data/gallery.json` |
| Проекти без Neon | `_data/projects.json` |
| Neon | `_plugins/lib/neon_projects.rb` (SQL-over-HTTP API на Neon, без gem за Postgres) |
| Liquid тагове (`map`, `repo`) | `_plugins/liquid_tags.rb` |
| KaTeX | `kramdown-math-katex` + `_plugins/math.rb` (`$...$` → `$$...$$` за kramdown) |
| Обработка на снимки | `_plugins/images.rb` (ImageMagick, кеш в `.jekyll-cache/images`) |
| Страници за етикетите | `_plugins/tag_pages.rb` |
| GitHub API | `_plugins/lib/github_data.rb` |
| Шаблони | `_layouts/` и `_includes/` |
| Стил | `assets/css/site.css`, оцветяване на код в `rouge.css` |

## Нова публикация

Създай `_posts/2026-10-20-moyat-post.md`:

```markdown
---
title: Заглавие
description: Едно изречение за списъка и RSS.
date: 2026-10-20
tags: [бележки]
---

Текст с формула $a^2 + b^2 = c^2$.

{% map lat=42.1797 lng=23.5853 zoom=13 %}
42.1797, 23.5853, Мусала
{% endmap %}

{% repo jekyll/jekyll %}
```

Публикация с бъдеща дата не се показва. Черновите слагай в папка `_drafts/` и ги виждаш локално с `bundle exec jekyll serve --drafts`.

## Променливи при билда

| Променлива | За какво |
| --- | --- |
| `DATABASE_URL` | Connection string от Neon. Без нея се ползва `_data/projects.json` |
| `GITHUB_TOKEN` | По-висок лимит за GitHub API (в GitHub Actions се подава автоматично) |

## Публикуване

`.github/workflows/deploy.yml` публикува в GitHub Pages при push в `main` и веднъж на ден. Инсталира Ruby и ImageMagick и билдва с `--baseurl` от настройките на Pages.

В хранилището: **Settings → Pages → Source: GitHub Actions**, а за Neon добави secret `DATABASE_URL`. Вграденият билд на GitHub Pages („Deploy from a branch“) не става, защото не пуска собствени плъгини.
