

var express = require('../node_modules/express/index.js');
// var andi = require('./andi');
var app = express();
var PORT = process.env.PORT || 3000;
var andi = app.use(require('./andi'));


app.get("/", function (req, res) {
    console.log("your mother");
//    console.log(req.body);
    // andi.dandy();

})

app.post("/",(req, res) => {
    console.log("post request");
    andi.myFunction();
})
app.listen(PORT, function () {
	console.log("App running on port " + PORT + "!");
});

module.exports = app;