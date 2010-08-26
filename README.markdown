
chemr.user.js
=============

## Feature ##

Just provide incremental search index for reference sites by Greasemonkey.

Current Support:

 * http://search.cpan.org/
 * http://www2u.biglobe.ne.jp/~oz-07ams/prog/ecma262r3/
 * http://api.jquery.com/
 * http://www.ruby-lang.org/
 * http://developer.android.com/

## Key Binding ##

	C-L: focus input area
	RET: select first candinate
	C-U: clear input

## Index ##

First you access the site, this scripts crawl and create index.
This may be little or very heavy but after all the index is stored in localStorage.

You can recreate index by Greasemonkey menu command: "Reindex."


## Independent Window ##

You can create new profile (named 'chemr'), install Greasemonkey, Stylish and this script,
and run createapp.rb, it creates Chemr.app which run standalone independent from Browser.

