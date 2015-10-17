var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var cd = __dirname;

app.use(bodyParser());

/*
app.get('/', function (req, res) {
  res.sendFile( cd + '/index.html');
  //tools.test();
});
*
app.post('/validate', function (req, res) {
    icd10.checkCode(req.body.code, function(validCodes){
       res.send( JSON.stringify( validCodes )); 
    })
});
*/
app.post('/order', function (req, res) {

	console.log( req.params.name)
})
var server = app.listen(4040, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

