const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs");
const path = require("path");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Render / production
  serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );
} else {
  // Local development
  const serviceAccountPath = path.join(
    __dirname,
    "firebase-service-account.json"
  );

  serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
  );
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

module.exports = {
  auth: getAuth()
};