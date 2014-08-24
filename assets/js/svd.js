(function()

	function Svd() {
		this.init = function() {
			console.log('initiating SvD');
			this.searchForm = document.getElementById('search-form');
			this.searchField = document.getElementById('search-field');

		}

		this.init();
	}

	document.addEventListener("DOMContentLoaded", SvD);

}());