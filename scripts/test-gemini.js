const axios = require('axios');
const firebase = require('firebase/app');
require('firebase/auth');

async function testGeminiIntegration() {
  try {
    // Initialize Firebase (use your config)
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    };
    
    firebase.initializeApp(firebaseConfig);
    
    // Get Firebase token
    const user = await firebase.auth().currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    const token = await user.getIdToken();
    
    // Test Gemini API
    const response = await axios.post(
      'https://trypersonalfinance.com/.netlify/functions/gemini',
      {
        prompt: 'Hello, how can you help me with my finances?'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Gemini API Response:', response.data);
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testGeminiIntegration(); 