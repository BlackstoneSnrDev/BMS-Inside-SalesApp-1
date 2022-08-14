const functions = require("firebase-functions");
const admin = require('firebase-admin');

const csvToJson = require('convert-csv-to-json');

let fileInputName = 'myInputFile.csv'; 
let fileOutputName = 'myOutputFile.json';

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


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