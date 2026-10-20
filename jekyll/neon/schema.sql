-- Таблица за страницата „Проекти“.
-- Изпълни този файл в SQL Editor в конзолата на Neon (или: psql "$DATABASE_URL" -f neon/schema.sql).

create table if not exists projects (
  id          serial primary key,
  title       text        not null,
  description text        not null default '',
  year        integer,
  tags        text[]      not null default '{}',
  repo        text,                         -- "собственик/хранилище" в GitHub
  url         text,                         -- сайт на проекта, ако има
  featured    boolean     not null default false,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- Само за четене от сайта: създай отделна роля и дай на билда нейния connection string.
-- (Изпълни го веднъж; паролата се генерира в конзолата на Neon → Roles.)
-- create role site_reader with login password '...';
-- grant usage on schema public to site_reader;
-- grant select on projects to site_reader;
