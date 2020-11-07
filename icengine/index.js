let path = require('path');
let express = require('express');
let app = express();

let port = process.env.PORT || 5000;

let root = path.join(__dirname, '/');
let bin = path.join(__dirname, 'bin/');
let public = path.join(__dirname, 'public/');

app.use(express.static(root));
app.use(express.static(bin));
app.use(express.static(public));

app.listen(port, function () {
	console.log("Listening on port: "+port);
});