var express = require('express');
var app = express();
app.use(express.static('src'));
app.use(express.static('../cryptofans-contract/build/contracts'));

app.get('/', function (req, res) {
    res.render('index.html');
    });
app.get('/', function (req, res) {
    res.render('providers.html');
    });
app.get('/', function (req, res) {
    res.render('providers_func.html');
    });
app.get('/', function (req, res) {
    res.render('subscribers.html');
    });
app.get('/', function (req, res) {
    res.render('subscribers_func.html');
    });
    
app.listen(3000, function () {
console.log('Cryptofans app listening on port 3000!');
});