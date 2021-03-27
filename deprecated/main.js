var http = require ('http');
var  url = require ('url');
var   fs = require ('fs');

http.createServer
(
	function (request, response)
	{
		/*
		var q = url.parse (request.url, true);
		var filename = "." + q.pathname;
		console.log (filename);
		*/

		fs.readFile ("schedule.html",
			function (err, data)
			{
				if (err) response.end();
				response.writeHead (200, {'Content-Type': 'text/html'});
				response.write (data);
				return response.end();
			}
		);
	}
).listen(8080);
