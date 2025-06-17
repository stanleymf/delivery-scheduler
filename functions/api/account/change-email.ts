// Cloudflare Pages Function for changing email
interface Env {
  DELIVERY_SCHEDULER_KV?: any; // KV namespace for data persistence
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
    const { newEmail, password } = await request.json();

    // Default credentials (should be environment variables in production)
    const ADMIN_PASSWORD = 'admin123';

    // Validate input
    if (!newEmail || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
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
          const username = parts[0];
          
          // Create new token with email included
          const newTokenData = `${username}:${timestamp}:${parts[2]}:${newEmail}`;
          const newToken = btoa(newTokenData);
          
          return new Response(JSON.stringify({
            success: true,
            message: 'Email changed successfully',
            newEmail: newEmail,
            newToken: newToken,
            note: 'Email has been updated in your session'
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
    return new Response(JSON.stringify({ error: 'Failed to change email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 