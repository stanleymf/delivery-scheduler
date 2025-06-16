// Cloudflare Pages Function for logout
interface Env {
  // Define environment variables if needed
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request } = context;
  
  try {
    // For stateless authentication, logout is just a client-side operation
    // We'll return success to maintain compatibility with the frontend
    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 