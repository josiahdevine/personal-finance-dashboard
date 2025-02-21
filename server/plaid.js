const plaid = require('plaid');
console.log(plaid);
const client = new plaid.PlaidApi(new plaid.Configuration({ 
  clientID: '67b3ec330ef070001f1e8ff7', 
  secret: '2f9d731a9ec51e7f536cbae5658300',  
  environment: plaid.PlaidEnvironments.sandbox, 
  options: {
      version: '2020-09-14',      
  },
  }));
  
  module.exports = client;