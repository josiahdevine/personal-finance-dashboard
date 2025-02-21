const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const plaid = require('plaid');

try {
  console.log("Resolved path to plaid:", require.resolve('plaid'));
} catch (e) {
  console.error("Could not resolve 'plaid':", e);
}

console.log("Plaid object:", plaid);
console.log("environments", plaid.environments);
console.log("process.env.PLAID_CLIENT_ID", process.env.PLAID_CLIENT_ID);
console.log("process.env.PLAID_SECRET", process.env.PLAID_SECRET);

console.log("process.env", process.env)

if (plaid && plaid.environments && plaid.environments.sandbox) {
  console.log("Plaid SDK loaded correctly. Sandbox environment:", plaid.environments.sandbox);
} else {
  console.log("Plaid SDK not loaded correctly or missing 'environments' property.");
}