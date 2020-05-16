

var express = require('../node_modules/express/index.js');
var app = express();
var PORT = process.env.PORT || 3000;
let Andi = require('./andi.js');

app.get("/", function (req, res) {
    console.log("your mother");
    console.log(Andi.andi());
})
app.listen(PORT, function () {
	console.log("App running on port " + PORT + "!");
});