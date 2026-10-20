# frozen_string_literal: true

require_relative "lib/images"
require_relative "html_helpers"

# Jekyll няма обработка на изображения, затова:
# - снимките от _gallery/ стават WebP 400/800/1600 px (site.data.gallery_images);
# - снимките от assets/blog/ стават WebP 800/1400 px и <img> в публикациите се пренаписва.
# Готовите файлове се пазят в .jekyll-cache/images и не се правят наново.
module SiteImageGen
  GALLERY_WIDTHS = [400, 800, 1600].freeze
  POST_WIDTHS = [800, 1400].freeze
  POST_IMAGES = {}

  class Generator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      @site = site
      @cache = site.in_source_dir(".jekyll-cache", "images")

      site.data["gallery_images"] = (site.data["gallery"] || []).filter_map do |item|
        src = site.in_source_dir("_gallery", item["file"])
        unless File.exist?(src)
          Jekyll.logger.warn("[images]", "Липсва _gallery/#{item["file"]}")
          next
        end

        base = File.basename(item["file"], ".*")
        paths = GALLERY_WIDTHS.to_h { |w| [w, variant(src, "img/gallery", "#{base}-#{w}.webp", w)] }
        width, height = SiteImages.dimensions(paths[400])
        {
          "title" => item["title"],
          "small" => "/img/gallery/#{base}-400.webp",
          "medium" => "/img/gallery/#{base}-800.webp",
          "full" => "/img/gallery/#{base}-1600.webp",
          "width" => width,
          "height" => height,
        }
      end

      POST_IMAGES.clear
      Dir[site.in_source_dir("assets", "blog", "*.{jpg,jpeg,png,webp}")].each do |src|
        base = File.basename(src, ".*")
        POST_IMAGES["/assets/blog/#{File.basename(src)}"] = POST_WIDTHS.map do |w|
          path = variant(src, "img/blog", "#{base}-#{w}.webp", w)
          width, height = SiteImages.dimensions(path)
          { "url" => "/img/blog/#{base}-#{w}.webp", "width" => width, "height" => height }
        end
      end
    end

    private

    def variant(src, dir, name, width)
      dest = File.join(@cache, dir, name)
      SiteImages.resize(src, dest, width)
      @site.static_files << Jekyll::StaticFile.new(@site, @cache, dir, name)
      dest
    end
  end
end

# <img src=".../assets/blog/снимка.jpg" alt="..."> → WebP със srcset.
Jekyll::Hooks.register [:documents, :pages], :post_convert do |doc|
  next if SiteImageGen::POST_IMAGES.empty?

  baseurl = doc.site.baseurl.to_s.chomp("/")
  doc.content = doc.content.gsub(/<img\b[^>]*>/) do |tag|
    src = tag[/\ssrc="([^"]+)"/, 1].to_s
    key = SiteImageGen::POST_IMAGES.keys.find { |k| src.end_with?(k) }
    next tag unless key

    variants = SiteImageGen::POST_IMAGES[key]
    alt = tag[/\salt="([^"]*)"/, 1].to_s
    small, large = variants.first, variants.last
    srcset = variants.map { |v| "#{baseurl}#{v["url"]} #{v["width"]}w" }.join(", ")
    %(<img src="#{baseurl}#{small["url"]}" srcset="#{srcset}" sizes="(min-width: 48rem) 44rem, 100vw" ) +
      %(width="#{large["width"]}" height="#{large["height"]}" alt="#{alt}" loading="lazy" decoding="async">)
  end
end
