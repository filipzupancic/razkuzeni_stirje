let path = require('path');
let express = require('express');
let app = express();

let port = process.env.PORT || 5000;

let root = path.join(__dirname, '/');
let bin = path.join(__dirname, 'bin/');

app.use(express.static(root));
app.use(express.static(bin));

app.listen(port, function () {
	console.log("Listening on port: "+port);
});