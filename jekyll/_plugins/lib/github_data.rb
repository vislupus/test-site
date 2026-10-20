# frozen_string_literal: true

require_relative "http_json"

# Данни от GitHub API по време на билда. В GitHub Actions подай GITHUB_TOKEN,
# за да не удариш лимита от 60 заявки на час.
module SiteGitHub
  @cache = {}

  class << self
    def api_base
      (ENV["GITHUB_API_URL"].to_s.empty? ? "https://api.github.com" : ENV["GITHUB_API_URL"]).chomp("/")
    end

    def get(path)
      return @cache[path] if @cache.key?(path)

      headers = {
        "Accept" => "application/vnd.github+json",
        "X-GitHub-Api-Version" => "2022-11-28",
        "User-Agent" => "jekyll-site-build",
      }
      token = ENV["GITHUB_TOKEN"].to_s
      headers["Authorization"] = "Bearer #{token}" unless token.empty?

      @cache[path] =
        begin
          res = SiteHTTP.request(:get, "#{api_base}#{path}", headers: headers)
          if res.is_a?(Net::HTTPSuccess)
            JSON.parse(res.body)
          else
            SiteHTTP.log(:warn, "[github] #{path}: HTTP #{res.code}")
            nil
          end
        rescue StandardError => e
          SiteHTTP.log(:warn, "[github] #{path}: #{e.message}")
          nil
        end
    end

    def pages_url(r)
      return nil unless r["has_pages"]

      owner, name = r["full_name"].split("/")
      owner = owner.downcase
      name.downcase == "#{owner}.github.io" ? "https://#{owner}.github.io/" : "https://#{owner}.github.io/#{name}/"
    end

    # Ключовете са низове, за да се четат директно от Liquid.
    def normalize(r)
      {
        "full_name" => r["full_name"],
        "name" => r["name"],
        "url" => r["html_url"],
        "description" => r["description"],
        "stars" => r["stargazers_count"].to_i,
        "forks" => r["forks_count"].to_i,
        "language" => r["language"],
        "pushed_at" => r["pushed_at"],
        "homepage" => (r["homepage"].to_s.empty? ? nil : r["homepage"]),
        "pages_url" => pages_url(r),
      }
    end

    # Едно хранилище, напр. "jekyll/jekyll". nil, ако API-то не отговори.
    def repo(full_name)
      data = get("/repos/#{full_name}")
      data ? normalize(data) : nil
    end

    # Последните публични хранилища на потребител (без forks и архивирани).
    def user_repos(user, limit = 8)
      data = get("/users/#{user}/repos?sort=pushed&per_page=100&type=owner")
      return nil unless data.is_a?(Array)

      data.reject { |r| r["fork"] || r["archived"] }.first(limit).map { |r| normalize(r) }
    end
  end
end
