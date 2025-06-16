// Cloudflare Pages Function for authentication
interface Env {
  // Define environment variables if needed
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request } = context;
  
  try {
    const { username, password } = await request.json();

    // Default credentials (should be environment variables in production)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate simple token (in production, use proper JWT)
      const token = btoa(`${username}:${Date.now()}:${Math.random()}`);
      
      return new Response(JSON.stringify({
        success: true,
        token,
        user: username,
        message: 'Login successful'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 