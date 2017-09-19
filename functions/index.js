const functions = require('firebase-functions');
const NetpieAuth = require('netpie-auth')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 var netpie = new NetpieAuth({appid: 'CMMCIO', appkey: 'ibJzvcJjWYf87eo', appsecret: 'i8s0R6UEyJQlmgTgsoLK0TVsN'})
 netpie.getMqttAuth(function() {console.log(arguments)}).then(function() { console.log('resolved', arguments); })

 response.send("Hello from Firebase!");
});
