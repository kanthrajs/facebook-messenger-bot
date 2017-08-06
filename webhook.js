const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const apiaiApp = require('apiai')("5ebc38834e084a56803bd8ed3db26894");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'kanthraj_bot') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

// function sendMessage(event) {
//   let sender = event.sender.id;
//   let text = event.message.text;

//   request({
//     url: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: {access_token: 'EAAP4kcftyVABAFLIL9763iJ2Rh8npYH2T5Ld9xYqD1ia57CuqRb1bnyt4kpkSiVV8zXJIOXsf6S3pXh05rZCxyXSDZBiWatgUR02xMO27lgT2XUMWINoqrldRipXi6wRQMsGjMj7MyuNiIZAPuHqRLxgHNgXWudozf8VApoLQZDZD'},
//     method: 'POST',
//     json: {
//       recipient: {id: sender},
//       message: {text: text}
//     }
//   }, function (error, response) {
//     if (error) {
//         console.log('Error sending message: ', error);
//     } else if (response.body.error) {
//         console.log('Error: ', response.body.error);
//     }
//   });
// }

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'kanthraj_aibot' // use any arbitrary id
  });

  apiai.on('response', (response) => {

    let aiText = response.result.fulfillment.speech;

    console.log(response);
    // Got a response from api.ai. Let's POST to Facebook Messenger

    request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: 'EAAP4kcftyVABAFLIL9763iJ2Rh8npYH2T5Ld9xYqD1ia57CuqRb1bnyt4kpkSiVV8zXJIOXsf6S3pXh05rZCxyXSDZBiWatgUR02xMO27lgT2XUMWINoqrldRipXi6wRQMsGjMj7MyuNiIZAPuHqRLxgHNgXWudozf8VApoLQZDZD'},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: aiText}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
  


  });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();
}