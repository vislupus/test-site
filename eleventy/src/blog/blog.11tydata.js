// Общи настройки за всички публикации в src/blog/.
export default {
  layout: "layouts/post.njk",
  // Чернови (draft: true) не се публикуват.
  permalink: (data) => (data.draft ? false : `/blog/${data.page.fileSlug}/`),
};
