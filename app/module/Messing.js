const firebase = require('firebase');
const { Wit, log } = require('node-wit');
// const { FIREBASE_CONFIG } = require('./Token');

const client = new Wit({
    accessToken: 'DAY7UF2FNIQQ7IEMFQSO4HJ6AVCJVCEU',
    logger: new log.Logger(log.DEBUG), // optional
});

firebase.initializeApp({
    apiKey: 'AIzaSyBS1G1rahN86_8VdiMjucsB0vVYPBtsPqQ',
    authDomain: 'yonaai-d2ea6.firebaseapp.com',
    databaseURL: 'https://yonaai-d2ea6.firebaseio.com',
    projectId: 'yonaai-d2ea6',
    storageBucket: 'yonaai-d2ea6.appspot.com',
    messagingSenderId: '809038782592',
});

const getUsersList = async (cb) => {
    console.log('start');
    const user = await firebase.database().ref('/Users/').on('value', (snapshot) => {
        const usersList = [];
        snapshot.forEach((data) => {
            usersList.push(data.val());
        });
        cb(usersList);
    });
};

const getProfileId = async (fbiid, cb) => {
    const usersList = [];
    const user = await firebase.database().ref('/Users/').on('value', (snapshot) => {
        snapshot.forEach((data) => {
            usersList.push(data.val());
        });
    });
    const profile = usersList.filter(data => data.facebookId === fbiid);
    if (profile) {
        cb(profile[0].home);
    } else {
        cb(null);
    }
    // let result = await getUsersList((users) => {
    //     const profile = users.filter(data => data.facebookId === fbiid);
    //     if (profile) {
    //         cb(profile[0].home);
    //     } else {
    //         cb(null);
    //     }
    // });
};

const getHomeListData = async (homeid, cb) => {
    const homeRef = firebase.database().ref(/HomeList/ + homeid);
    await homeRef.on('value', (snapshot) => {
        if (snapshot.val()) {
            cb(snapshot.val());
        } else {
            cb(null);
        }
    });
};

const getRoomId = async (homeid, name, cb) => {
    const roomRef = firebase.database().ref(`/HomeList/${homeid}/devicesList`);
    await roomRef.once('value', (snapshot) => {
        if (snapshot.val()) {
            let deviceId = '';
            snapshot.forEach((data) => {
                if (data.val().name === name) {
                    deviceId = data.key;
                }
            });
            if (deviceId) {
                cb(deviceId);
            } else {
                cb(null);
            }
        }
    });
};

const getThingId = async (homeid, roomid, name, cb) => {
    const thingRef = firebase.database().ref(`/HomeList/${homeid}/devicesList/${roomid}/thingsList`);
    await thingRef.once('value', (snapshot) => {
        let thingId = '';
        let iterator = 0;
        if (snapshot.val()) {
            snapshot.val().forEach((data) => {
                if (data.thingName.toUpperCase() === name.toUpperCase()) {
                    thingId = iterator;
                }
                iterator++;
            });
        }
        if (thingId) {
            cb(thingId);
        } else {
            cb(null);
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
                        } else {
                            console.log('tidak ada thing dengan nama tersebut');
                        }
                    });
                } else {
                    console.log('tidak ada tempat dengan nama tersebut');
                }
            }
        });
    });
}

const pesan = 'yon matikan lampu keluarga';
client.message(pesan).then((intentData) => {
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
        console.log(`sending message to ${senderID} with message = ${answer}`);
    } else if (intentData.entities.iot_place) {
        let namaTempat = intentData.entities.iot_place[0].value;
        let namaThing = intentData.entities.iot_things[0].value;
        let state = intentData.entities.on_off[0].value === 'on' ? true : false;
        handleIotAction('1464089753687340', namaTempat, namaThing, state);
    }
})

// const iot_action = (message) => {
//     let thig, place, action = '';
//     if (message.iot_things)
// }
