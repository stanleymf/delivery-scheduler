// Cloudflare Pages Function for changing username
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
    const { newUsername, password } = await request.json();

    // Default credentials (should be environment variables in production)
    const ADMIN_PASSWORD = 'admin123';

    // Validate input
    if (!newUsername || !password) {
      return new Response(JSON.stringify({ error: 'Username and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (newUsername.length < 3) {
      return new Response(JSON.stringify({ error: 'Username must be at least 3 characters long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Username validation (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(newUsername)) {
      return new Response(JSON.stringify({ error: 'Username can only contain letters, numbers, and underscores' }), {
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

    // Validate token and get current username
    try {
      const decoded = atob(token);
      const parts = decoded.split(':');
      
      if (parts.length >= 3) {
        const currentUsername = parts[0];
        const timestamp = parseInt(parts[1]);
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (now - timestamp < maxAge) {
          // Check if username is different
          if (newUsername === currentUsername) {
            return new Response(JSON.stringify({ error: 'New username must be different from current username' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Generate new token with new username
          const newToken = btoa(`${newUsername}:${Date.now()}:${Math.random()}`);
          
          return new Response(JSON.stringify({
            success: true,
            message: 'Username changed successfully',
            newUsername: newUsername,
            newToken: newToken,
            note: 'Username change is temporary in this demo version'
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
    return new Response(JSON.stringify({ error: 'Failed to change username' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 