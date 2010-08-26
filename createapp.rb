#!/usr/bin/env ruby1.9 -Ku


require "pathname"
require "fileutils"
include FileUtils::Verbose

class String
	def expand
		ret = Pathname.new(self).expand_path
		ret.parent.mkpath unless ret.parent.exist?
		ret
	end
end

def sh(*args)
	puts args.join(" ")
	system(*args)
end

FIREFOX = "/Applications/Firefox.app".expand
CHEMR   = "/Applications/Chemr.app".expand

CHEMR.rmtree if CHEMR.exist?

cp_r FIREFOX, CHEMR
info = CHEMR + "Contents/Info.plist"
body = info.read
info.open("w") do |f|
	f.puts body.gsub(%r|<string>firefox-bin</string>|, '<string>chemr</string>')
end

bin = CHEMR + "Contents/MacOS/chemr"
bin.open("w") do |f|
	f.puts <<-EOS.gsub(/^\s*/, '')
		#!/bin/sh
		/Applications/Chemr.app/Contents/MacOS/firefox-bin -P chemr -no-remote
	EOS
end
bin.chmod(0777)
(CHEMR + "Contents/MacOS/firefox-bin").chmod(0777)

icns = CHEMR + "Contents/Resources/firefox.icns"
icns.open("w") do |f|
	f << "icon.icns".expand.read
end

