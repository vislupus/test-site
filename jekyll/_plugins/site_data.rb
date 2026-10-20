# frozen_string_literal: true

require_relative "lib/neon_projects"
require_relative "lib/github_data"

# Зарежда проектите (Neon или _data/projects.json), обогатява ги с данни от GitHub
# и тегли последните хранилища на github_user. Всичко е в site.data за шаблоните.
module SiteData
  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      data = SiteNeon.load(site.in_source_dir("_data", "projects.json"))
      items = data["items"].map { |p| p.merge("gh" => p["repo"] ? SiteGitHub.repo(p["repo"]) : nil) }
      site.data["projects"] = {
        "source" => data["source"],
        "items" => items,
        "featured" => items.select { |p| p["featured"] },
      }

      user = site.config["github_user"].to_s
      configured = !user.empty? && user != "your-username"
      site.data["github_repos"] = {
        "configured" => configured,
        "repos" => configured ? SiteGitHub.user_repos(user) : nil,
      }
    end
  end
end
