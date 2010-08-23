// ==UserScript==
// @name        Chemr
// @namespace   http://lowreal.net/
// @include     http://search.cpan.org/*
// @require     http://jqueryjs.googlecode.com/files/jquery-1.3.min.js
// @require     http://github.com/cho45/jsdeferred/raw/master/jsdeferred.userscript.js
// @require     http://svn.coderepos.org/share/lang/javascript/jsenumerator/trunk/jsenumerator.nodoc.js
// @require     http://gist.github.com/3239.txt#createElementFromString
// @require     http://gist.github.com/3238.txt#$X
// @resource    search.cpan.org http://stfuawsc.com/refindex/search.cpan.org
// ==/UserScript==

(function () { with (D()) {
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
				}, 200);
				return true;
			});

		},

		instantiateSearcher : function () {
			var self = this;
			return self.instantiateSearcherFromResource();
		},

		instantiateSearcherFromHttp : function () {
			var self = this;
			return http.get('./keyword.dat').next(function (req) {
				self.searcher = new Chemr.Searcher.Dat(req.responseText);
			});
		},

		instantiateSearcherFromResource : function () {
			var self = this;
			self.searcher = new Chemr.Searcher.Dat(GM_getResourceText(self.domain));
			return next();
		},

		setCandinate : function (list) {
			var container = this.container;
			var select = container.select;
			while (select.firstChild) select.removeChild(select.firstChild);
			for (var i = 0, len = list.length; i < len; i++) {
				var item   = this.applyDomainFunction(list[i]);
				var key    = item[0];
				var option = document.createElement('option');
				option.appendChild(document.createTextNode(key));
				option.value = item[1];
				select.add(option, null);
			}
		},

		applyDomainFunction : function (item) {
			if (Chemr.DomainFunctions[this.domain]) {
				Chemr.DomainFunctions[this.domain](item);
				return item;
			} else {
				return item;
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
	Chemr.DomainFunctions = {
		"search.cpan.org" : function (item) {
			item[1] = "http://search.cpan.org/perldoc?" + encodeURIComponent(item[0]);
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

	try {
		var domain = location.hostname;
		new Chemr(domain);
	} catch (e) { alert(e) }
	
}

})();
