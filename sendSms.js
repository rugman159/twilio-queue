var keys = require( './keys.js' );
// Your accountSid and authToken from twilio.com/user/account
var accountSid = keys.accountSid; //string
var authToken = keys.authToken; //string
var twilioNumber = keys.twilioNumber; //string
var numbers = keys.couriers; // [ { "courier": "name", "number": "phone#"},{}... ]
var client = require('twilio')(accountSid, authToken);

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
    numbers.forEach( function( number, numIndex, numbers ) {
      client.messages.create({
          body: message,
          to: number.number,
          from: twilioNumber
      }, function(err, message) {
          if (err ) { 
            console.log("ERROR SENDING: ")
            process.stdout.write(message.sid)
            console.log( "\r" );
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
