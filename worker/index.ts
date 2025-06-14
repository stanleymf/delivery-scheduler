export interface Env {
	ADMIN_DASHBOARD_URL: string;
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

			// Proxy API requests to Railway admin dashboard
			if (path.startsWith('/api/')) {
				return await proxyToAdminDashboard(request, env, path);
			}

			// Health check
			if (path === '/health') {
				return new Response(JSON.stringify({ 
					status: 'ok', 
					version: '1.6.1',
					adminDashboard: env.ADMIN_DASHBOARD_URL ? 'configured' : 'not configured'
				}), {
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
     data-shop-domain="{{ shop.domain }}"
     data-product-id="{{ product.id }}"
     data-variant-id="{{ product.selected_or_first_available_variant.id }}"&gt;&lt;/div&gt;
&lt;script src="https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js"&gt;&lt;/script&gt;</code></pre>

    <h2>Advanced Configuration</h2>
    <pre><code>&lt;div id="delivery-scheduler-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-product-id="{{ product.id }}"
     data-variant-id="{{ product.selected_or_first_available_variant.id }}"
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
    
    <h2>Architecture</h2>
    <p>This widget proxies API requests to the admin dashboard at: <strong>${env.ADMIN_DASHBOARD_URL || 'Not configured'}</strong></p>
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

async function proxyToAdminDashboard(request: Request, env: Env, path: string): Promise<Response> {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};

	if (!env.ADMIN_DASHBOARD_URL) {
		return new Response(JSON.stringify({ 
			error: 'Admin dashboard URL not configured',
			message: 'Please configure ADMIN_DASHBOARD_URL in Cloudflare Worker secrets'
		}), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	const adminDashboardUrl = env.ADMIN_DASHBOARD_URL.replace(/\/$/, ''); // Remove trailing slash
	const fullUrl = `${adminDashboardUrl}${path}`;
	
	// Forward query parameters
	const url = new URL(request.url);
	if (url.search) {
		const fullUrlWithParams = `${fullUrl}${url.search}`;
		console.log(`Proxying request to: ${fullUrlWithParams}`);
	}

	try {
		// Clone the request headers but remove host-specific headers
		const headers = new Headers();
		for (const [key, value] of request.headers.entries()) {
			if (!['host', 'cf-ray', 'cf-connecting-ip'].includes(key.toLowerCase())) {
				headers.set(key, value);
			}
		}

		// Ensure content-type is set for API requests
		if (!headers.has('content-type') && request.method !== 'GET') {
			headers.set('content-type', 'application/json');
		}

		const proxyRequest = new Request(`${fullUrl}${url.search}`, {
			method: request.method,
			headers: headers,
			body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.clone().arrayBuffer() : undefined,
		});

		const response = await fetch(proxyRequest);
		
		// Clone the response and add CORS headers
		const responseHeaders = new Headers(response.headers);
		Object.entries(corsHeaders).forEach(([key, value]) => {
			responseHeaders.set(key, value);
		});

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		console.error('Proxy error:', error);
		return new Response(JSON.stringify({ 
			error: 'Proxy request failed',
			details: error.message,
			targetUrl: fullUrl
		}), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
}
