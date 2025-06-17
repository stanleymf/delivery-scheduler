interface Env {
  DELIVERY_DATA: any; // KVNamespace type
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  const { env, request } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Extract user ID from authorization (simplified for now - in production, verify JWT)
    const authHeader = request.headers.get('Authorization');
    const userId = authHeader ? 'default-user' : 'anonymous'; // Simplified auth

    // Test Shopify connection
    const credentials = await env.DELIVERY_DATA.get(`user:${userId}:shopify-credentials`);
    if (!credentials) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No credentials configured. Please set up your credentials first.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const creds = JSON.parse(credentials);
    const shopifyUrl = `https://${creds.shopDomain}/admin/api/${creds.apiVersion}/shop.json`;

    try {
      const response = await fetch(shopifyUrl, {
        headers: {
          'X-Shopify-Access-Token': creds.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const shopData = await response.json() as any;
        return new Response(JSON.stringify({
          success: true,
          shopName: shopData.shop.name,
          plan: shopData.shop.plan_name,
          email: shopData.shop.email
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid credentials or connection failed'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Shopify API request failed: ' + error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 