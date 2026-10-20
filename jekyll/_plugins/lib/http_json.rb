# frozen_string_literal: true

require "json"
require "net/http"
require "uri"

# Малък помощник за JSON заявки по време на билда (само стандартната библиотека на Ruby).
module SiteHTTP
  module_function

  # GET следва пренасочвания (напр. преименувано хранилище в GitHub връща 301).
  def request(method, url, headers: {}, body: nil, timeout: 10, redirects: 3)
    uri = URI(url)
    req = (method == :post ? Net::HTTP::Post : Net::HTTP::Get).new(uri)
    headers.each { |k, v| req[k] = v }
    req.body = body if body
    res = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https",
                                              open_timeout: timeout, read_timeout: timeout) { |http| http.request(req) }
    if method == :get && res.is_a?(Net::HTTPRedirection) && res["location"] && redirects.positive?
      return request(method, URI.join(url, res["location"]).to_s, headers: headers, timeout: timeout, redirects: redirects - 1)
    end

    res
  end

  def log(level, msg)
    if defined?(Jekyll) && Jekyll.respond_to?(:logger)
      Jekyll.logger.public_send(level, msg)
    else
      warn msg
    end
  end
end
