# frozen_string_literal: true

# kramdown разпознава формули само между $$ ... $$ (и в реда, и като блок).
# За да се пише като в другите версии ($...$ в реда), преди рендирането
# превръщаме $...$ в $$...$$. Кодът (``` блокове и `...`) не се пипа.
module SiteMath
  TOKEN = /
    (?<fence>^(?<f>`{3,}|~{3,})[^\n]*\n.*?^\k<f>[ \t]*$)   # ``` блок
    | (?<code>(?<b>`+)[^`].*?\k<b>)                          # `код`
    | (?<double>\$\$.+?\$\$)                                 # $$...$$
    | (?<single>(?<![\\$])\$(?=\S)(?<tex>[^$\n]+?)(?<=\S)\$(?!\$))  # $...$
  /mx.freeze

  module_function

  def convert(markdown)
    markdown.gsub(TOKEN) do
      m = Regexp.last_match
      next m[0] unless m[:single]

      # В началото на абзац kramdown би направил блок; \$$ го оставя в реда.
      line_start = m.begin(0).zero? || markdown[m.begin(0) - 1] == "\n"
      "#{line_start ? "\\" : ""}$$#{m[:tex]}$$"
    end
  end
end
