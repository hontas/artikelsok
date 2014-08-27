(function() {
	var keys = {
		ESC: 13
	};

	var SvD = window.SvD || {};

	SvD.grouped = false,
	SvD.searchUrl = "http://www.svd.se/search.do?q={{query}}&output=json",
	SvD.searchResults = [],

	SvD.init = function() {
		this.searchField = document.getElementById('search-field');
		this.searchFieldIcon = document.querySelector('.form-feedback');
		this.sortButton = document.getElementById('sorting-button');
		this.resultsList = document.getElementById('result-list');
		this.searchHits = document.getElementById('search-hits');

		this.addEventListeners();
	};

	SvD.addEventListeners = function() {
		this.searchField.addEventListener('keydown', this.onSearchKeyDown.bind(this), false);
		this.sortButton.addEventListener("click", this.toggleGrouped.bind(this), false);
	};

	SvD.onSearchKeyDown = function(evt) {
		if (evt.keyCode === keys.ESC) {
			this.getArticles();
		};
	};

	SvD.getArticles = function() {
		var searchQuery = this.searchField.value;
		var url = this.searchUrl.replace('{{query}}', encodeURIComponent(searchQuery));

		this.searchFieldIcon.classList.remove("fa-search");
		this.searchFieldIcon.classList.add("fa-spin");
		this.searchFieldIcon.classList.add("fa-spinner");

		function success(data) {
			var query = data.SvDSearch.query;

			this.searchResults = data.SvDSearch.results && data.SvDSearch.results.articles || [];
			this.searchHits.innerHTML = '<em>' + searchQuery + '</em> (' + query.count + 'st)';
			
			this.searchField.value = "";
			this.searchFieldIcon.classList.remove("fa-spin");
			this.searchFieldIcon.classList.remove("fa-spinner");
			this.searchFieldIcon.classList.add("fa-search");

			this.render();
		}

		loadJSONP(url, success, this);
	};

	SvD.getSearchResults = function() {
		var results = this.searchResults.slice();

		function byTitle(a, b) {
			if (a.title < b.title) {
				return -1;
			} else if (a.title > b.title) {
				return 1;
			}
			return 0;
		}

		function byTimestamp(a, b) {
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		}

		function toSection(obj, curr) {
			var section = curr.section.split(' ')[0];

			if (!obj[section]) {
				obj[section] = [];
			}
			
			obj[section].push(curr);
			return obj;
		}

		if (this.grouped) {
			return results.sort(byTitle).reduce(toSection, {});
		} else {
			return { "result": results.sort(byTimestamp).reverse() };
		}
	};

	SvD.toggleGrouped = function() {
		this.grouped = !this.grouped;
		this.render();
	};

	SvD.render = function() {
		var results = this.getSearchResults();
		var frag = document.createDocumentFragment();
		var cell = document.createElement('li');
		var link = document.createElement('a');

		this.clearSearchResultsList();

		function appendResult(result) {
			var li = cell.cloneNode();
			var a = link.cloneNode();
			a.href = result.url;
			a.textContent = result.title;
			a.title = result.friendlyDateShort;
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
	};

	SvD.clearSearchResultsList = function() {
		while (this.resultsList.firstChild) {
			this.resultsList.removeChild(this.resultsList.firstChild);
		}
	};

	document.addEventListener("DOMContentLoaded", SvD.init.bind(SvD));

}());