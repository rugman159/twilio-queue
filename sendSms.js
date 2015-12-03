// Your accountSid and authToken from twilio.com/user/account
var accountSid = 'AC27e02f49f17a1570a8711c48f4c02b8c';
var authToken = "9c669a7be059c1f87282b5992f9a44ac";
var twilioNumber = "+14582022610";
var numbers = [{ "courier" : "rug" , "number" : "5412803322"  }];
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
