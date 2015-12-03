var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var send = require("./sendSms.js");

var app = express();
var cd = __dirname;

app.use(bodyParser());

var pendingOrders = []
var completeOrders = []

var server = app.listen(4040, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

//continually run sendMessages every x seconds
setInterval( sendMessages, 15000 );

app.post('/order', function (req, res) {

	try {
		var json = req.body
		json.recTime = getDateTime()

		pendingOrders.push( json )
		res.send( "Received order!" )

		fs.appendFile( 'order_log.txt', JSON.stringify( json, null, 4 ), function(err){
			if (err) console.log( "ERROR: ", getDateTime(), err )
			//console.log( getDateTime(), json)
		});
	}
	catch(e) {
    console.log( e.message )
		//res.send(e.message)
	}
})

app.post('/confirm', function(req, res) {
  console.log( "CONFIRM: " );
  var json = req.body;
  console.log( json );
  var cMsg = JSON.stringify( req.body, null, 4 ).toUpperCase();
  console.log( cMsg );
  var orderId = json.body.slice(1);
  var action = json.body.slice(0,1);
  console.log( "ORDER ID: ", orderId );
  console.log( "ACTION TYPE: ", action ); 
  doAction( json.body, orderId, res );
})

function doAction( action, orderId, res ){
  try {
    var found = findOrder( orderId, pendingOrders );
    var foundOld; 
    if ( action == "A" ) {
      if ( found === false ){ 
        res.send( "ORDER " + orderId + " NOT FOUND. WRONG ID?" )
        console.log( "ORDER ", orderId, " NOT FOUND. WRONG ID?" )
      }
      else {
        acceptOrder( found );
        console.log( "ACCEPTED: ", orderId );
        res.send( "ACCEPTED: " + orderId );
      }
    }
    else if (action == "S") {
      foundOld = findOrder( orderId, completeOrders );
      if ( found !== false ) {
        res.send( "STATUS: OPEN" );
        console.log( "STATUS: OPEN" );
      }
      else if ( foundOld !== false ) {
        res.send( "STATUS: ACCEPTED" );
        console.log( "STATUS: ACCEPTED" );
      }
      else {
        res.send( "ORDER " + orderId + " NOT FOUND. WRONG ID?" )
        console.log( "ORDER ", orderId, " NOT FOUND. WRONG ID?" )
      }
    }
    else if (action == "R") {
      foundOld = findOrder( orderId, completeOrders );
      if (found !== false) {
        res.send( pendingOrders[ found ] );
        console.log( pendingOrders[ found ] );
      }
      else if (foundOld !== false) {
        res.send( completeOrders[ foundOld ] );
        console.log( completeOrders[ foundOld ] );
      }
      else {
        res.send( "ORDER " + orderId + " NOT FOUND. WRONG ID?" )
        console.log( "ORDER ", orderId, " NOT FOUND. WRONG ID?" )
      }
    }
    else {
      console.log( "VALID LETTER REQUIRED" );
      res.send( "VALID LETTER REQUIRED" );
    }
  }
  catch(e) {
    console.log( e.message )
    //res.send( e.message )
  }
}

function findOrder( orderId, orders ){
  console.log( findOrder );
  var found = false;
  if ( orders.length == 0 ) return found;
  orders.forEach( function( order, orderIndex, orders ){
    var currentOrder = order.id;
    if (currentOrder == orderId ) found = orderIndex;
  })
  return found;
}

function acceptOrder( orderId ){
  //not sure why I have to stringify, then parse the JSON to move it between arrays
  var moveOrder = JSON.stringify( pendingOrders[ orderId ], null, 4 );
  pendingOrders.splice( orderId, 1 )
  completeOrders.push( JSON.parse( moveOrder ) );
}

function statusOrder( orderId ){
  var order = pendingOrders[ orderId ];
  console.log( "STATUS: ", orderId );
}

function sendMessages() {
  if (pendingOrders.length > 0) { 
    console.log( "SEND MESSAGES" );
    pendingOrders.forEach( function( order, orderIndex, pendingOrders ) {
      send.sendSms( order )
    })
    console.log( "PENDING ORDERS \r" );
    console.log( pendingOrders );
  }
  else { console.log( "All messages sent", getDateTime() ) }
}

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
