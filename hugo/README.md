# Бележник – версия с Hugo

```bash
hugo server      # http://localhost:1313
hugo --minify    # готовият сайт е в public/
```

Изисква [Hugo](https://gohugo.io/installation/) 0.167 или по-нов. Не е нужен Node.js.

## Къде е какво

| Какво | Къде |
| --- | --- |
| Име, описание, `githubUser` | `hugo.toml` |
| Публикации | `content/blog/*.md` или папка `content/blog/име/index.md`, ако има снимки |
| Снимки към публикация | до `index.md` в папката на публикацията, в текста `![описание](images/снимка.jpg)` |
| Галерия | снимки и заглавия в `content/gallery/` (`index.md` определя реда) |
| Проекти без Neon | `data/projects.json` |
| Neon | `scripts/fetch-neon.sh` записва `data/neon/projects.json` преди билда |
| Shortcode-ове (`map`, `repo`) | `layouts/_shortcodes/` |
| KaTeX | `layouts/_markup/render-passthrough.html` (вграденият `transform.ToMath`) |
| GitHub API | `layouts/_partials/github/` |
| Шаблони | `layouts/` |
| Стил | `assets/css/site.css`, оцветяване на код в `chroma.css` |

## Нова публикация

```bash
hugo new content blog/moyat-post.md
```

```markdown
---
title: Заглавие
description: Едно изречение за списъка и RSS.
date: 2026-10-20
tags: [бележки]
---

Текст с формула $a^2 + b^2 = c^2$.

{{< map lat="42.1797" lng="23.5853" zoom="13" >}}
42.1797, 23.5853, Мусала
{{< /map >}}

{{< repo "gohugoio/hugo" >}}
```

`draft: true` скрива публикацията (виждаш я локално с `hugo server -D`).

## Neon

Шаблоните на Hugo не могат да се свържат с Postgres, затова данните се теглят преди билда с `psql`:

```bash
DATABASE_URL="postgresql://…neon.tech/neondb?sslmode=require" bash scripts/fetch-neon.sh
hugo server
```

Без `DATABASE_URL` скриптът не прави нищо и се ползва `data/projects.json`. `GITHUB_TOKEN` дава по-висок лимит за GitHub API.

## Публикуване

`.github/workflows/deploy.yml` инсталира Hugo, тегли проектите от Neon и публикува в GitHub Pages при push в `main` и веднъж на ден. В хранилището: **Settings → Pages → Source: GitHub Actions**, а за Neon добави secret `DATABASE_URL`.
