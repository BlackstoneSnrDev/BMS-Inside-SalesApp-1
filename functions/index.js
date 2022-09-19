const functions = require("firebase-functions");
const admin = require('firebase-admin');

const csvToJson = require('convert-csv-to-json');

let fileInputName = 'myInputFile.csv'; 
let fileOutputName = 'myOutputFile.json';

const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

const { MessagingResponse } = require('twilio').twiml;

let accountSID = 'ACf89f918daf03a28f51e085cb86cd642f';
let apiSID = 'SKb186de96befa9a6322e2d08f58787183';
let authToken = '165db0edc5ab2180f1446c1311a41438';
let secret = 'IEmLyPMwNX3RWlVUNFEJfaZZY5P8BP5F';
let twiMLSID= 'AP871e1dd557a56c71ef1a82b5dcd98ce0';
let sendingPhoneNumber = '+12056497315';

let clientAccountSID = 'ACf89f918daf03a28f51e085cb86cd642f';
let clientAuthToken = 'ae6bb6d9db1a83f0167cdeb5e7906c8d';

const clientForCalls = require('twilio')(clientAccountSID, clientAuthToken);
const client = new twilio(accountSID, authToken);

// admin.initializeApp();
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.sendText = functions.https.onCall((data, context) => {
    console.log(data);
    const textMessage = {
        body: data.message, 
        to: data.to,
        from: sendingPhoneNumber
    }

    admin.firestore().collection('Tenant').doc(data.dbObj).collection('templates').doc(data.activeTemplate).collection('customers').doc(data.customerUid).update({
        smsText: admin.firestore.FieldValue.arrayUnion({
            message: data.message,
            timestamp: admin.firestore.Timestamp.now(),
            userId: data.userInfo.uid,
            userName: data.userInfo.username,
            method: 'sent'
        })
    }).then(() => {
        admin.firestore().collection('Tenant').doc(data.dbObj).collection('phoneNumbers').doc(sendingPhoneNumber).update({
            '+17348371063': {
                customerUid: data.customerUid,
                template: data.activeTemplate,
                message: data.message,
                timestamp: admin.firestore.Timestamp.now(),
                userId: data.userInfo.uid,
                userName: data.userInfo.username,
                method: 'sent'
            }
        })
    })
    .then(() => {
        clientForCalls.messages.create(textMessage).then(message => console.log(message.sid)).catch(err => console.log(err));
    }).catch(err => console.log(err));
    
});

exports.receiveText = functions.https.onRequest((req, res) => {
    console.log(req.body);
    let dbObj;
    admin.firestore().collection('Tenant').where('phoneNumbers', 'array-contains', req.body.To).get().then(snapshot => {
        dbObj = snapshot.docs[0].id;
    })
    .then(() => {
        admin.firestore().collection('Tenant').doc(dbObj).collection('phoneNumbers').doc(req.body.To).get().then(doc => {
            let customerUid = doc.data()[req.body.From].customerUid;
            let template = doc.data()[req.body.From].template;
            let message = doc.data()[req.body.From].message;
            let timestamp = doc.data()[req.body.From].timestamp;
            let userId = doc.data()[req.body.From].userId;
            let userName = doc.data()[req.body.From].userName;
            let method = doc.data()[req.body.From].method;
            admin.firestore().collection('Tenant').doc(dbObj).collection('templates').doc(template).collection('customers').doc(customerUid).update({
                smsText: admin.firestore.FieldValue.arrayUnion({
                    message: req.body.Body,
                    timestamp: admin.firestore.Timestamp.now(),
                    userId: userId,
                    userName: userName,
                    method: 'received'
                })
            })
        }).then(() => {
            res.send('success');
        }).catch(err => console.log(err));
    })
});


exports.generateToken = functions.https.onCall((req, res) => {
    console.log(req);
    const page = req.page;
    const clientName = (page == "/dashboard"? "support_agent" : "customer");

    const accessToken = new AccessToken(accountSID, apiSID, secret);
    accessToken.identity = clientName;
  
    const grant = new VoiceGrant({
      outgoingApplicationSid: twiMLSID,
      incomingAllow: true,
    });
    accessToken.addGrant(grant);
    return { token: accessToken.toJwt()};

});

exports.twilioCallEndpoint = functions.https.onRequest((req, res) => {
  
    var phoneNumber = req.body.outgoingPhoneNumber;
    var callerId = sendingPhoneNumber;
    var twiml = new VoiceResponse();
  
    var dial = twiml.dial({callerId : callerId, machineDetection: 'Enable'});
    if (phoneNumber) {
      dial.number({}, phoneNumber);
    } else {
      dial.client({}, "support_agent");
    };
    console.log(twiml.toString());
    res.type('text/xml');
    res.send(twiml.toString());
});

exports.test = functions.https.onCall((req, res) => {
    clientForCalls.calls
    .create({
       AsyncAmd: true,
       url: "https://handler.twilio.com/twiml/EH4139e1465104bc07102f2046d325a76d",
       AsyncAmdStatusCallback: "https://async-amd-9844.twil.io/async_callback",
       to: '+17348371063',
       from: '+12056497315'
     })
    .then(call => console.log(call.sid));
})

exports.makePhoneCall = functions.https.onCall((req, res) => {
    var phoneNumber = req.body.outgoingPhoneNumber;
    var callerId = sendingPhoneNumber;
    var twiml = new VoiceResponse();
  
    var dial = twiml.dial({callerId : callerId});
    if (phoneNumber) {
        dial.number({}, phoneNumber)
    } else {
        dial.client({}, "support_agent");
    };
    res.type('text/xml');
    res.send(twiml.toString());
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

exports.helloWorld = functions.https.onRequest((request, response) => {   
  
    const db = admin.firestore();
    const ref = db.collection('test').doc('test');

    ref.get().then(doc => {
        if(!doc.exists){
            console.log('No such document!');
            response.send('No such document!')
        } else {
            console.log('Document data:', doc.data());
            response.send('Document data:'+ doc.data())
        }
    }).catch(err => {
        console.log('Error getting document', err);
    });
    // ref.get().then((doc)=> {
    //         console.log(doc.data());
    //         functions.logger.info(doc, {structuredData: true});
    //         response.send('Document data:'+ doc.data())
    // }).catch(e => {
    //         console.log('error; '+e)
    // })
});