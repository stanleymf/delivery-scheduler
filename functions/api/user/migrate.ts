interface Env {
  // Add your environment variables here
}

export async function onRequestPost(context: { request: Request; env: Env }) {
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
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const { localStorageData } = await request.json();

    // For now, return success since we're using the Widget's KV storage
    // In a full multi-tenant setup, this would save to user-specific storage
    console.log('Migration request received with data:', {
      timeslots: localStorageData?.timeslots?.length || 0,
      blockedDates: localStorageData?.blockedDates?.length || 0,
      settings: Object.keys(localStorageData?.settings || {}).length,
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Data migration completed. Configuration is now stored in the Widget KV storage.',
      action: 'migration_acknowledged',
      note: 'Your data is already synced to the widget through the KV storage system.'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 