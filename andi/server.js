

var express = require('../node_modules/express/index.js');
// const express = require('express').Router();
// var andi = require('./andi.js').default;
var app = express();
var PORT = process.env.PORT || 3000;
// var andi = app.use(require('./andi'));

// var andiObj = new andi();
// app.get("/", function (req, res) {
//     console.log("your mother");
//     console.log(andi);
// //    console.log(req.body);
//      andiObj.myFunction();

// })

// app.post("/",(req, res) => {
//     console.log("post request");
//     andi.myFunction();
// })
app.listen(PORT, function () {
	console.log("App running on port " + PORT + "!");
});

module.exports = app;