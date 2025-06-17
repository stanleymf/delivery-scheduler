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

    const { userData } = await request.json();

    if (!userData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No user data provided'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Sync data to Widget KV storage
    try {
      console.log('Syncing admin dashboard data to Widget KV storage...', {
        timeslots: userData.timeslots?.length || 0,
        blockedDates: userData.blockedDates?.length || 0,
        settings: Object.keys(userData.settings || {}).length
      });

      // Push data to Widget Worker's sync endpoint
      const widgetResponse = await fetch('https://delivery-scheduler-widget.stanleytan92.workers.dev/api/sync/delivery-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeslots: userData.timeslots || [],
          blockedDates: userData.blockedDates || [],
          blockedDateRanges: userData.blockedDateRanges || [],
          settings: {
            ...userData.settings,
            collectionLocations: userData.settings?.collectionLocations || [
              {id: '1', name: 'Main Store', address: '123 Orchard Road, Singapore 238858'},
              {id: '2', name: 'Marina Bay Branch', address: '456 Marina Bay Sands, Singapore 018956'},
              {id: '3', name: 'Sentosa Outlet', address: '789 Sentosa Gateway, Singapore 098269'}
            ],
            tagMappingSettings: userData.tagMappingSettings || {
              deliveryTag: 'Delivery',
              collectionTag: 'Collection',
              expressTag: 'Express'
            }
          },
          lastUpdated: new Date().toISOString()
        })
      });

      if (widgetResponse.ok) {
        const result = await widgetResponse.json();
        console.log('Widget sync successful:', result);

        return new Response(JSON.stringify({
          success: true,
          message: 'Data successfully synced to Widget',
          syncedToWidget: true,
          lastUpdated: new Date().toISOString(),
          itemsSynced: {
            timeslots: userData.timeslots?.length || 0,
            blockedDates: userData.blockedDates?.length || 0,
            blockedDateRanges: userData.blockedDateRanges?.length || 0,
            settings: Object.keys(userData.settings || {}).length
          }
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      } else {
        const errorText = await widgetResponse.text();
        console.error('Widget sync failed:', errorText);
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to sync to Widget',
          details: errorText
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

    } catch (syncError) {
      console.error('Sync error:', syncError);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Sync operation failed',
        details: syncError instanceof Error ? syncError.message : 'Unknown sync error'
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

  } catch (error) {
    console.error('Sync endpoint error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Sync request failed',
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