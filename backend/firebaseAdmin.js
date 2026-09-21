const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

module.exports = {
  auth: getAuth()
};