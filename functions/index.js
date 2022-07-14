const functions = require("firebase-functions");
const admin = require('firebase-admin');

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