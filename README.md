# Един сайт, четири генератора: Astro, Eleventy, Hugo, Jekyll

Едно и също съдържание и същите функции, направени четири пъти, за да избереш с какво да продължиш:

- **Блог** с Markdown файлове, етикети и RSS
- **KaTeX формули** (`$...$` и `$$...$$`), рендирани при билда. CSS-ът им се зарежда само на страници с формули
- **Карти** (Leaflet + OpenStreetMap) в отделни публикации. JavaScript-ът се зарежда само там
- **Карти на хранилища** от GitHub (описание, звезди, език) с данни от GitHub API при билда
- **Проекти** от **Neon** (Postgres). Без база се ползва локален JSON
- **Последни хранилища** от твоя GitHub профил на страницата „Проекти“
- **Галерия** с автоматично преоразмеряване на снимките (WebP) и lightbox
- Светла и тъмна тема, мобилна версия, публикуване в **GitHub Pages** с GitHub Actions

```
.
├── astro/        Astro 7      (компоненти, TypeScript, MDX)
├── eleventy/     Eleventy 3   (Nunjucks шаблони, обикновен JavaScript)
├── hugo/         Hugo 0.167   (Go шаблони, един изпълним файл, без Node)
├── jekyll/       Jekyll 4.4   (Liquid шаблони, плъгини на Ruby)
├── compare/      страницата за сравнение (index.html)
└── .github/workflows/compare.yml   билдва и публикува четирите заедно
```

## 1. Публикувай четирите версии за сравнение

1. Направи ново хранилище в GitHub (например `ssg-test`) и качи съдържанието на тази папка в него.
2. В хранилището: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Направи push в `main` (или пусни workflow-а ръчно от таба **Actions**).

След около две минути сайтът е на:

| Адрес | Какво има |
| --- | --- |
| `https://<потребител>.github.io/ssg-test/` | Страница за сравнение с времената за билд |
| `…/ssg-test/astro/` | Версията с Astro |
| `…/ssg-test/eleventy/` | Версията с Eleventy |
| `…/ssg-test/hugo/` | Версията с Hugo |
| `…/ssg-test/jekyll/` | Версията с Jekyll |

Времената за билд се виждат и в GitHub, в таба **Actions** → последното пускане → **Summary**.

## 2. Пусни ги локално

Нужни са:
- Node.js 22.22 или по-нов — за Astro и Eleventy, а и за KaTeX в Jekyll;
- [Hugo](https://gohugo.io/installation/) 0.167 или по-нов;
- за Jekyll — Ruby 3.2 или по-нов и [ImageMagick](https://imagemagick.org/script/download.php). На Windows Ruby идва от [RubyInstaller](https://rubyinstaller.org/) с DevKit.

```bash
cd astro    && npm install && npm run dev                      # http://localhost:4321
cd eleventy && npm install && npm run dev                      # http://localhost:8080
cd hugo     && hugo server                                     # http://localhost:1313
cd jekyll   && bundle install && bundle exec jekyll serve      # http://localhost:4000
```

## 3. Как изглежда писането във всяка версия

**Формули** – еднакво навсякъде, директно в Markdown. Kramdown в Jekyll сам разбира само `$$`, затова малък плъгин превръща `$...$` в `$$...$$` преди рендирането:

```markdown
Тъждеството на Ойлер: $e^{i\pi} + 1 = 0$

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$
```

**Карта** в публикация:

<table>
<tr><th>Astro (файлът е <code>.mdx</code>)</th></tr>
<tr><td>

```mdx
<Map lat={42.2035} lng={23.3175} zoom={14} route fit
  caption="Маршрут покрай езерата"
  markers={[
    { lat: 42.2152, lng: 23.3268, label: "Хижа" },
    { lat: 42.2118, lng: 23.3236, label: "Долното езеро" },
  ]} />
```

</td></tr>
<tr><th>Eleventy (обикновен <code>.md</code>)</th></tr>
<tr><td>

```njk
{% map {
  lat: 42.2035, lng: 23.3175, zoom: 14, route: true, fit: true,
  caption: "Маршрут покрай езерата",
  markers: [
    { lat: 42.2152, lng: 23.3268, label: "Хижа" },
    { lat: 42.2118, lng: 23.3236, label: "Долното езеро" }
  ]
} %}
```

</td></tr>
<tr><th>Hugo (обикновен <code>.md</code>, по един маркер на ред)</th></tr>
<tr><td>

```go-html-template
{{< map lat="42.2035" lng="23.3175" zoom="14" route="true" fit="true" caption="Маршрут покрай езерата" >}}
42.2152, 23.3268, Хижа
42.2118, 23.3236, Долното езеро
{{< /map >}}
```

</td></tr>
<tr><th>Jekyll (обикновен <code>.md</code>, по един маркер на ред)</th></tr>
<tr><td>

```liquid
{% map lat=42.2035 lng=23.3175 zoom=14 route fit caption="Маршрут покрай езерата" %}
42.2152, 23.3268, Хижа
42.2118, 23.3236, Долното езеро
{% endmap %}
```

</td></tr>
</table>

**Карта на хранилище от GitHub:**

| Astro (`.mdx`) | Eleventy | Hugo | Jekyll |
| --- | --- | --- | --- |
| `<RepoCard repo="withastro/astro" />` | `{% repo "11ty/eleventy" %}` | `{{< repo "gohugoio/hugo" >}}` | `{% repo jekyll/jekyll %}` |

**Снимка в галерията:**

| Astro | Eleventy | Hugo | Jekyll |
| --- | --- | --- | --- |
| файл в `src/assets/gallery/` + ред в `src/data/gallery.json` | файл в `src/gallery/` + ред в `src/_data/gallery.json` | файл в `content/gallery/` + ред в `content/gallery/index.md` | файл в `_gallery/` + ред в `_data/gallery.json` |

## 4. Свързване с Neon

Сайтът в GitHub Pages е статичен, затова базата се чете **по време на билда**, а не в браузъра. Паролата към базата остава в GitHub Secrets и никога не стига до посетителите. Данните се обновяват при всеки push, при ръчно пускане на workflow-а, а самостоятелните workflow-и във всяка папка се пускат и всеки ден автоматично.

1. Създай проект в [console.neon.tech](https://console.neon.tech).
2. В **SQL Editor** изпълни `neon/schema.sql`, после по желание `neon/seed.sql` (примерни данни, първият проект завършва на „(от Neon)“, за да видиш разликата).
3. Препоръчително: създай роля само за четене (командите са в края на `schema.sql`) и ползвай нейния connection string.
4. В GitHub: **Settings → Secrets and variables → Actions → New repository secret**, име `DATABASE_URL`, стойност – connection string-ът от Neon (`postgresql://…neon.tech/neondb?sslmode=require`).
5. Пусни workflow-а отново. Отдолу на страницата „Проекти“ пише откъде са заредени данните.

Локално: `DATABASE_URL="postgresql://…" npm run build` (Astro, Eleventy), `DATABASE_URL="…" bash scripts/fetch-neon.sh && hugo server` (Hugo) или `DATABASE_URL="…" bundle exec jekyll serve` (Jekyll).

| | Как се чете Neon |
| --- | --- |
| Astro | `@neondatabase/serverless` в content collection `projects` (`src/content.config.ts`) |
| Eleventy | `@neondatabase/serverless` в глобални данни (`src/_data/projects.js`) |
| Hugo | Шаблоните на Hugo не могат да говорят с Postgres, затова `scripts/fetch-neon.sh` записва JSON с `psql` преди билда |
| Jekyll | Плъгин на Ruby вика SQL-over-HTTP API на Neon (`_plugins/lib/neon_projects.rb`), без gem за Postgres |

Ако заявката към Neon се провали, билдът спира нарочно. Така GitHub Pages продължава да показва последната работеща версия, вместо сайт с празна страница „Проекти“.

## 5. Свързване на други хранилища

- **Карти в публикациите**: `RepoCard` / `repo` по-горе. Ако GitHub API не отговори, остава просто връзка.
- **Страница „Проекти“**: всеки проект с поле `repo` показва звездите, езика и последната промяна; ако хранилището има GitHub Pages, се появява връзка „Отвори сайта“.
- **Последни хранилища**: задай потребителското си име (`githubUser`, в Jekyll `github_user`) и страницата „Проекти“ показва последните ти публични хранилища (без forks и архивирани).
- **Други сайтове в GitHub Pages**: всяко твое хранилище с включен Pages автоматично е на `https://<потребител>.github.io/<хранилище>/`, до основния ти сайт. Ако сложиш избрания генератор в хранилище с име `<потребител>.github.io`, той става основният сайт на `https://<потребител>.github.io/`.

## 6. Сравнение

Тестовото съдържание е едно и също: 4 публикации, 6 снимки, 4 проекта. Билдът в GitHub Actions е без кеш, с проектите от Neon и данните от GitHub API, и четирите версии минават една след друга на една и съща машина. Повторният билд е с кеш и е измерен локално.

| | Astro 7.4 | Eleventy 3.1 | Hugo 0.167 | Jekyll 4.4 |
| --- | --- | --- | --- | --- |
| Билд в GitHub Actions | 5,1 с | 4,1 с | 4,6 с ¹ | 7,0 с |
| Повторен билд | 3,0 с | 1,4 с | **0,12 с** | ≈ 3,5 с ² |
| Какво трябва да е инсталирано | Node.js; ≈ 210 npm пакета, 230 MB | Node.js; ≈ 160 npm пакета, 90 MB | 1 изпълним файл | Ruby, 38 gems, Node.js (за KaTeX) и ImageMagick |
| Готов сайт | 0,9 MB, 51 файла | 1,2 MB, 76 файла ³ | 0,7 MB, 54 файла | 0,7 MB, 53 файла |
| JS на статия без карта | 0 KB | 0 KB | 0 KB | 0 KB |
| JS на страница с карта | 147 KB (Leaflet) | 146 KB (Leaflet) | 145 KB (Leaflet) | 146 KB (Leaflet) |
| JS на галерията (lightbox) | ≈ 1 KB, вграден в HTML | 1,8 KB | 1,3 KB | 1,8 KB |
| Код за шаблони и логика | ≈ 610 реда | ≈ 460 реда | ≈ 440 реда | ≈ 760 реда, от тях ≈ 400 на Ruby |
| Език на шаблоните | Astro компоненти (JSX-подобни) + TypeScript | Nunjucks + JavaScript | Go templates | Liquid + плъгини на Ruby |
| Карти и компоненти в текста | MDX компоненти с довършване в редактора | Shortcode с JS обект | Shortcode, маркери по редове | Liquid таг, маркери по редове |
| Схема за front matter | Да – липсващо заглавие или описание спира билда с ясна грешка | Няма | Няма | Няма |
| Снимки (WebP, няколко размера) | Вградено | Официален плъгин | Вградено | Собствен плъгин с ImageMagick |
| Neon | Директно от Node | Директно от Node | Отделна стъпка с `psql` | HTTP API на Neon от плъгин |

¹ Почти цялото време в студения билд на Hugo отива за кодиране на WebP снимките. Hugo пази резултата в кеш, затова всеки следващ билд е под 0,2 с.
² Измерено в GitHub Actions. Всяка формула пуска отделен процес на Node.js, затова при много формули Jekyll става осезаемо по-бавен.
³ Eleventy копира Leaflet и шрифтовете на KaTeX в сайта (без CDN), а RSS съдържа целия текст на публикациите.

**Astro** – най-удобното писане на богато съдържание: `<Map>` и `<RepoCard>` в MDX са истински компоненти с довършване в редактора, а front matter-ът се проверява по схема. Ако някой ден поискаш интерактивна част (търсачка, филтър на проектите), добавяш компонент на React, Svelte или Vue само за нея. Минусите: най-много зависимости, по-бавен повторен билд и бързи промени между версиите – Astro 7 смени Markdown процесора (Sätteri), затова KaTeX тук е малък собствен плъгин, а не готовият `rehype-katex`.

**Eleventy** – най-малко магия: шаблони, данни и JavaScript функции, които виждаш директно. Добавянето на нещо ново (Neon, GitHub API, галерия) е обикновена async функция. Бърз е и стабилен между версиите. Минусите: Nunjucks shortcode-овете в Markdown са по-малко удобни от компоненти, няма схема за front matter-а и повече неща се сглобяват на ръка.

**Hugo** – най-бърз и без Node.js. KaTeX (`transform.ToMath`), преоразмеряването на снимки, RSS и етикетите са вградени. Минусите: Go шаблоните са най-трудни за четене и дебъгване, и не може да говори с база данни, затова Neon минава през отделен скрипт.

**Jekyll** – класиката на GitHub Pages. Liquid шаблоните са прости и приличат на тези в Eleventy, а публикациите са обикновени файлове в `_posts/`. За тези изисквания обаче почти нищо не е вградено: страниците за етикетите, преоразмеряването на снимки, картите, картите на хранилища, `$...$` за KaTeX и Neon са собствени плъгини на Ruby. Вграденият билд на GitHub Pages не пуска такива плъгини, така че и тук трябва GitHub Actions. Освен това иска три среди (Ruby, Node.js и ImageMagick), билдът е най-бавен, а последната версия (4.4.1) е от януари 2025.

**Ако трябва да избера за точно тези изисквания: Astro**, защото картите и картите на хранилища се пишат най-естествено, а Neon се връзва най-чисто. Eleventy е много близо второ и е по-добрият избор, ако предпочиташ минимум зависимости. Hugo – ако не искаш Node.js или очакваш стотици публикации. Jekyll – само ако вече пишеш на Ruby; за всичко останало тук другите три изискват по-малко собствен код.

## 7. След като избереш

Копирай папката на избрания генератор в собствено хранилище, така че съдържанието ѝ да е в корена. Workflow-ът в нея (`.github/workflows/deploy.yml`) става активен автоматично и публикува сайта при всеки push и веднъж на ден. После смени:

- името, описанието и `githubUser` (`src/site.config.ts` в Astro, `src/_data/site.js` в Eleventy, `hugo.toml` в Hugo, `_config.yml` в Jekyll – там е `github_user`);
- проектите в Neon или в JSON файла;
- снимките в галерията (тестовите са генерирани пейзажи) и примерните публикации.
