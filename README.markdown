
chemr.user.js
=============

## Feature ##

Just provide incremental search index for reference sites by Greasemonkey.

Current Support:

 * [search.cpan.org](http://search.cpan.org)
 * [api.jquery.com](http://api.jquery.com)
 * [www.ruby-lang.org](http://www.ruby-lang.org)
 * [www2u.biglobe.ne.jp/~oz-07ams/prog/ecma262r3/](http://www2u.biglobe.ne.jp/~oz-07ams/prog/ecma262r3/)
 * [developer.android.com](http://developer.android.com)
 * [www.haskell.org](http://www.haskell.org)
 * [developer.apple.com](http://developer.apple.com)
 * [nodejs.org](http://nodejs.org)
 * [developer.mozilla.org](http://developer.mozilla.org)
 * [dev.mysql.com/doc/](http://dev.mysql.com/doc/)
 * [template-toolkit.org](http://template-toolkit.org)
 * [developer.appcelerator.com/apidoc/mobile/](http://developer.appcelerator.com/apidoc/mobile/)

## Key Binding ##

	C-l: focus input
	C-n: select next candinate
	C-p: select previous candinate
	C-u: clear input
	C-o: show current url
	C-w: delete last word 
	TAB: compliment first candinate
	ESC: hide input area
	RET: select first candinate


## Index ##

First you access the site, this scripts crawl and create index.
This may be little or very heavy but after all the index is stored in localStorage.

You can recreate index by Greasemonkey menu command: "Reindex."


## Independent Window ##

You can create new profile (named 'chemr'), install Greasemonkey, Stylish and this script,
and run createapp.rb, it creates Chemr.app which run standalone independent from Browser.

