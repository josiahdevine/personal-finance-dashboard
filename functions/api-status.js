exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  };
}; 