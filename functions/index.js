const functions = require('firebase-functions');
// const NetpieAuth = require('netpie-auth')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.webhook = functions.https.onRequest((req, res) => {
 console.log(req.method)
 if(req.method == "GET") {
  
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === "cmmcWebhook") {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  }
  else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
 }
 else if(req.method == "POST") {
    var data = req.body;
    if (data.object === 'page') {
      data.entry && data.entry.forEach(entry => {
        var pageID = entry.id;
        var timeOfEvent = entry.time;
        console.log(`entry : ${JSON.stringify(entry)}`)
        entry.messaging.forEach(event => {
          if (event.message) {
            receivedMessage(event)
          } else {
            console.log("Webhook received unknown event: ", event)
          }
        })
      
      })
      res.sendStatus(200)
    }
  }
})

function receivedMessage(event) {
  let senderID = event.sender.id
  let recipientID = event.recipient.id
  let timeOfMessage = event.timestamp
  let message = event.message

  console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))
  let messageId = message.mid
  let messageText = message.text
  let messageAttachments = message.attachments
  if (messageText) {
    switch (messageText.toLowerCase()) {
      case 'hello':
        greeting(senderID)
        break;
      case 'button':
        sendButtonMessage(senderID)
        break;
      default:
        sendTextMessage(senderID, messageText)
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function greeting(recipientId) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: `Hello, ${recipientId}`
    }
  }
  callSendAPI(messageData)
}


function sendTextMessage(recipientId, messageText) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText//,
    }
  }
  callSendAPI(messageData)
}


const axios = require('axios')
function callSendAPI(messageData) {
  console.log(`message data : ${JSON.stringify(messageData)}`);
  axios({
    method: 'POST',
    url: 'https://graph.facebook.com/v2.6/me/messages',
    params: {
      'access_token': "EAAbQAxHEdEoBAA6hiUXxF5h3ozx4vgk84X8s4Urjq8v0sOlMq6tLZB9JoAvZAfTZAyVZBwli60e0MDe84TcAgVrZCZAHosFVcZAvr6fy2knP7WZBZAi1jfMpIOduwvvonyBe1llNTuYQy1Gg0a4I7ODZBktEIuijcNpmFHbsHhpgdMjgZDZD"
    },
    data: messageData
  })
  .then(res => {
    if (res.status == 200) {
      let body = res.data
      let recipientId = body.recipient_id;
      let messageId = body.message_id;
      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
      } else {
        console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    }
    else {
      console.error("Failed calling Send API", res.status,
        res.statusText, res.data.error);
    }
  })
  .catch(error => {
    console.log(`error : ${error}`)
    console.log(`axios send message failed`);
  })
}

function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Trigger Postback",
            payload: "DEVELOPER_DEFINED_PAYLOAD"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}