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
const answerListRef = firebase.database().ref('/AnswerListV2/');
console.log('getting answer based intent in firebase')
answerListRef.on('value', (snapshot) => {
  // updateStarCount(postElement, snapshot.val());
  intentAnswerList = snapshot.val();
});

let usersList = '';
const usersRef = firebase.database().ref('/Users/').on('value', (snapshot) => {
  usersList = snapshot.val();
});
console.log(usersList);


const isDefined = (obj) => {
  if (typeof obj === 'undefined') {
    return false;
  }

  if (!obj) {
    return false;
  }

  return obj != null;
};

const handler = (data) => {
  const senderID = data.sender.id;
  const message = data.message.text;
  client.message(message)
    .then((intentData) => {
      if (intentData.entities.intent != null) {
        let answer = '';
        if (intentData.entities.intent[0].value === 'askFacebookId') {
          answer = `Facebook ID mu adalah ${senderID}`;
        } else {
          // getting intent
          const intent = intentData.entities.intent[0].value;
          // getting answerlist form list answer based on intent
          const answerList = intentAnswerList[intent];
          // choose one random in answerlist
          answer = answerList[Math.floor((Math.random() * answerList.length) + 0)];
          // sending message to specified user
        }
        messenger.sendTextMessage(senderID, answer);
        console.log(`sending message to ${senderID} with message = ${answer}`);
      } else if (intentData.entities.iot_place) {
        let namaTempat = intentData.entities.iot_place[0].value;
        let namaThing = intentData.entities.iot_things[0].value;
        let state = intentData.entities.on_off[0].value === 'on' ? true : false;
        handleIotAction(senderID, namaTempat, namaThing, state);
      }
    });
};

const handleIotAction = async (fbid, place, thingname, state) => {

  const usersRef = await firebase.database().ref('/Users/').on('value', (snapshot) => {
      const usersList = [];
      snapshot.forEach((data) => {
          usersList.push(data.val());
      });

      // get home if with facebook id
      const profile = usersList.filter(data => data.facebookId === fbid);
      const homeid = profile[0].home;

      const roomRef = firebase.database().ref(`/HomeList/${homeid}/devicesList`);
      roomRef.once('value', (snapshot) => {
          if (snapshot.val()) {
              let deviceId = '';
              snapshot.forEach((data) => {
                  // getting room id with place name
                  if (data.val().name.toUpperCase() === place.toUpperCase()) {
                      deviceId = data.key;
                  }
              });
              if (deviceId) {
                  const thingRef = firebase.database().ref(`/HomeList/${homeid}/devicesList/${deviceId}/thingsList`);
                  thingRef.once('value', (snapshot) => {
                      let thingId = '';
                      let iterator = 0;
                      if (snapshot.val()) {
                          snapshot.val().forEach((data) => {
                              if (data.thingName.toUpperCase() === thingname.toUpperCase()) {
                                  thingId = iterator;
                              }
                              iterator++;
                          });
                      }
                      if (thingId) {
                          console.log(`/HomeList/${homeid}/devicesList/${deviceId}/thingsList/${thingId}/state/${state}`);
                          firebase.database().ref(`/HomeList/${homeid}/devicesList/${deviceId}/thingsList/${thingId}/`).update({state});
                          let aksi = '';
                          if(thingname.toUpperCase() === 'lampu'.toUpperCase() || thingname.toUpperCase() === 'alarm'.toUpperCase()){
                            if(state){
                              aksi = 'nyalakan'
                            } else{
                              aksi = 'matikan'
                            }
                          } else if(thingname.toUpperCase() === 'kunci'.toUpperCase()){
                            aksi = 'bukain'
                          }
                          messenger.sendTextMessage(fbid, `${thingname} ${place} sudah aku ${aksi}`)
                      } else {
                          console.log('tidak ada thing dengan nama tersebut');
                          messenger.sendTextMessage(fbid, `tidak ada thing dengan tipe ${thingname} di ruangan ${place}`)
                      }
                  });
              } else {
                  console.log('tidak ada tempat dengan nama tersebut');
                  messenger.sendTextMessage(fbid, `tidak ada ruangan dengan nama ${place}`);
              }
          }
      });
  });
}

module.exports = handler;
