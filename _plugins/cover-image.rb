#!/usr/bin/env ruby
# frozen_string_literal: true

# Fill missing post.image from the first usable figure, else the site banner.

DEFAULT_COVER = '/assets/img/default-banner.JPG'

Jekyll::Hooks.register :posts, :post_init do |post|
  image = post.data['image']
  next if image.is_a?(Hash) && (image['path'] || image[:path]).to_s != ''
  next if image.is_a?(String) && image != ''

  content = File.exist?(post.path) ? File.read(post.path) : post.content.to_s
  sources = []

  content.scan(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/) { sources << Regexp.last_match(1) }
  content.scan(/<img\b[^>]*\bsrc=["']([^"']+)["']/i) { sources << Regexp.last_match(1) }
  content.scan(/poster=["']([^"']+)["']/i) { sources << Regexp.last_match(1) }

  sources.map! { |src| src.to_s.strip }
  sources.reject!(&:empty?)
  sources.reject! { |src| src.start_with?('#') }
  sources.reject! { |src| src.include?('w80_blur') }

  cover = sources.find { |src| src.start_with?('/assets/') }
  cover ||= sources.find { |src| src.include?('type=w773') }
  cover ||= sources.find do |src|
    !src.include?('youtube.com') && !src.include?('ytimg.com') && !src.include?('youtu.be')
  end

  post.data['image'] = cover || DEFAULT_COVER
end
