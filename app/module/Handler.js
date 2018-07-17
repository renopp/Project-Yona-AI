const { Wit, log } = require('node-wit');
const FBMessenger = require('fb-messenger');
const firebase = require('firebase');

const { PAGE_ACCESS_TOKEN, WIT_ACCESS_TOKEN, FIREBASE_CONFIG } = require('./Token');

const messenger = new FBMessenger(PAGE_ACCESS_TOKEN);

const client = new Wit({
  accessToken: WIT_ACCESS_TOKEN,
  logger: new log.Logger(log.DEBUG), // optional
});

firebase.initializeApp(FIREBASE_CONFIG);
let intentAnswerList;
let getAnswerList = firebase.database().ref('/AnswerListV2/');
console.log('getting answer based intent in firebase')
getAnswerList.on('value', (snapshot) => {
  // updateStarCount(postElement, snapshot.val());
  intentAnswerList = snapshot.val();
});


const isDefined = (obj) => {
  if (typeof obj === 'undefined') {
    return false;
  }

  if (!obj) {
    return false;
  }

  return obj != null;
};

const handler = async (data) => {
  const senderID = data.sender.id;
  const message = data.message.text;
  messenger.sendAction(senderID, 'mark_seen');
  await setTimeout((() => messenger.sendAction(senderID, 'typing_on'), 3000));
  messenger.sendAction(senderID, 'typing_off');
  client.message(message)
    .then((intentData) => {
      if (intentData.entities.intent != null) {
        // getting intent
        const intent = intentData.entities.intent[0].value;
        // getting answerlist form list answer based on intent
        const answerList = intentAnswerList[intent];
        // choose one random in answerlist
        const answer = answerList[Math.floor((Math.random() * answerList.length) + 0)];
        // sending message to specified user
        messenger.sendTextMessage(senderID, answer);
        console.log(`sending message to ${senderID} with message = ${answer}`)
      }
    });
};

module.exports = handler;
