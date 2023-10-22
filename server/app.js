var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("Hello from the MTA Surfers");
  res.end();
}).listen(8080);