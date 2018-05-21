const serviceAccount = require("../config/firebase.json");
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://hoycomo-1522801207352.firebaseio.com'
});

//data: Un mapa de pares clave-valor donde todos los valores y las claves son strings.
exports.sendNotification = function(token,title,body,data){
    if (!token) return;
    if (!data) data = {};
    data.title = title;
    data.message = body;
    const payload = {
        //notification: {
        //    title: title,
        //    body: body
        //},
        token: token,
        data: data
    };

    admin.messaging().send(payload)
        .then(function(response) {
            console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
            console.log("Error on send push notification to " + token, error);
        });
};