const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Set the content type to HTML
    res.setHeader('Content-Type', 'text/html');

    // Read and serve the index.html file
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
        } else {
            res.writeHead(200);
            res.end(data);
        }
    });
});

const port = process.env.PORT || 80;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

