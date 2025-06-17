interface Env {
  // No KV access in Pages Functions by default
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
    // For now, return a test response since we don't have KV access in Pages Functions
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'No credentials found',
      info: 'Pages Functions need KV configuration - use Worker endpoint instead'
    }), {
      status: 404,
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
    // Parse the request to validate format
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

    // For now, return error since we can't save to KV from Pages Functions
    return new Response(JSON.stringify({
      success: false,
      error: 'Cannot save credentials from Pages Functions. Please use Worker endpoint.',
      info: 'Pages Functions need KV configuration - use Worker endpoint instead'
    }), {
      status: 501,
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