var express = require("express");
var app = express();
var med_app = require("./app");

app.set('port', process.env.PORT || 3000);
app.use('/medication', med_app);
app.get('/', function (req, res) {
  res.send("This is the '/' route in main_app");
});


app.listen(app.get('port'));
console.log("server listening on port " + app.get('port'));
