exports.handler = async function(event, context) {
  return {
    statusCode: 404,
    body: JSON.stringify({
      error: "Not Found",
      message: "This endpoint does not exist on the API subdomain",
      path: event.path
    })
  };
}; 