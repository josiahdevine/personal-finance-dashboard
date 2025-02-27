// Netlify function to handle POST requests for salary entry creation
exports.handler = async (event, context) => {
    // Log request details
    console.log(`Salary Create API Request: ${event.httpMethod} ${event.path}`);
    console.log(`Origin: ${event.headers.origin || 'No origin'}`);
    console.log(`Query parameters: ${JSON.stringify(event.queryStringParameters || {})}`);
    
    // Get the requesting origin or default to *
    const origin = event.headers.origin || event.headers.Origin || '*';
    
    // Set CORS headers to allow cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
        'Content-Type': 'application/json'
    };
    
    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        // Parse the request body
        let salaryEntry;
        try {
            salaryEntry = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request body' })
            };
        }
        
        // Parse the Authorization header (in a real app, validate this token)
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const userProfileId = salaryEntry.user_profile_id || 'primary';
        
        console.log(`Creating salary entry for user profile ${userProfileId}`);
        
        // In a real application, this would store the entry in a database
        // For now, we'll mock a successful creation response with a generated ID
        
        // Generate a mock ID
        const newId = `entry_${Date.now()}`;
        
        // Return success response with the created entry
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    ...salaryEntry,
                    id: newId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                message: 'Salary entry created successfully'
            })
        };
    } catch (error) {
        console.error('Error creating salary entry:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error creating salary entry',
                message: error.message
            })
        };
    }
}; 