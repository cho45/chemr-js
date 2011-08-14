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
# FIREFOX = "/Applications/Minefield.app".expand
CHEMR   = "/Applications/Chemr.app".expand

CHEMR.rmtree if CHEMR.exist?

Contents = (CHEMR + "Contents")
Contents.mkpath

ln_s (FIREFOX + "Contents/Resources"), Contents
ln_s (FIREFOX + "Contents/MacOS"), Contents
cp   (FIREFOX + "Contents/Info.plist"), Contents

info = CHEMR + "Contents/Info.plist"
info.open("w") do |f|
	f.puts DATA.read
end

pkgi = CHEMR + "Contents/PkgInfo"
pkgi.open("w") do |f|
	f.print "APPLCHMR"
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

icns = CHEMR + "Contents/Resources/chemr.icns"
icns.open("w") do |f|
	f << "icon.icns".expand.read
end

__END__
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>English</string>
	<key>CFBundleExecutable</key>
	<string>chemr</string>
	<key>CFBundleGetInfoString</key>
	<string>Chemr</string>
	<key>CFBundleIconFile</key>
	<string>chemr</string>
	<key>CFBundleIdentifier</key>
	<string>net.lowreal.chemr</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>Chemr</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>4.0b11</string>
	<key>CFBundleSignature</key>
	<string>CHMR</string>
	<key>CFBundleVersion</key>
	<string>4.0b11</string>
	<key>NSAppleScriptEnabled</key>
	<true/>
	<key>CGDisableCoalescedUpdates</key>
	<true/>
	<key>LSMinimumSystemVersion</key>
	<string>10.5</string>
	<key>LSMinimumSystemVersionByArchitecture</key>
	<dict>
		<key>i386</key>
		<string>10.5.0</string>
		<key>x86_64</key>
		<string>10.6.0</string>
	</dict>
</dict>
</plist>
