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

    // Get Shopify credentials from KV
    const credentials = await env.DELIVERY_DATA.get(`user:${userId}:shopify-credentials`);
    if (!credentials) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No credentials found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const creds = JSON.parse(credentials);
    return new Response(JSON.stringify({
      success: true,
      credentials: {
        shopDomain: creds.shopDomain,
        accessToken: creds.accessToken,
        apiVersion: creds.apiVersion,
        appSecret: creds.appSecret
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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

export async function onRequestPost(context: { env: Env; request: Request }) {
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

    // Save Shopify credentials to KV
    const body = await request.json();
    const { shopDomain, accessToken, apiVersion, appSecret } = body as any;

    // Validate required fields
    if (!shopDomain || !accessToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Shop domain and access token are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Store credentials (in production, encrypt these)
    const credentials = {
      shopDomain: shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      accessToken,
      apiVersion: apiVersion || '2024-01',
      appSecret: appSecret || '',
      savedAt: new Date().toISOString()
    };

    await env.DELIVERY_DATA.put(`user:${userId}:shopify-credentials`, JSON.stringify(credentials));

    return new Response(JSON.stringify({
      success: true,
      message: 'Credentials saved successfully and persisted to storage'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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