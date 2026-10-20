// Всичко, което трябва да смениш, за да стане сайтът твой, е тук.
export default {
  title: "Бележник",
  author: "Твоето Име",
  description: "Бележки за код, математика и планини.",
  lede: "Бележки за код, математика и планини.",
  ledeMore: "Тук събирам проекти, формули, маршрути и снимки.",
  // Потребителско име в GitHub: страницата „Проекти“ показва последните ти публични хранилища.
  githubUser: "your-username",
  // Пълният адрес на сайта (за RSS). В GitHub Actions идва от actions/configure-pages.
  url: process.env.SITE_URL || "https://your-username.github.io",
  builtAt: new Date(),
};
