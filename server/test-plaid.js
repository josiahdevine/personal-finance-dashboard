const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  secret: process.env.PLAID_SECRET,
  clientID: process.env.PLAID_CLIENT_ID,
  version: '2020-09-14',
});

const client = new PlaidApi(configuration);

try {
  console.log("Resolved path to plaid:", require.resolve('plaid'));
} catch (e) {
  console.error("Could not resolve 'plaid':", e);
}

console.log("process.env.PLAID_CLIENT_ID", process.env.PLAID_CLIENT_ID);
console.log("process.env.PLAID_SECRET", process.env.PLAID_SECRET);

console.log("process.env", process.env)

if (client) {
  console.log("Plaid SDK loaded correctly");
} else {
  console.log("Plaid SDK not loaded correctly");
}