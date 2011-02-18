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
	f.puts body.
		gsub(%r|<string>firefox-bin</string>|, '<string>chemr</string>').
		gsub(%r|<string>MOZB</string>|, '<string>CHMR</string>').
		gsub(%r|<string>org.mozilla.firefox</string>|, '<string>net.lowreal.chemr</string>').
		gsub(%r|Firefox|, 'Chemr').
		gsub(%r|<key>CFBundleURLTypes</key>\n\t<array>[\s\S]*\t</array>|, '').
		gsub(%r|<key>CFBundleDocumentTypes</key>\n\t<array>[\s\S]*\t</array>|, '')
end

bin = CHEMR + "Contents/MacOS/chemr"
bin.open("w") do |f|
	f.puts <<-EOS.gsub(/^\s*/, '')
		#!/bin/sh
		/Applications/Chemr.app/Contents/MacOS/firefox-bin -no-remote -P chemr
	EOS
end
bin.chmod(0777)
(CHEMR + "Contents/MacOS/firefox-bin").chmod(0777)

icns = CHEMR + "Contents/Resources/firefox.icns"
icns.open("w") do |f|
	f << "icon.icns".expand.read
end

