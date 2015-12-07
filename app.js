var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var send = require("./sendSms.js");
var moment = require('moment');

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
//var sendEvery = 120000; //2 min
//var sendEvery = 5000; //5 seconds
var sendEvery = 6 * 5000; //5 seconds

setInterval( sendMessages, sendEvery );

app.post('/order', function (req, res) {

	try {
		var json = req.body
		json.recTime = moment().format();
		json.statusNew = true;
		json.sentTime = "";

		pendingOrders.push( json )
		res.send( response( "Received order!" ) )
		sendMessages();

		fs.appendFile( 'order_log.txt', JSON.stringify( json, null, 4 ), function(err){
			if (err) console.log( "ERROR: ", moment().format(), err )
			//console.log( moment().format(), json)
		});
	}
	catch(e) {
    console.log( e.message )
		//res.send(e.message)
	}
})

app.post('/confirm', function(req, res) {
  console.log( "CONFIRM: " );
  var json =  req.body;
  //console.log( json );
  var cMsg = JSON.stringify( req.body, null, 4 ).toUpperCase();
  //console.log( cMsg );
  var orderId = json.Body.slice(1);
  var action = json.Body.slice(0,1);
  console.log( "ORDER ID: ", orderId );
  console.log( "ACTION TYPE: ", action ); 
  doAction( action, orderId, res );
})

function doAction( action, orderId, res ){
  try {
    var found = findOrder( orderId, pendingOrders );
    var foundOld; 
	foundOld = findOrder( orderId, completeOrders );
	action = action.toUpperCase();
	console.log( "found: ", found );
	//console.log( pendingOrders );
	console.log( "foundOld: ", foundOld);
	//console.log( completeOrders );

    if ( action == "A" ) {
      if ( found === false && foundOld === false){ 
        res.send( response( "ORDER " + orderId + " NOT FOUND. WRONG ID?" ) )
        console.log( "ORDER ", orderId, " NOT FOUND. WRONG ID?" )
      }
	  else if ( foundOld !== false ) {
		res.send( response( "ALREADY ACCEPTED: ", orderId ) );
		console.log( "ALREADY ACCPETED: ", orderId );
	  }
      else {
        acceptOrder( found );
        console.log( "ACCEPTED: ", orderId );
        res.send( response( "ACCEPTED: " + orderId ) );
      }
    }
    else if (action == "S") {
      //foundOld = findOrder( orderId, completeOrders );
      if ( found !== false ) {
        res.send( response( "STATUS: OPEN" ) );
        console.log( "STATUS: OPEN" );
      }
      else if ( foundOld !== false ) {
	  console.log( foundOld );
        res.send( response( "STATUS: ACCEPTED" ) );
        console.log( "STATUS: ACCEPTED" );
      }
      else {
        res.send( response( "ORDER " + orderId + " NOT FOUND. WRONG ID?" ) )
        console.log( "ORDER ", orderId, " NOT FOUND. WRONG ID?" )
      }
    }
    else if (action == "R") {
      foundOld = findOrder( orderId, completeOrders );
      if (found !== false) {
        res.send( response( pendingOrders[ found ] ));
        console.log( pendingOrders[ found ] );
      }
      else if (foundOld !== false) {
        res.send( response (completeOrders[ foundOld ] ));
        console.log( completeOrders[ foundOld ] );
      }
      else {
        res.send( response("ORDER " + orderId + " NOT FOUND. WRONG ID?" ))
        console.log( "ORDER ", orderId, " NOT FOUND. WRONG ID?" )
      }
    }
    else {
      console.log( "VALID LETTER REQUIRED" );
      res.send( response( "VALID LETTER REQUIRED" ));
    }
  }
  catch(e) {
    console.log( e.message )
    //res.send( e.message )
  }
}

function response( message ){
 //wrap the message to be sent to twilio api
 var msg = "<Response><Message>" + message + "</Message></Response>";
 return msg;
}

function findOrder( orderId, orders ){
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
  else { console.log( "All messages sent", moment().format() ) }
}

