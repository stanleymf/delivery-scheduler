// Cloudflare Pages Function for changing password
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
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Default credentials (should be environment variables in production)
    const ADMIN_PASSWORD = 'admin123';

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return new Response(JSON.stringify({ error: 'All password fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (newPassword !== confirmPassword) {
      return new Response(JSON.stringify({ error: 'New passwords do not match' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'New password must be at least 6 characters long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify current password
    if (currentPassword !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Current password is incorrect' }), {
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
            message: 'Password changed successfully',
            note: 'Password change is temporary in this demo version. Please update your environment variables to persist this change.'
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
    return new Response(JSON.stringify({ error: 'Failed to change password' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 