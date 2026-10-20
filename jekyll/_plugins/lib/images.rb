# frozen_string_literal: true

require "fileutils"
require "open3"

# Преоразмеряване на снимки с ImageMagick (Jekyll няма вградена обработка на изображения).
module SiteImages
  module_function

  def tool
    @tool ||= %w[magick convert].find { |t| system("command -v #{t} >/dev/null 2>&1") } or
      raise "ImageMagick не е инсталиран (нужна е команда magick или convert)."
  end

  def dimensions(path)
    cmd = tool == "magick" ? ["magick", "identify"] : ["identify"]
    out, status = Open3.capture2(*cmd, "-format", "%w %h", "#{path}[0]")
    raise "identify не успя за #{path}" unless status.success?

    out.split.map(&:to_i)
  end

  # Записва WebP с ширина до `width` (без уголемяване). Пропуска, ако вече е готов.
  def resize(src, dest, width, quality: 80)
    return dest if File.exist?(dest) && File.mtime(dest) >= File.mtime(src)

    FileUtils.mkdir_p(File.dirname(dest))
    ok = system(tool, src, "-auto-orient", "-strip", "-resize", "#{width}x>", "-quality", quality.to_s, dest)
    raise "ImageMagick не успя да преоразмери #{src}" unless ok

    dest
  end
end
