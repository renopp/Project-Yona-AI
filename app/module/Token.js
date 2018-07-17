/*
 * 
 * Get some variable environment from .env file
 *
 */

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = process.env.MESSENGER_APP_SECRET;

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN;

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;

// Config for Firebase Service
const FIREBASE_CONFIG = {
  "apiKey": process.env.FIREBASE_apiKey,
  "authDomain": process.env.FIREBASE_authDomain,
  "databaseURL": process.env.FIREBASE_databaseURL,
  "projectId": process.env.FIREBASE_projectId,
  "storageBucket": process.env.FIREBASE_storageBucket,
  "messagingSenderId": process.env.FIREBASE_messagingSenderId
}

// Access token for Wit.ai api
const WIT_ACCESS_TOKEN = process.env.WIT_ACCESS_TOKEN;

// making sure that everything has been properly configured
if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error('Missing config values, Please complete config values on .env file');
  process.exit(1);
}

module.exports = {
  APP_SECRET,
  VALIDATION_TOKEN,
  PAGE_ACCESS_TOKEN,
  FIREBASE_CONFIG,
  WIT_ACCESS_TOKEN
};
