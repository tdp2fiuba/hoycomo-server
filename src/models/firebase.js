const serviceAccount = require("../config/firebase.json");
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://hoycomo-1522801207352.firebaseio.com'
});


const payload = {
    notification: {
        title: "HoyComo",
        body: "HoyComo"
    }

};

exports.sendNotification = function(token,title,body){
    if (!token) return;
    payload.notification.title = title || "HoyComo";
    payload.notification.body = body || "HoyComo";

    admin.messaging().sendToDevice(token, payload)
        .then(function(response) {
            console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
            console.log("Error on send push notification to " + token, error);
        });
};
