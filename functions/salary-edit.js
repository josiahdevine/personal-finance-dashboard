// Netlify function to handle PUT requests for salary entry updates
exports.handler = async (event, context) => {
    // Log request details
    console.log(`Salary Edit API Request: ${event.httpMethod} ${event.path}`);
    console.log(`Origin: ${event.headers.origin || 'No origin'}`);
    console.log(`Query parameters: ${JSON.stringify(event.queryStringParameters || {})}`);
    
    // Set CORS headers to allow cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
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
    
    // Only allow PUT requests
    if (event.httpMethod !== 'PUT') {
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
        
        // Get the entry ID from the path or query parameters
        const pathParts = event.path.split('/');
        const entryId = pathParts[pathParts.length - 1];
        
        // Validate entry ID
        if (!entryId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Entry ID is required' })
            };
        }
        
        // Parse the Authorization header (in a real app, validate this token)
        const authHeader = event.headers.authorization;
        const userProfileId = salaryEntry.user_profile_id || 'primary';
        
        console.log(`Updating salary entry: ${entryId} for user profile ${userProfileId}`);
        
        // In a real application, this would update the database
        // For now, we'll mock a successful update response
        
        // Return success response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    ...salaryEntry,
                    id: entryId,
                    updated_at: new Date().toISOString()
                },
                message: 'Salary entry updated successfully'
            })
        };
    } catch (error) {
        console.error('Error updating salary entry:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error updating salary entry',
                message: error.message
            })
        };
    }
}; 