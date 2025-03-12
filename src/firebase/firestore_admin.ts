var admin = require("firebase-admin");
const path = require("path");

var serviceAccount = require(path.join(__dirname, "../../secret_keys/jbs-rv-firebase-adminsdk-fbsvc-137f887fea.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin initialized");
}

export const firestoreDb = admin.firestore();
export default admin;


