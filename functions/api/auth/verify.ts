// Cloudflare Pages Function for token verification
interface Env {
  // Define environment variables if needed
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
          return new Response(JSON.stringify({
            success: true,
            user: username,
            valid: true
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
    return new Response(JSON.stringify({ error: 'Verification failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 