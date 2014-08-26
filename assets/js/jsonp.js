//https://gist.github.com/132080/110d1b68d7328d7bfe7e36617f7df85679a08968
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