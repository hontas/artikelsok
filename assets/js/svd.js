(function(){

	var loadJSONP = (function() {
		var unique = 0;
		return function(url, callback, context) {
			// init
			var name = "_svd_jsonp_" + unique++;
			url += "&callback=" + name;

			// create script
			var script = document.createElement('script');
			script.type = "text/javascript";
			script.src = url;

			// setup handler
			window[name] = function(data) {
				callback.call(context || window, data);
				document.querySelector('head').removeChild(script);
				script = null;
				delete window[name];
			}

			// load json
			document.querySelector('head').appendChild(script);
		}
	})();

	var SvD = {

		grouped: false,
		searchUrl: "http://www.svd.se/search.do?q=[question]&output=json",
		searchResults: [],

		init: function() {
			this.searchForm = document.getElementById('search-form');
			this.searchField = document.getElementById('search-field');
			this.searchButtonIcon = document.getElementById('search-button');
			this.sortButton = document.getElementById('sorting-button');
			this.resultsList = document.getElementById('result-list');
			this.searchHits = document.getElementById('search-hits');

			this.addEventListeners();
		},

		getArticles: function() {
			var url = this.searchUrl.replace('[question]', encodeURIComponent(this.searchField.value));

			this.searchButtonIcon.className = "fa fa-spinner fa-spin";

			function success(data) {
				var results = data.SvDSearch.results && this.transform(data.SvDSearch.results.articles) || [];
				this.searchResults = results;
				this.searchHits.textContent = data.SvDSearch.query.count + 'st.';
				
				this.searchButtonIcon.className = "fa fa-search";
				this.render();
			}

			loadJSONP(url, success, this);
		},

		addEventListeners: function() {
			this.searchForm.addEventListener('submit', this.onFormSubmit.bind(this), false);
			this.sortButton.addEventListener("click", this.toggleGrouped.bind(this), false);
		},

		onFormSubmit: function(event) {
			event.preventDefault();
			this.getArticles();
		},

		transform: function(array) {
			return array.map(function(item) {
				item.timestamp = new Date(item.date).getTime();
				return item;
			});
		},

		getResults: function() {
			function byTimestamp(a, b) {
				return a.timestamp < b.timestamp;
			}

			function bySection(obj, curr) {
				var section = curr.section.split(' ')[0];

				if (!obj[section]) {
					obj[section] = [];
				}
				
				obj[section].push(curr);
				return obj;
			}

			var results = this.searchResults.slice().sort(byTimestamp);

			if (this.grouped) {
				return results.reduce(bySection, {});
			} else {
				return { "result": results };
			}
		},

		toggleGrouped: function() {
			this.grouped = !this.grouped;
			this.render();
		},

		render: function() {
			var results = this.getResults();
			var frag = document.createDocumentFragment();
			var cell = document.createElement('li');
			var link = document.createElement('a');

			// clear last result list
			while (this.resultsList.firstChild) {
				this.resultsList.removeChild(this.resultsList.firstChild);
			}

			function appendResult(result) {
				var li = cell.cloneNode();
				var a = link.cloneNode();
				a.href = result.url;
				a.textContent = result.title;
				li.appendChild(a);
				frag.appendChild(li);
			}

			for (var section in results) {
				if (this.grouped) {
					var heading = cell.cloneNode();
					heading.textContent = section;
					heading.classList.add('section-heading');
					frag.appendChild(heading);
				}
				results[section].forEach(appendResult);
			}

			this.resultsList.appendChild(frag);
		}
	};

	document.addEventListener("DOMContentLoaded", SvD.init.bind(SvD));

}());