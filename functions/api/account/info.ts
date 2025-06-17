// Cloudflare Pages Function for account info
interface Env {
  DELIVERY_SCHEDULER_KV?: any; // KV namespace for data persistence
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request } = context;
  
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Simple token validation (decode base64 and check format)
    try {
      const decoded = atob(token);
      const parts = decoded.split(':');
      
      if (parts.length >= 3) {
        const username = parts[0];
        const timestamp = parseInt(parts[1]);
        const now = Date.now();
        
        // Check if token is less than 7 days old
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (now - timestamp < maxAge) {
          // Check if email is stored in token (4th part)
          let email = 'admin@example.com'; // Default email
          if (parts.length >= 4 && parts[3]) {
            email = parts[3]; // Email stored in token
          }
          
          // Return account info
          const accountInfo = {
            username: username,
            email: email,
            createdAt: '2024-01-01T00:00:00.000Z', // Default creation date
            lastLogin: new Date().toISOString()
          };
          
          return new Response(JSON.stringify({
            success: true,
            account: accountInfo
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (e) {
      // Invalid token format
    }
    
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get account info' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 