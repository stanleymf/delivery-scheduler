export interface Env {
	SHOPIFY_ACCESS_TOKEN: string;
	SHOPIFY_SHOP_DOMAIN: string;
	SHOPIFY_API_VERSION: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		// CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// Handle preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			// Serve customer widget bundle
			if (path === '/widget.js') {
				return await serveWidgetBundle();
			}

			// Serve widget CSS
			if (path === '/widget.css') {
				return await serveWidgetCSS();
			}

			// Shopify API proxy
			if (path.startsWith('/api/shopify/')) {
				return await handleShopifyRequest(request, env, path.replace('/api/shopify/', ''));
			}

			// Delivery scheduler API
			if (path.startsWith('/api/delivery/')) {
				return await handleDeliveryRequest(request, env, path.replace('/api/delivery/', ''));
			}

			// Health check
			if (path === '/health') {
				return new Response(JSON.stringify({ status: 'ok', version: '1.1.5' }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Widget documentation
			if (path === '/widget-docs') {
				return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>Delivery Scheduler Widget - Integration Guide</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🚚 Delivery Scheduler Widget Integration</h1>
    
    <h2>Quick Start</h2>
    <p>Add this code to your Shopify theme:</p>
    <pre><code>&lt;div id="delivery-scheduler-widget" 
     data-delivery-scheduler 
     data-shop-domain="your-store.myshopify.com"&gt;&lt;/div&gt;
&lt;script src="https://your-worker-url.com/widget.js"&gt;&lt;/script&gt;</code></pre>

    <h2>Advanced Configuration</h2>
    <pre><code>&lt;div id="delivery-scheduler-widget" 
     data-delivery-scheduler 
     data-shop-domain="your-store.myshopify.com"
     data-product-id="123456789"
     data-variant-id="987654321"
     data-theme="light"
     data-locale="en"&gt;&lt;/div&gt;</code></pre>

    <h2>JavaScript API</h2>
    <pre><code>// Initialize widget programmatically
window.DeliverySchedulerWidget.init({
    shopDomain: 'your-store.myshopify.com',
    productId: '123456789',
    variantId: '987654321',
    containerId: 'my-widget-container',
    theme: 'light',
    locale: 'en'
});

// Destroy widget
window.DeliverySchedulerWidget.destroy('my-widget-container');</code></pre>

    <h2>Features</h2>
    <ul>
        <li>✅ Date and time selection</li>
        <li>✅ Delivery vs collection options</li>
        <li>✅ Postal code validation</li>
        <li>✅ Real-time availability</li>
        <li>✅ Shopify order tag integration</li>
        <li>✅ Responsive design</li>
    </ul>
</body>
</html>
				`, {
					headers: { 'Content-Type': 'text/html' }
				});
			}

			// Default response
			return new Response('Not Found', { 
				status: 404,
				headers: corsHeaders,
			});
		} catch (error) {
			console.error('Worker error:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};

async function serveWidgetBundle(): Promise<Response> {
	// In production, this would serve the built widget.js file
	// For now, return a placeholder that loads from the admin dashboard
	return new Response(`
// Delivery Scheduler Widget v1.1.5
// This is a placeholder - the actual widget bundle should be built and served
console.log('Delivery Scheduler Widget loaded');
document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('[data-delivery-scheduler]');
    containers.forEach(container => {
        container.innerHTML = '<div style="padding: 20px; border: 2px dashed #ccc; text-align: center;">🚚 Delivery Scheduler Widget<br><small>Configure in admin dashboard</small></div>';
    });
});
	`, {
		headers: {
			'Content-Type': 'application/javascript',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}

async function serveWidgetCSS(): Promise<Response> {
	return new Response(`
/* Delivery Scheduler Widget Styles */
.delivery-scheduler-widget {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
}

.delivery-scheduler-widget h3 {
    margin: 0 0 10px 0;
    color: #374151;
}

.delivery-scheduler-widget .placeholder {
    padding: 40px 20px;
    text-align: center;
    color: #6b7280;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
}
	`, {
		headers: {
			'Content-Type': 'text/css',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}

async function handleShopifyRequest(request: Request, env: Env, endpoint: string): Promise<Response> {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};

	const shopifyUrl = `https://${env.SHOPIFY_SHOP_DOMAIN}/admin/api/${env.SHOPIFY_API_VERSION}/${endpoint}`;
	
	const headers = {
		'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN,
		'Content-Type': 'application/json',
	};

	try {
		const response = await fetch(shopifyUrl, {
			method: request.method,
			headers,
			body: request.method !== 'GET' ? await request.text() : undefined,
		});

		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: response.status,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Shopify API error:', error);
		return new Response(JSON.stringify({ error: 'Shopify API request failed' }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
}

async function handleDeliveryRequest(request: Request, env: Env, endpoint: string): Promise<Response> {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};

	try {
		switch (endpoint) {
			case 'timeslots':
				return await handleTimeslotsRequest(request, env);
			
			case 'availability':
				return await handleAvailabilityRequest(request, env);
			
			case 'orders':
				return await handleOrdersRequest(request, env);
			
			default:
				return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
		}
	} catch (error) {
		console.error('Delivery API error:', error);
		return new Response(JSON.stringify({ error: 'Delivery API request failed' }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
}

async function handleTimeslotsRequest(request: Request, env: Env): Promise<Response> {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};

	// Mock timeslots data - in production, this would come from a database
	const timeslots = [
		{
			id: "morning",
			name: "Morning Delivery",
			type: "delivery",
			startTime: "10:00",
			endTime: "14:00",
			price: 0,
			available: true,
		},
		{
			id: "afternoon",
			name: "Afternoon Delivery",
			type: "delivery",
			startTime: "14:00",
			endTime: "18:00",
			price: 0,
			available: true,
		},
		{
			id: "evening",
			name: "Evening Delivery",
			type: "delivery",
			startTime: "18:00",
			endTime: "22:00",
			price: 5,
			available: true,
		},
		{
			id: "express",
			name: "Express Delivery",
			type: "delivery",
			startTime: "11:00",
			endTime: "13:00",
			price: 15,
			available: true,
		},
		{
			id: "collection",
			name: "Store Collection",
			type: "collection",
			startTime: "09:00",
			endTime: "21:00",
			price: -5,
			available: true,
		},
	];

	return new Response(JSON.stringify({ timeslots }), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

async function handleAvailabilityRequest(request: Request, env: Env): Promise<Response> {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};

	const url = new URL(request.url);
	const date = url.searchParams.get('date');
	const postalCode = url.searchParams.get('postalCode');

	// Mock availability data - in production, this would check against actual bookings
	const availability = {
		date,
		postalCode,
		available: true,
		blockedDates: ['2024-12-25', '2024-01-01'],
		maxOrders: 50,
		currentOrders: 15,
	};

	return new Response(JSON.stringify(availability), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

async function handleOrdersRequest(request: Request, env: Env): Promise<Response> {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};

	if (request.method === 'POST') {
		const orderData = await request.json();
		
		// In production, this would save to a database and potentially sync with Shopify
		const order = {
			id: Date.now().toString(),
			...orderData,
			createdAt: new Date().toISOString(),
			status: 'pending',
		};

		return new Response(JSON.stringify({ order }), {
			status: 201,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	return new Response(JSON.stringify({ error: 'Method not allowed' }), {
		status: 405,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}
