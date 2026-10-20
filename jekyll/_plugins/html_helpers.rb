# frozen_string_literal: true

require "cgi"
require "date"
require "time"

# HTML, което се ползва и от Liquid таговете, и от филтрите.
module SiteHTML
  LANG_COLORS = {
    "JavaScript" => "#f1e05a", "TypeScript" => "#3178c6", "Python" => "#3572A5", "Go" => "#00ADD8",
    "Rust" => "#dea584", "C++" => "#f34b7d", "C" => "#555555", "HTML" => "#e34c26", "CSS" => "#663399",
    "Astro" => "#ff5a03", "Java" => "#b07219", "Shell" => "#89e051", "Vue" => "#41b883",
    "Svelte" => "#ff3e00", "MDX" => "#fcb32c", "Nunjucks" => "#3d8137", "Ruby" => "#701516", "Liquid" => "#67b8de",
  }.freeze
  MONTHS_LONG = %w[януари февруари март април май юни юли август септември октомври ноември декември].freeze
  MONTHS_SHORT = %w[яну фев мар апр май юни юли авг сеп окт ное дек].freeze

  module_function

  def h(value)
    CGI.escapeHTML(value.to_s)
  end

  def to_time(input)
    case input
    when Time then input
    when Date then input.to_time
    else Time.parse(input.to_s)
    end
  end

  def date_short(input)
    t = to_time(input)
    "#{t.day} #{MONTHS_SHORT[t.month - 1]} #{t.year}"
  end

  def date_long(input)
    t = to_time(input)
    "#{t.day} #{MONTHS_LONG[t.month - 1]} #{t.year} г."
  end

  # Като toLocaleString("bg-BG"): групиране с интервал от 10 000 нагоре.
  def number(n)
    s = n.to_i.to_s
    s.size < 5 ? s : s.reverse.scan(/\d{1,3}/).join(" ").reverse
  end

  def repo_meta(repo)
    return "" unless repo

    items = []
    if repo["language"]
      color = LANG_COLORS.fetch(repo["language"], "var(--slate)")
      items << %(<li><span class="lang-dot" style="--lang: #{color}"></span>#{h(repo["language"])}</li>)
    end
    items << %(<li aria-label="#{repo["stars"]} звезди">★ #{number(repo["stars"])}</li>)
    items << %(<li>#{number(repo["forks"])} разклонения</li>) if repo["forks"].to_i.positive?
    items << %(<li>обновено #{date_short(repo["pushed_at"])}</li>) if repo["pushed_at"]
    %(<ul class="repo-meta">#{items.join}</ul>)
  end
end
