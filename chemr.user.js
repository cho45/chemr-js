// ==UserScript==
// @name        Chemr
// @namespace   http://lowreal.net/
// @include     http://search.cpan.org/*
// @include     http://www2u.biglobe.ne.jp/*
// @include     http://developer.android.com/*
// @require     http://jqueryjs.googlecode.com/files/jquery-1.3.min.js
// @require     http://github.com/cho45/jsdeferred/raw/master/jsdeferred.userscript.js
// @require     http://svn.coderepos.org/share/lang/javascript/jsenumerator/trunk/jsenumerator.nodoc.js
// @require     http://gist.github.com/3239.txt#createElementFromString
// @require     http://gist.github.com/3238.txt#$X
// ==/UserScript==

(function () { with (D()) {
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

	function Chemr () { this.init.apply(this, arguments) }
	Chemr.prototype = {
		init : function (domain) {
			var self = this;
			self.domain = domain;
			self.createContainer();
			self.bindEvents();
			self.instantiateSearcher().next(function () {
				self.search("");
			}).
			error(function (e) {
				alert(e);
			});

			self.applyDomainFunction('load');
		},

		createContainer : function () {
			this.container = createElementFromString('\
				<div id="chemr-container">\
					<div class="search">\
						<input type="text" name="input" class="input" placeholder="Input" autocomplete="off"/>\
						<select class="select" size="30"></select>\
					</div>\
					<link rel="stylesheet" href="http://stfuawsc.com/refindex/chemr.css" type="text/css" media="all" />\
				</div>\
			');
			document.body.appendChild(this.container);
		},

		bindEvents : function () {
			var self = this;
			var container = self.container;
			$(document).keyup(function (e) {
				var key = keyString(e);
				var handler = {
					'C-L' : function () {
						container.input.focus();
					},
					'C-N' : function () {
						var option = container.select.childNodes[container.select.selectedIndex + 1];
						if (option) option.selected = true;
						$(container.select).change();
					},
					'C-U' : function () {
						container.input.value = '';
					}
				}[key];
				if (handler) handler();
			});

			$(container.select).change(function (e) {
				var option = container.select.childNodes[container.select.selectedIndex];
				if (!option) return;
				var url  = option.value;
				var name = option.text;
				document.title = name;
				http.get(url).next(function (res) {
					document.body.removeChild(container);
					document.body.innerHTML = res.responseText;
					document.body.appendChild(container);
					var fragment = url.match(/#(.+)$/);
					if (fragment) {
						var target = document.getElementById(fragment[1]);
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
					container.input.focus();
				}
			}, false);

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
				self.searcher = new Chemr.Searcher.Dat(data);
				return next();
			} else {
				var indexer = new Chemr.Indexer(self.domain);
				return indexer.index().next(function (data) {
					localStorage.setItem('refindex', data);
					self.searcher = new Chemr.Searcher.Dat(data);
				});
			}
		},

		setCandinate : function (list) {
			var container = this.container;
			var select = container.select;
			while (select.firstChild) select.removeChild(select.firstChild);
			for (var i = 0, len = list.length; i < len; i++) {
				var item   = this.applyDomainFunction('item', list[i]);
				var key    = item[0];
				var option = document.createElement('option');
				option.appendChild(document.createTextNode(key));
				option.value = item[1];
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
			}).join(').*?(') + ')', 'ig');

			res = res.
				map(function (i) {
					var match = regex.exec(i[0]);
					if (match) {
						var score = Math.abs(i[0].length - (match.length - 1));
						return [i, score];
					} else {
						return [i, Number.MAX_VALUE];
					}
				}).
				sort(function (a, b) {
					return a[1] - b[1];
				}).
				map(function (i) {
					return i[0];
				});

			self.setCandinate(res);
		}
	};

	Chemr.Indexer = function () { this.init.apply(this, arguments) };
	Chemr.Indexer.prototype = {
		init : function (domain) {
			this.domain    = this.domain;
			this.functions = Chemr.DomainFunctions[this.domain];
		},

		index : function () {
			var self = this;
			return next(this.functions.indexer);
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
		item : function (item) {
			item[1] = "http://search.cpan.org/perldoc?" + encodeURIComponent(item[0]);
			return item;
		}
	};

	Chemr.DomainFunctions["developer.android.com"] = {
		load : function () {
		}
	};

	Chemr.DomainFunctions["www2u.biglobe.ne.jp"] = { // Under Translation of ECMA-262 3rd Edition
		indexer : function () {
			var ret = new Deferred();
			var iframe = document.createElement('iframe');
			iframe.addEventListener("load", function () {
				var document = iframe.contentDocument;
				var anchors  = $X(".//dt/a", document, Array);
				var index    = new Array(anchors.length);
				for (var i = 0, len = index.length; i < len; i++) {
					var a    = anchors[i];
					var name = $X(".", a, String).replace(/^[\d\s.]*/, "");
					var url  = a.href;
					index.push(name + "\t" + url + "\n");
				}
				ret.call(index.join(""));
			}, false);
			iframe.src = "http://www2u.biglobe.ne.jp/~oz-07ams/prog/ecma262r3/fulltoc.html";
			document.body.appendChild(iframe);
			return ret;
		}
	};

	try {
		var domain = location.hostname;
		new Chemr(domain);
	} catch (e) { alert(e) }
	
}

})();
