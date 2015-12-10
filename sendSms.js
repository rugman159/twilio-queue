var keys = require( './keys.js' );
var fs = require('fs');
var moment = require('moment');
// Your accountSid and authToken from twilio.com/user/account
var accountSid; //string
var authToken; //string
var twilioNumber; //string
var numbers; // [ { "courier": "name", "number": "phone#"},{}... ]
var client;

function findValidKey( curKey ){
  accountSid = keys[curKey].accountSid;
  authToken = keys[curKey].authToken;
  twilioNumber = keys[curKey].twilioNumber; 
  numbers = keys[curKey].couriers; 
}

function _sendSms(json,message){
  keys.forEach( function( key, keyIndex, keys){
      findValidKey( keyIndex );
      if (keys[keyIndex].valid){
        client = require('twilio')(accountSid, authToken);

	var recTime = json.recTime;
	var curTime = moment().format();
	var sentTime = json.sentTime;
	var timeDiff = moment().diff(sentTime, "seconds");
	if( timeDiff > 150 || json.statusNew === true){
        numbers.forEach( function( number, numIndex, numbers ) {
			console.log( "MESSAGE: ", json.id );
			console.log( " TO: ", number.courier);
			console.log( " SENT TIME: ", sentTime );
			console.log( " CURRENT TIME: ", curTime );
			console.log( " LAST SEND (SEC): ", timeDiff );
			console.log( " NEW: ", json.statusNew );
	
			//to prevent spam - send if new or older than 100 seconds
					json.statusNew = false; //set to old after first send
					json.sentTime = curTime;

					client.messages.create({
							body: message,
							to: number.number,
							from: twilioNumber
					}, 
					function(err, message) {
						if (err ) { 
								console.log("ERROR SENDING: ")
								console.log( err )
								//process.stdout.write( err )
								console.log( "\r" );
								keys[keyIndex].valid = false;
								if (keyIndex + 1 < keys.length){
									keys[keyIndex + 1].valid = true;
								}
						}
						else {
							console.log( "MESSAGE SENT: ");
							console.log( " ORDER ID: ", json.id);
							console.log( " TO: ", number.courier, " - ", number.number );
							process.stdout.write( " " + message.sid)
							console.log( "\r" );
						}
					});
			})
		}
      }
      else
      {
        //var error = "ACCOUNT " + keyIndex + " INVALID! IGNORING";
        //console.log( error );
      }
  })
}

module.exports = new function() {    
  this.sendSms = function( json ) {
    var message = "" 
    if (json.hasOwnProperty('name') )     message = message + json.name + "\r" 
    if (json.hasOwnProperty('phone') )    message = message + json.phone + "\r"
    if (json.hasOwnProperty('address') )  message = message + json.address + "\r"
    if (json.hasOwnProperty('order') )    message = message + json.order + "\r"
    if (json.hasOwnProperty('payment') )  message = message + json.payment + "\r"
                                          message = message + "A" + json.id + " - to accept.\r"
                                          message = message + "S" + json.id + " - for status.\r"
                                          /*message = message + "R" + json.id + " - to resend.\r"*/
    _sendSms(json,message);
  }
}

