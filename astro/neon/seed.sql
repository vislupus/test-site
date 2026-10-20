-- Примерни данни (същите като data/projects.json), за да видиш разликата при включен Neon.
insert into projects (title, description, year, tags, repo, url, featured, sort_order) values
  ('Метеостанция с ESP32 (от Neon)', 'Сензори за температура, влажност и налягане, които пращат измерванията към малко API на всеки пет минути. Графиките се рисуват в браузъра.', 2026, '{esp32,c++,iot}', 'your-username/esp32-weather', null, true, 1),
  ('Бот за градския транспорт', 'Telegram бот, който казва кога идва следващият автобус до избрана спирка и пази любимите ти спирки.', 2025, '{python,telegram}', 'your-username/transit-bot', null, true, 2),
  ('Земетресения на карта', 'Интерактивна карта с данните на USGS за последните 30 дни, с филтър по магнитуд и дълбочина.', 2025, '{leaflet,javascript}', 'your-username/quake-map', 'https://your-username.github.io/quake-map/', false, 3),
  ('Личен сайт', 'Този сайт: блог, проекти и галерия, генерирани статично и публикувани в GitHub Pages.', 2026, '{astro,eleventy,hugo}', 'your-username/your-username.github.io', null, false, 4);
