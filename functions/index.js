const functions = require("firebase-functions");
const admin = require('firebase-admin');

const csvToJson = require('convert-csv-to-json');

let fileInputName = 'myInputFile.csv'; 
let fileOutputName = 'myOutputFile.json';

const twilio = require('twilio');

const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

let accountSID = 'ACf89f918daf03a28f51e085cb86cd642f';
let apiSID = 'SKb186de96befa9a6322e2d08f58787183';
let authToken = '74e54ce6939ef77e126b4039ed08fde1';
let secret = 'IEmLyPMwNX3RWlVUNFEJfaZZY5P8BP5F';
let sendingPhoneNumber = '+12056497315';


const client = new twilio(accountSID, authToken);

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.sendText = functions.https.onCall(async (data, context) => {
    console.log(data.text, 'Sent Text');
    const textMessage = {
        body: "Hello from the testing environment", 
        to: '+17348371063',
        from: sendingPhoneNumber
    }
    client.messages.create(textMessage).then(message => console.log(message.sid));
});



exports.generateToken = functions.https.onCall((req, res) => {
    console.log(req);
    const page = req.page;
    const clientName = (page == "/dashboard"? "support_agent" : "customer");

    const accessToken = new AccessToken(accountSID, apiSID, secret);
    accessToken.identity = clientName;
  
    const grant = new VoiceGrant({
      outgoingApplicationSid: accountSID,
      incomingAllow: true,
    });
    accessToken.addGrant(grant);
    return JSON.stringify({ token: accessToken.toJwt() });

});



exports.makePhoneCall = functions.https.onCall(async (data, context) => {
    console.log('Phone Call');
    client.calls
        .create({
            from: sendingPhoneNumber,
            to: '+17348371063',
            url: 'https://demo.twilio.com/welcome/voice/',
        })
        .then(call => console.log(call.sid));
});


exports.createNewUser = functions.https.onCall(async (data, context) => {
    console.log("++++++++++ CreateNewUserFIRED ++++++++++");
    console.log(data);
    try {
        user = await admin.auth().createUser({
            email: data.email,
            emailVerified: true,
            password: data.password,
            displayName: data.displayName,
            disabled: false,
        });

        admin.firestore().collection('Tenant').doc(data.dbObjKey).collection('users').doc(user.uid).set({
            activeTemplate: 'Template One',
            admin: false,
            department: data.department,
            email: data.email,
            name: data.displayName, 
            roles: [],
            tenant: data.tenant,
            uid: user.uid,
            username: data.displayName,

        })

        return {
            response: user
        };
    } catch (error) {
        throw new functions.https.HttpsError(error);
    }
}); 

exports.csvToJson = functions.https.onCall((data, context) => { 
    console.log("++++++++++ csvToJsonFIRED ++++++++++");
    console.log(data);
    let json = csvToJson.getJsonFromCsv(data);
    for(let i=0; i<json.length;i++){
        console.log(json[i]);
    }
})