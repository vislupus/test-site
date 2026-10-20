# frozen_string_literal: true

require_relative "html_helpers"

# Филтри за шаблоните: дати на български, време за четене, числа, етикети.
module SiteFilters
  def date_long(input)
    SiteHTML.date_long(input)
  end

  def date_short(input)
    SiteHTML.date_short(input)
  end

  def reading_time(html)
    words = html.to_s.gsub(/<[^>]+>/, " ").split.size
    [1, (words / 200.0).round].max
  end

  def number_bg(input)
    SiteHTML.number(input)
  end

  def repo_meta(repo)
    SiteHTML.repo_meta(repo)
  end

  def tag_slug(tag)
    Jekyll::Utils.slugify(tag.to_s)
  end

  # site.tags → [{ name, count, slug }], първо кирилица, после латиница.
  def tag_list(tags)
    (tags || {}).map { |name, posts| { "name" => name, "count" => posts.size, "slug" => tag_slug(name) } }
                .sort_by { |t| [t["name"].match?(/\A\p{Cyrillic}/) ? 0 : 1, t["name"].downcase] }
  end
end

Liquid::Template.register_filter(SiteFilters)
