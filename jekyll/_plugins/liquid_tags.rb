# frozen_string_literal: true

require "json"
require_relative "html_helpers"
require_relative "lib/github_data"

module SiteTags
  # Карта с Leaflet. Употреба в публикация:
  #
  #   {% map lat=42.2035 lng=23.3175 zoom=14 route fit caption="Маршрут" %}
  #   42.2152, 23.3268, Хижа
  #   42.2118, 23.3236, Долното езеро
  #   {% endmap %}
  #
  # Всеки ред между таговете е маркер: ширина, дължина, надпис.
  class MapBlock < Liquid::Block
    ARG = /(\w+)(?:=(?:"([^"]*)"|(\S+)))?/.freeze

    def initialize(tag_name, markup, tokens)
      super
      @args = {}
      markup.scan(ARG) { |key, quoted, bare| @args[key] = quoted || bare || "true" }
    end

    def render(context)
      markers = super.to_s.lines.map(&:strip).reject(&:empty?).map do |line|
        lat, lng, *label = line.split(",")
        { "lat" => lat.to_f, "lng" => lng.to_f, "label" => label.join(",").strip }
      end
      lat = @args.fetch("lat")
      lng = @args.fetch("lng")
      zoom = @args.fetch("zoom", "12")
      caption = @args["caption"]
      h = SiteHTML.method(:h)
      osm = "https://www.openstreetmap.org/?mlat=#{lat}&amp;mlon=#{lng}#map=#{zoom}/#{lat}/#{lng}"
      style = @args["height"] ? %( style="height: #{h.call(@args["height"])}") : ""

      # Един ред HTML: празен ред би прекъснал HTML блока в Markdown.
      %(<figure class="map-figure"><div class="map" role="region" aria-label="#{h.call(caption ? "Карта: #{caption}" : "Карта")}") +
        %( data-lat="#{h.call(lat)}" data-lng="#{h.call(lng)}" data-zoom="#{h.call(zoom)}" data-markers="#{h.call(JSON.generate(markers))}") +
        %( data-route="#{@args["route"] == "true"}" data-fit="#{@args["fit"] == "true"}"#{style}></div>) +
        %(<figcaption>#{caption ? "<span>#{h.call(caption)}</span>" : ""}<a href="#{osm}">Отвори в OpenStreetMap</a></figcaption></figure>)
    end
  end

  # Карта на хранилище в GitHub с данни от API-то (при билда). Употреба: {% repo jekyll/jekyll %}
  class RepoTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @name = markup.strip.delete(%("'))
    end

    def render(_context)
      repo = SiteGitHub.repo(@name)
      unless repo
        return %(<aside class="repo-card is-offline"><a class="repo-name" href="https://github.com/#{SiteHTML.h(@name)}">#{SiteHTML.h(@name)}</a></aside>)
      end

      %(<aside class="repo-card"><a class="repo-name" href="#{SiteHTML.h(repo["url"])}">#{SiteHTML.h(repo["full_name"])}</a>) +
        (repo["description"] ? %(<p class="repo-desc">#{SiteHTML.h(repo["description"])}</p>) : "") +
        SiteHTML.repo_meta(repo) + "</aside>"
    end
  end
end

Liquid::Template.register_tag("map", SiteTags::MapBlock)
Liquid::Template.register_tag("repo", SiteTags::RepoTag)
