

var express = require('../node_modules/express/index.js');
// var andi = require('./andi');
var app = express();
var PORT = process.env.PORT || 3000;
app.use(require('./andi'));


app.get("/", function (req, res) {
    console.log("your mother");
    console.log(document);
    andi.dandy();

})
app.listen(PORT, function () {
	console.log("App running on port " + PORT + "!");
});

module.exports = app;