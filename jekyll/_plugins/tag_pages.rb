# frozen_string_literal: true

# Страница за всеки етикет: /tags/<етикет>/ (Jekyll не ги прави сам).
module SiteTagPages
  class Generator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      site.tags.each do |tag, posts|
        page = Jekyll::PageWithoutAFile.new(site, site.source, File.join("tags", Jekyll::Utils.slugify(tag)), "index.html")
        page.data.merge!(
          "layout" => "tag",
          "title" => "##{tag}",
          "description" => "Публикации с етикет #{tag}",
          "tag" => tag,
          "posts" => posts.sort_by(&:date).reverse
        )
        site.pages << page
      end
    end
  end
end
