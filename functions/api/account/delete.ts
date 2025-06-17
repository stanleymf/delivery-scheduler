// Cloudflare Pages Function for account deletion
interface Env {
  // Define environment variables if needed
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request } = context;
  
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const { password, confirmDelete } = await request.json();

    // Default credentials (should be environment variables in production)
    const ADMIN_PASSWORD = 'admin123';

    // Validate input
    if (!password || confirmDelete !== 'DELETE') {
      return new Response(JSON.stringify({ error: 'Password and confirmation required. Type "DELETE" to confirm.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Password is incorrect' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate token
    try {
      const decoded = atob(token);
      const parts = decoded.split(':');
      
      if (parts.length >= 3) {
        const timestamp = parseInt(parts[1]);
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (now - timestamp < maxAge) {
          return new Response(JSON.stringify({
            success: true,
            message: 'Account deletion confirmed',
            note: 'In this demo version, account deletion would clear all data but is not permanently implemented'
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
    return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 