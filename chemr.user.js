// ==UserScript==
// @name        Chemr
// @namespace   http://lowreal.net/
// @include     http://search.cpan.org/*
// @include     http://www2u.biglobe.ne.jp/*
// @include     http://developer.android.com/*
// @include     http://api.jquery.com/*
// @include     http://www.ruby-lang.org/*
// @require     http://jqueryjs.googlecode.com/files/jquery-1.3.min.js
// @require     http://github.com/cho45/jsdeferred/raw/master/jsdeferred.userscript.js
// @require     http://svn.coderepos.org/share/lang/javascript/jsenumerator/trunk/jsenumerator.nodoc.js
// @require     http://gist.github.com/3239.txt#createElementFromString
// @require     http://gist.github.com/3238.txt#$X
// ==/UserScript==

(function () { with (D()) {
	var LOADING_IMG = 'data:image/gif;base64,R0lGODlhEAAQAPMKAH19fYWFhY6OjpeXl7CwsLi4uMDAwNLS0urq6vz8/P///wAAAAAAAAAAAAAAAAAAACH5BAAKAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAAQAAAETFDJSau9NQ3AgSxGYmmdFAACkgmlcrCCOBnoNiWsQW2HRh2AAYWDIU6MGaSCRyG4ghRa7EjIUXCog6QzpSBYgS1nILsaCuJxGcNuTyIAIfkEAAoAAAAsAAAAABAAEACDfX19hYWFjo6Ol5eXsLCwwMDAysrK0tLS4+Pj6urq8vLy/Pz8////AAAAAAAAAAAABGKQSZmCmThLAQbS2FIEQJmATMKVAMEsSrZwggEEyjIIC1YAPMag8OIQJwPAQbJkdjAl0CI6KfU0VEmyuWgenpNfsDAoAo6SmUtBMtCukxiDwAKeQAlWoAAHIZICKBoGAXcTEQAh+QQACgAAACwAAAAAEAAQAIN9fX2FhYWOjo6Xl5egoKCwsLDAwMDKysrS0tLj4+Pq6ury8vL8/Pz///8AAAAAAAAEWrDJORehGB+AsmTGAAAByWSKMK6jgTGq0CVj0FEGIJxNXvAU0a2naDAQrsnI01gqAR6GU2JAnBTJBgIwyDAKgCQsjEGUAIljDEhlrQTFV+k8MLAp2wMzQ1jsIwAh+QQACgAAACwAAAAAEAAQAIN9fX2FhYWOjo6Xl5enp6ewsLC4uLjAwMDS0tLj4+Pq6ur8/Pz///8AAAAAAAAAAAAETpDJSau9bK26zgDAcGhDQikCqALCZ0pLKiASkoIvc7Ab/OETQ4A2+QExSEZiuexhVgUKImCgqKKTGOBgBc00Np6VcFsJFJVo5ydyJt/wCAAh+QQACgAAACwAAAAAEAAQAIN9fX2FhYWOjo6Xl5ewsLDAwMDKysrS0tLj4+Pq6ury8vL8/Pz///8AAAAAAAAAAAAEWpDJSau9eJUBwCjLpQhdCQjJRQhHeJBCOKWMLC1kwaQIQCgWAyAgCDA4Q5DkgOwYhKXBYVIIdAYMotVgURAAiB2jcLLVQrQbrLV4DcySBMl0Alo0yA8cw+9TIgAh+QQACgAAACwAAAAAEAAQAIN9fX2FhYWOjo6Xl5egoKCwsLDAwMDKysrS0tLj4+Pq6ury8vL8/Pz///8AAAAAAAAEWrDJSau9WBoAhmEWYxwNwnGCQiEBEDBgKQBCTJxAQTGzIS2HFkc1MQ0onITBhwQ0YxpDgkMZABAUxSlwWGho0EYBR5DwaAgQrBXAThSzExbxCRmsAGZmz7dEAAA7';

	http = function (opts) {
		var d = Deferred();
		var req = new XMLHttpRequest();
		req.overrideMimeType("text/plain; charset=" + document.characterSet);
		req.open(opts.method, opts.url, true);
		if (opts.headers) {
			for (var k in opts.headers) if (opts.headers.hasOwnProperty(k)) {
				req.setRequestHeader(k, opts.headers[k]);
			}
		}
		req.onreadystatechange = function () {
			if (req.readyState == 4) d.call(req);
		};
		req.send(opts.data || null);
		d.xhr = req;
		return d;
	}
	http.get   = function (url)       { return http({method:"get",  url:url}) };
	http.post  = function (url, data) { return http({method:"post", url:url, data:data, headers:{"Content-Type":"application/x-www-form-urlencoded"}}) };

	if (window != window.parent) return;

	function keyString (e) {
		var ret = '';
		if (e.ctrlKey) ret += 'C-';
		if (e.altKey)  ret += 'M-';
		if (e.which == 0) {
			ret += arguments.callee.table1[e.keyCode];
		} else {
			ret += arguments.callee.table2[e.which] || String.fromCharCode(e.which);
		}
		return ret;
	}
	keyString.table1 = { 9 : "TAB", 27 : "ESC", 33 : "PageUp", 34 : "PageDown", 35 : "End", 36 : "Home", 37 : "Left", 38 : "Up", 39 : "Right", 40 : "Down", 45 : "Insert", 46 : "Delete", 112 : "F1", 113 : "F2", 114 : "F3", 115 : "F4", 116 : "F5", 117 : "F6", 118 : "F7", 119 : "F8", 120 : "F9", 121 : "F10", 122 : "F11", 123 : "F12" };
	keyString.table2 = { 8 : "BS", 13 : "RET", 32 : "SPC" };

	function Chemr () { return Chemr.instance || this.init.apply(this, arguments) }
	Chemr.log = function () {
		var chemr = Chemr.instance;
		if (chemr) {
			for (var i = 0, len = Chemr.log.log.length; i < len; i++) {
				chemr.notify.apply(chemr, Chemr.log.log[i]);
			}
			Chemr.log.log = [];
			if (arguments.length) chemr.notify.apply(chemr, arguments);
		} else {
			Chemr.log.log.push(Array.prototype.slice.call(arguments, 0));
		}
	};
	Chemr.log.log = [];
	Chemr.DEBUG = 1;
	Chemr.prototype = {
		init : function (domain) {
			var self = this;
			self.domain = domain;
			self.createContainer();
			Chemr.log("initializing Chemr...");
			self.bindEvents();
			self.instantiateSearcher().next(function () {
				self.search("");
				Chemr.log("initialized.");
			}).
			error(function (e) {
				alert(e);
			});

			Chemr.instance = self;
			Chemr.log();
		},

		createContainer : function () {
			this.container = createElementFromString(<><![CDATA[
				<div id="chemr-container">
					<div class="search">
						<input type="text" name="input" class="input" placeholder="Input" autocomplete="off"/>
						<select class="select" size="30"></select>
						<img class="loading" src="" alt=""/>
					</div>
					<div class="notifications"></div>
					<style type="text/css">
						#chemr-container {
						}
						
						#chemr-container .search {
							position: fixed;
							z-index: 10000;
							top: 10px;
							right: 10px;
							width: 300px;
							margin: 0;
							padding: 0;
						}
						
						#chemr-container .search .input {
							font-size: 13px !important;
							width: 100%;
							margin: 0;
							padding: 1px;
							letter-spacing: 0;
							box-sizing: border-box;
							-moz-box-sizing: border-box;
						}
						
						#chemr-container .search .select {
							letter-spacing: 0;
							width: 100%;
							box-sizing: content-box;
							font-size: 13px !important;
						}

						#chemr-container .search .loading {
							display: none;
							position: absolute;
							top: 5px;
							right: 5px;
						}

						#chemr-container .search .select option {
							padding: 3px;
						}
						#chemr-container .search .select option:nth-child(odd) {
							background: #e9e9e9;
						}

						#chemr-container .search .select option .info {
							padding: 0 1px;
							font-size: 80%;
							color: #666;
						}

						#chemr-container .notifications {
							position: fixed;
							top: 0;
							left: 0;
							font-family: "Trebuchet MS", "Verdana", "Helvetica", "Arial" ,sans-serif;
							font-size: 12px;
							z-index: 10000;
							width: 50%;
							padding: 0.5em 1em;
							background: #000;
							color: #fff;
							letter-spacing: 0;
							opacity: 0.8;
						}
					</style>
				</div>
			]]></>.toString());
			this.container.loading.src = LOADING_IMG;
			document.body.appendChild(this.container);
		},

		bindEvents : function () {
			var self = this;
			var container = self.container;
			$(document).keypress(function (e) {
				var key = keyString(e);
				var handler = {
					'C-l' : function () {
						container.input.focus();
					},
					'C-n' : function () {
						var option = container.select.childNodes[container.select.selectedIndex + 1];
						if (option) option.selected = true;
						$(container.select).change();
					},
					'C-p' : function () {
						var option = container.select.childNodes[container.select.selectedIndex - 1];
						if (option) option.selected = true;
						$(container.select).change();
					},
					'C-u' : function () {
						container.input.value = '';
					},
					'C-o' : function () {
						var option = container.select.childNodes[container.select.selectedIndex];
						prompt('URL', option.value);
					},
					'C-w' : function () {
						var text = container.input.value.replace(/(\w+|\W+)$/, '');
						container.input.value = text;
						self.search(text);
					},
					'TAB' : function () {
						var option = container.select.childNodes[container.select.selectedIndex + 1];
						if (option) {
							container.input.value = option.title;
						}
					},
					'ESC' : function () {
						$(container).hide('fast');
					}
				}[key];
				if (handler) {
					handler();
					return false;
				}
				return true;
			});

			$(container.select).change(function (e) {
				var option = container.select.childNodes[container.select.selectedIndex];
				if (!option) return;
				var url  = option.value;
				document.title = option.title;
				Chemr.log("loading... " + url, { wait: 1 });
				$(self.container.loading).show();
				http.get(url).next(function (res) {
					$(self.container.loading).hide();
					document.body.removeChild(container);
					document.body.innerHTML = res.responseText;
					document.body.appendChild(container);
					self.applyDomainFunction('load');

					var fragment = url.match(/#(.+)$/);
					if (fragment) {
						fragment = decodeURIComponent(fragment[1]);
						var target = document.getElementById(fragment);
						if (!target) target = document.querySelector('a[name="' + fragment + '"]');
						window.scrollTo(0, $(target).offset().top);
					} else {
						window.scrollTo(0, 0);
					}
				}).
				error(function (e) {
					alert(e);
				});
			});

			window.addEventListener('keypress', function (e) {
				// Hook Cmd+L Ctrl+L
				if (e.which == 108 && (e.metaKey || e.ctrlKey)) {
					e.preventDefault();
					e.stopPropagation();
					$(container).show('fast');
					container.input.focus();
				}
			}, true);

			var timerId, prev;
			$(container.input).keyup(function (e) {
				var key = keyString(e);
				if (key == 'RET') {
					if (container.select.selectedIndex == -1) {
						container.select.firstChild.selected = true;
					}
					$(container.select).change();
					return false;
				} else
				if (key == 'TAB') {
					return false;
				}

				if (timerId) clearTimeout(timerId);
				timerId = setTimeout(function () {
					var input = container.input.value;
					if (prev != input) {
						self.search(input);
						prev = input;
					}
				}, 50);
				return true;
			});

			$(container).click(function (e) {
				e.stopPropagation();
			});

			$(document.body).click(function () {
				$(container).toggle('fast');
			});
		},

		instantiateSearcher : function () {
			var self = this;
			return self.instantiateSearcherFromLocalStorage();
		},

		instantiateSearcherFromHttp : function () {
			var self = this;
			return http.get('./keyword.dat').next(function (req) {
				self.searcher = new Chemr.Searcher.Dat(req.responseText);
			});
		},

		instantiateSearcherFromLocalStorage : function () {
			var self = this;
			var data = localStorage.getItem('refindex');
			if (data) {
				Chemr.log('Search index is read from localStorage');
				self.searcher = new Chemr.Searcher.Dat(data);
				return next();
			} else {
				Chemr.log('Search index is not found in localStorage. creating...');
				return next(function () {
					var indexer = new Chemr.Indexer(self.domain);
					return indexer.index().next(function (data) {
						localStorage.setItem('refindex', data);
						self.searcher = new Chemr.Searcher.Dat(data);
					});
				});
			}
		},

		setCandinate : function (list) {
			var container = this.container;
			var select = container.select;
			while (select.firstChild) select.removeChild(select.firstChild);
			for (var i = 0, len = list.length; i < len; i++) {
				var item   = this.applyDomainFunction('item', list[i]);
				var option = document.createElement('option');
				option.innerHTML = item[2] + (Chemr.DEBUG ? '<div class="info">[' + item.score + '] ' + item[1] + '</div>' : '');
				option.value     = item[1];
				option.title     = item[0];
				select.add(option, null);
			}
		},

		applyDomainFunction : function (name, obj) {
			var domainfunc = Chemr.DomainFunctions[this.domain];
			if (domainfunc && domainfunc[name]) {
				return Chemr.DomainFunctions[this.domain][name](obj);
			} else {
				return obj;
			}
		},

		search : function (query) {
			var self = this;
			var itr = self.searcher.search(query);
			var max = 100;
			var res = [];
			for (var i = 0, item = null; i < 30 && (item = itr.next()); i++) {
				res.push(item);
			}

			// scoring and sort
			var regex = new RegExp('(' + query.split('').map(function (c) {
				return c.replace(/\W/g,'\\$&');
			}).join(').*?(') + ')', 'i');

			res = res.
				map(function (i) {
					var str   = i[0];
					var match = regex.exec(str);
					if (match) {
						var score = Math.abs(str.length - (match.length - 1));

						var t = "";
						for (var j = 0, k = 1, len = str.length; j < len; j++) {
							if (str[j] == match[k]) {
								t += '<b>' + escapeHTML(str[j]) + '</b>';
								k++;
							} else {
								t += escapeHTML(str[j]);
							}
						}
						t += escapeHTML(str.slice(j));
						i[2] = t;
						i.score = score;
						return i;
					} else {
						i[2] = i[0];
						i.score = Number.MAX_VALUE;
						return i;
					}
				}).
				sort(function (a, b) {
					return a.score - b.score
				});

			self.setCandinate(res);
		},

		notify : function (msg, opts) {
			if (!opts) opts = {};
			var self = this;

			var div = document.createElement('div');
			div.className = 'notification';
			div.innerHTML = msg;
			$(div).hide().show('fast');

			if (!self.container.notifications.firstChild) $(self.container.notifications).show('fast');

			this.container.notifications.appendChild(div);
			return wait(opts.wait || 5).next(function () {
				$(div).hide('slow', function () {
					$(div).remove();
					if (!self.container.notifications.firstChild) $(self.container.notifications).hide('fast');
				});
			});
		}
	};

	Chemr.Indexer = function () { this.init.apply(this, arguments) };
	Chemr.Indexer.prototype = {
		init : function (domain) {
			this.domain      = domain;
			this.functions   = Chemr.DomainFunctions[this.domain];
			this.crawlTarget = [];
			this.indexArray  = [];
		},

		index : function () {
			var self = this;
			if (!this.functions.indexer) throw "indexer not defined";

			var ret = self.functions.indexer.call(self);
			if (ret) return ret;

			return next(function () {
				return self.crawlTarget.length ? parallel([
					self.fetch(function (src, doc) { self.functions.indexer.call(self, src, doc) }),
					self.fetch(function (src, doc) { self.functions.indexer.call(self, src, doc) }),
					self.fetch(function (src, doc) { self.functions.indexer.call(self, src, doc) })
				]).next(arguments.callee) : null;
			}).
			next(function () {
				// self.indexArray.sort();
				return self.indexArray.join("\n");
			});
		},

		pushIndex : function (index) {
						console.log(index);
			this.indexArray.push(index);
		},

		pushPage : function (url) {
			this.crawlTarget.push(url);
		},

		fetch : function (callback) {
			var self = this;
			var d = new Deferred();
			var url = this.crawlTarget.shift();
			if (!url) return next();
			var iframe = document.createElement('iframe');
			iframe.setAttribute('style', 'position:absolute;top:0;left:0;z-index:0;');
			iframe.style.display = "none";
			document.body.appendChild(iframe);
			iframe.contentWindow.addEventListener("DOMContentLoaded", function () {
				var document = iframe.contentDocument;
				var links = document.querySelectorAll('img, script');
				for (var i = 0, len = links.length; i < len; i++) {
					var e = links[i];
					e.setAttribute('_src', e.getAttribute('src'));
					e.removeAttribute('src');
				}

				try {
					callback.call(self, url, document);
				} catch (e) { d.fail([url, e]) }
				iframe.parentNode.removeChild(iframe);
				d.call();
			}, false);
			iframe.src = url + "?" + Math.random();
			Chemr.log('fetch ' + url);
			return d;
		}
	};

	Chemr.Searcher = {};
	Chemr.Searcher.Dat = function () { this.init.apply(this, arguments) }
	Chemr.Searcher.Dat.prototype = {
		init : function (dat) {
			this.dat = dat; // keyword\turl\n
		},

		search : function (query) {
			var self = this;
			var q = new RegExp(query.source || query, "gmi");
			return {
				hasNext : true,
				next : function () {
					// by mala http://la.ma.la/blog/diary_200604021538.htm
					var match = q.exec(self.dat);
					if (!match) {
						this.hasNext = false;
						return null;
					}
					var start = self.dat.lastIndexOf("\n", match.index) + 1;
					var tab   = self.dat.lastIndexOf("\t", match.index) + 1;
					var end   = self.dat.indexOf("\n", start);
					q.lastIndex = end + 1;

					if (start > tab) {
						return self.dat.slice(start, end).split("\t");
					} else {
						return this.next();
					}
				}
			};
		}
	};

	Chemr.DomainFunctions = { };
	Chemr.DomainFunctions["search.cpan.org"] = {
		indexer : function () {
			Chemr.log('fetch http://www.cpan.org/modules/02packages.details.txt');
			return xhttp.get('http://www.cpan.org/modules/02packages.details.txt').
			next(function (req) {
				Chemr.log('loaded, creating index...');
				return req;
			}).
			next(function (req) {
				var reg = /^([a-z0-9:_]*?[a-z0-9_])\s+/img;
				var str = req.responseText;
				var index = "";
				while (reg.exec(str)) {
					index += RegExp.$1 + "\t\n";
				}
				return index;
			});
		},

		item : function (item) {
			item[1] = "http://search.cpan.org/perldoc?" + encodeURIComponent(item[0]);
			return item;
		}
	};

	Chemr.DomainFunctions["api.jquery.com"] = {
		indexer : function (page, document) {
			if (!page) return this.pushPage("http://api.jquery.com/");
			var anchors  = $X(".//a[@rel='bookmark']", document, Array);
			var index    = new Array(anchors.length);
			for (var i = 0, len = index.length; i < len; i++) {
				var a    = anchors[i];
				var name = $X(".", a, String);
				var url  = a.href;
				this.pushIndex(name + "\t" + url);
			}
			return null;
		}
	};

	Chemr.DomainFunctions["www.ruby-lang.org"] = {
		indexer : function (page, document) {
			if (!page) return this.pushPage('http://www.ruby-lang.org/ja/man/html/methodlist.html?');
			var list     = $X(".//body/ul/li", document, Array);
			var index    = new Array(list.length);
			for (var i = 0, len = index.length; i < len; i++) {
				var li = list[i];
				var dt = $X("./text()", li, String).replace(/\s/g, '');
				var as = $X("./ul/li/a", li, Array);
				for (var j = 0, jlen = as.length; j < jlen; j++) {
					var a   = as[j];
					var dd  = $X(".", a, String).replace(/\s/g, '');
					var url = a.href;
					this.pushIndex(dd + "." + dt + "\t" + url);
				}
			}
			return null;
		}
	};

	Chemr.DomainFunctions["www2u.biglobe.ne.jp"] = { // Under Translation of ECMA-262 3rd Edition
		indexer : function (page, document) {
			if (!page) this.pushPage("http://www2u.biglobe.ne.jp/~oz-07ams/prog/ecma262r3/fulltoc.html");
			var anchors  = $X(".//dt/a", document, Array);
			var index    = new Array(anchors.length);
			for (var i = 0, len = index.length; i < len; i++) {
				var a    = anchors[i];
				var name = $X(".", a, String).replace(/^[\d\s.]*/, "");
				var url  = a.href;
				this.pushIndex(name + "\t" + url);
			}
		}
	};

	Chemr.DomainFunctions["developer.android.com"] = {
		indexer : function (page, document) {
			if (!page) {
				return this.pushPage('http://developer.android.com/reference/classes.html');
			}
			if (page == 'http://developer.android.com/reference/classes.html') {
				var list     = document.querySelectorAll('tr.api');
				for (var i = 0, len = list.length; i < len; i++) {
					var api = list[i];
					var a   = api.querySelector('td.jd-linkcol a');
					var t   = $X('.', a, String);
					this.pushPage(a.href);
					this.pushIndex(t + "\t" + a);
				}
			} else {
				var title   = $X('//h1', document, String);
				var anchors = document.anchors;
				for (var i = 0, len = anchors.length; i < len; i++) {
					var name = anchors[i].name;
					if (name == 'navbar_top') continue;
					this.pushIndex(title + "." + name + "\t" + page + "#" + encodeURIComponent(name));
				}
			}
			return null;
		},

		load : function () {
			var style = document.createElement('style');
			style.type = "text/css";
			style.appendChild(document.createTextNode(<><![CDATA[
				#header {
					height: auto;
					border: none;
					min-width: auto;
				}

				#headerLeft,
				#headerLinks,
				#search,
				#side-nav {
					display: none;
				}

				#body-content {
					position: static;
				}

				#doc-content {
					overflow: show;
					width: auto;
					margin: 0;
				}

				html {
					overflow: auto;
				}

				body {
					overflow: show;
				}
			]]></>));
			document.body.appendChild(style);
		}
	};

// TODO
//	Chemr.DomainFunctions["dev.mysql.com"] = {
//	};
//	Chemr.DomainFunctions["practical-scheme.net"] = {
//	};
//	Chemr.DomainFunctions["docs.python.org"] = {
//	};
//	Chemr.DomainFunctions["www.w3.org/TR/css3-roadmap/"] = {
//	};
//	Chemr.DomainFunctions["www.haskell.org"] = {
//	};
//	Chemr.DomainFunctions["livedocs.adobe.com/flash/9.0_jp/ActionScriptLangRefV3/"] = {
//	};

	try {
		var domain = location.hostname;
		new Chemr(domain);
	} catch (e) { alert(e) }
	
	GM_registerMenuCommand('Reindex', function () {
		localStorage.removeItem('refindex');
		location.reload();
	});
}

function escapeHTML (t) {
	return t.replace(/[&<>]/g, function (_) { return {'&':'&amp;','<':'&lt;','>':'&gt;'}[_] });
}

})();
