const handler = require('./module/Handler');
const FBMessenger = require('fb-messenger');

const { PAGE_ACCESS_TOKEN } = require('./module/Token');

const messenger = new FBMessenger(PAGE_ACCESS_TOKEN);

const processor = (req, res) => {
  const data = req.body;
  console.log('[DEBUG] data', data);
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // entries may be batched so iterate over each one
    data.entry.forEach((pageEntry) => {
      // const pageID = pageEntry.id;
      // const timeOfEvent = pageEntry.time;

      // iterate over each messaging event
      pageEntry.messaging.forEach((messagingEvent) => {
        const propertyNames = [];
        for (const prop in messagingEvent) { propertyNames.push(prop); }
        console.log('[app.post] Webhook received a messagingEvent with properties: ', propertyNames.join());
        if (messagingEvent.message) {
          handler(messagingEvent);
        } else {
          console.log('[app.post] Webhook is not prepared to handle this message.');
        }
      });
    });

    // Assume all went well.

    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.

    res.sendStatus(200);
  }
};

module.exports = processor;
