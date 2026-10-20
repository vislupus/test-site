# frozen_string_literal: true

require "katex"
require_relative "lib/math_dollars"

# $...$ → $$...$$ преди kramdown (виж lib/math_dollars.rb). Самото рендиране с KaTeX
# го прави kramdown-math-katex (math_engine: katex в _config.yml).
Jekyll::Hooks.register [:documents, :pages], :pre_render do |doc, _payload|
  next unless %w[.md .markdown].include?(doc.extname)

  doc.content = SiteMath.convert(doc.content)
end

# Версията на KaTeX от gem-а, за да зареждаме точно същия CSS.
module SiteMathVersion
  class Generator < Jekyll::Generator
    safe true

    def generate(site)
      site.config["katex_version"] = Katex::KATEX_VERSION.to_s.delete_prefix("v")
    end
  end
end
