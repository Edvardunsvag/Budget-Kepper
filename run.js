var express = require('express');
var app = express();
var bodyParser = require("body-parser");


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get('/', function (req, res) {
  res.sendFile(__dirname+'/index.html');
});

app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + "/" + "style.css");
});

app.post("/", function(req, res){
    console.log(req.body.submit);
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Listening on port 3000");
});
