interface Env {
  // Add your environment variables here
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request } = context;
  
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No token provided' 
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Return placeholder data since we're using Widget KV storage
    // In a full multi-tenant setup, this would fetch user-specific data
    const userData = {
      timeslots: [],
      blockedDates: [],
      blockedDateRanges: [],
      settings: {},
      products: [],
      blockedCodes: [],
      tagMappingSettings: {
        mappings: [],
        enableTagging: true,
        prefix: '',
        separator: ','
      },
      lastUpdated: new Date().toISOString(),
      note: 'Data is managed through Widget KV storage. Use the Settings page to configure timeslots and sync to widget.'
    };

    return new Response(JSON.stringify({
      success: true,
      data: userData,
      message: 'User data retrieved successfully'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('Get user data error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to retrieve user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}

// Handle OPTIONS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 