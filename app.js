var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");

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

var pendingOrders = []

app.post('/order', function (req, res) {

	try {
		var json = req.body
		json.recTime = getDateTime()
		/*var wstream = fs.createWriteStream('order_log.txt');

		wstream.on('finish', function () {
		  console.log( json, "added to order log");
		});
		wstream.write( JSON.stringify( json, null, 4 ));
		wstream.end();
*/
		fs.appendFile( 'order_log.txt', JSON.stringify( json, null, 4 ), function(err){
			if (err) console.log( getDateTime(), err )
			console.log( getDateTime(), json)

		});
		pendingOrders.push( json )
		res.send( pendingOrders )

	}
	catch(e) {
		res.send(e.message)
	}
})
var server = app.listen(4040, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}
