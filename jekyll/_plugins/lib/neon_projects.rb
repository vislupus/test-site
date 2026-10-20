# frozen_string_literal: true

require_relative "http_json"

# Проектите от Neon по време на билда, през SQL-over-HTTP API на Neon
# (същото, което ползва @neondatabase/serverless). Без нужда от gem за Postgres.
# - С DATABASE_URL: чете таблицата projects. При грешка билдът спира нарочно,
#   за да не се публикува сайт с липсващи данни.
# - Без DATABASE_URL: чете _data/projects.json.
module SiteNeon
  QUERY = <<~SQL.freeze
    select coalesce(json_agg(p), '[]'::json)
    from (
      select id, title, description, year, tags, repo, url, featured
      from projects
      order by featured desc, sort_order asc, year desc nulls last, title asc
    ) p
  SQL

  class << self
    def configured?
      !ENV["DATABASE_URL"].to_s.empty?
    end

    # ep-xxx.eu-central-1.aws.neon.tech → https://api.eu-central-1.aws.neon.tech/sql
    def endpoint(conn)
      override = ENV["NEON_SQL_ENDPOINT"].to_s
      return override unless override.empty?

      host = conn[%r{@([^/:?]+)}, 1] or raise "[neon] Не мога да прочета хоста от DATABASE_URL."
      "https://#{host.sub(/\A[^.]+\./, "api.")}/sql"
    end

    def query(conn, sql)
      res = begin
        SiteHTTP.request(
          :post, endpoint(conn),
          headers: {
            "Content-Type" => "application/json",
            "Neon-Connection-String" => conn,
            "Neon-Raw-Text-Output" => "true",
            "Neon-Array-Mode" => "true",
          },
          body: JSON.generate({ "query" => sql, "params" => [] }),
          timeout: 20
        )
      rescue StandardError => e
        raise "[neon] Не мога да се свържа с Neon (#{endpoint(conn)}): #{e.message}"
      end
      unless res.is_a?(Net::HTTPSuccess)
        message = begin
          JSON.parse(res.body)["message"]
        rescue StandardError
          res.body.to_s[0, 300]
        end
        raise "[neon] Заявката към Neon не успя: #{message}\n" \
              "Провери DATABASE_URL и дали таблицата projects съществува (neon/schema.sql)."
      end
      JSON.parse(res.body)["rows"]
    end

    def load(local_json_path)
      if configured?
        rows = query(ENV["DATABASE_URL"], QUERY)
        projects = JSON.parse(rows.dig(0, 0) || "[]").map { |p| normalize(p) }
        SiteHTTP.log(:info, "[neon] Заредени #{projects.size} проекта от Neon.")
        { "source" => "neon", "items" => projects }
      else
        raw = JSON.parse(File.read(local_json_path))
        projects = raw.map { |p| normalize(p) }.each_with_index.sort_by { |p, i| [p["featured"] ? 0 : 1, i] }.map(&:first)
        SiteHTTP.log(:info, "[neon] DATABASE_URL не е зададен – ползвам #{local_json_path}.")
        { "source" => "local", "items" => projects }
      end
    end

    def normalize(p)
      {
        "title" => p["title"],
        "description" => p["description"].to_s,
        "year" => p["year"],
        "tags" => Array(p["tags"]),
        "repo" => (p["repo"].to_s.empty? ? nil : p["repo"]),
        "url" => (p["url"].to_s.empty? ? nil : p["url"]),
        "featured" => p["featured"] == true,
      }
    end
  end
end
