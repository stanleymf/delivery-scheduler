export interface Env {
	SHOPIFY_ACCESS_TOKEN: string;
	SHOPIFY_SHOP_DOMAIN: string;
	SHOPIFY_API_VERSION: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
				return new Response(JSON.stringify({ status: 'ok', version: '1.0.0' }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
