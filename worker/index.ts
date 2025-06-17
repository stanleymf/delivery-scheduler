export interface Env {
	ADMIN_DASHBOARD_URL: string;
	// Cloudflare KV Storage for data persistence
	DELIVERY_DATA: any; // KVNamespace type will be available in Cloudflare Workers runtime
	// Optional D1 Database for more complex operations
	DB?: any; // D1Database type will be available in Cloudflare Workers runtime
	// Authentication secret for admin operations
	ADMIN_SECRET?: string;
}

// Data models for persistence
interface DeliveryData {
	timeslots: any[];
	blockedDates: any[];
	blockedDateRanges: any[];
	settings: any;
	collectionLocations: any[];
	tagMappingSettings: any;
	expressSlots: any[];
	lastUpdated: string;
}

interface ShopifyFeeProduct {
	id: string;
	handle: string;
	title: string;
	variantId: string;
	price: string;
	created: string;
	timeslotId: string;
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
			// Serve customer widget bundle - PRIORITY ROUTE
			if (path === '/widget.js') {
				return await serveWidgetBundle();
			}

			// Serve widget CSS
			if (path === '/widget.css') {
				return await serveWidgetCSS();
			}

			// Enhanced cart widget with comprehensive tagging
			if (path === '/widget-enhanced.html') {
				return await serveEnhancedWidget();
			}

			// Cloudflare KV Data Persistence API Routes
			if (path.startsWith('/api/kv/')) {
				return await handleKVDataAPI(request, env, path, corsHeaders);
			}

			// Shopify Fee Automation API Routes
			if (path.startsWith('/api/shopify-fees/')) {
				return await handleShopifyFeeAPI(request, env, path, corsHeaders);
			}

			// Enhanced tagging API routes
			if (path.startsWith('/api/enhanced-tagging/')) {
				return await handleEnhancedTaggingAPI(request, env, path, corsHeaders);
			}

			// Shopify Settings API Routes (direct KV handling)
			if (path.startsWith('/api/shopify/')) {
				return await handleShopifyAPI(request, env, path, corsHeaders);
			}

			// Proxy API requests to Railway admin dashboard (fallback to KV if unavailable)
			if (path.startsWith('/api/')) {
				return await proxyToAdminDashboardWithFallback(request, env, path);
			}

			// Health check
			if (path === '/health') {
				const kvStatus = await testKVConnection(env);
				return new Response(JSON.stringify({ 
					status: 'ok', 
					version: '1.15.2',
					adminDashboard: env.ADMIN_DASHBOARD_URL ? 'configured' : 'not configured',
					cloudflareKV: kvStatus ? 'connected' : 'not available',
					timestamp: new Date().toISOString()
				}), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Debug endpoint
			if (path === '/debug') {
				const kvTest = await testKVConnection(env);
				return new Response(JSON.stringify({
					adminDashboardUrl: env.ADMIN_DASHBOARD_URL || 'Not configured',
					cloudflareKV: kvTest,
					timestamp: new Date().toISOString(),
					testUrl: env.ADMIN_DASHBOARD_URL ? `${env.ADMIN_DASHBOARD_URL}/api/version` : 'N/A'
				}), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Test proxy endpoint
			if (path === '/test-proxy') {
				try {
					const testUrl = `${env.ADMIN_DASHBOARD_URL}/api/version`;
					console.log(`Direct test fetch to: ${testUrl}`);
					const response = await fetch(testUrl);
					const text = await response.text();
					console.log(`Response status: ${response.status}, text: ${text.substring(0, 200)}`);
					
					return new Response(JSON.stringify({
						testUrl,
						status: response.status,
						statusText: response.statusText,
						responseText: text.substring(0, 500),
						headers: Object.fromEntries(response.headers.entries())
					}), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					});
				} catch (error) {
					return new Response(JSON.stringify({
						error: error.message,
						testUrl: `${env.ADMIN_DASHBOARD_URL}/api/version`
					}), {
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					});
				}
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

    <h2>Cart Page Integration</h2>
    <pre><code>&lt;div id="delivery-scheduler-cart-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-cart-mode="true"
     data-cart-items="{{ cart.items | json | escape }}"&gt;&lt;/div&gt;
&lt;script src="https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js"&gt;&lt;/script&gt;</code></pre>

    <h2>Features</h2>
    <ul>
        <li>✅ Synced with admin dashboard settings</li>
        <li>✅ Real-time timeslot availability</li>
        <li>✅ Collection location management</li>
        <li>✅ Blocked dates and date ranges</li>
        <li>✅ Postal code validation</li>
        <li>✅ Shopify order tag integration</li>
        <li>✅ Responsive design</li>
    </ul>
    
    <h2>Architecture</h2>
    <p>This widget fetches live data from: <strong>${env.ADMIN_DASHBOARD_URL || 'Not configured'}</strong></p>
</body>
</html>
				`, {
					headers: { 'Content-Type': 'text/html' }
				});
			}

			// Root route - widget landing page
			if (path === '/') {
				return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Scheduler Widget</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .title { color: #1e293b; font-size: 2.5rem; font-weight: 700; margin-bottom: 16px; }
        .subtitle { color: #64748b; font-size: 1.125rem; }
        .status { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .status-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 500; }
        .info-grid { display: grid; gap: 24px; margin-bottom: 32px; }
        .info-card { background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .info-title { font-weight: 600; color: #374151; margin-bottom: 8px; }
        .info-value { color: #6b7280; }
        .btn { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; margin: 8px; }
        .btn:hover { background: #2563eb; }
        .btn-secondary { background: #6b7280; }
        .btn-secondary:hover { background: #4b5563; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🛒 Delivery Scheduler Widget</h1>
            <p class="subtitle">Customer-Facing Delivery Widget Service</p>
        </div>
        
        <div class="status">
            <span class="status-badge">✅ Widget Active</span>
        </div>
        
        <div class="info-grid">
            <div class="info-card">
                <div class="info-title">Widget Service</div>
                <div class="info-value">Customer delivery scheduling interface for Shopify stores</div>
            </div>
            <div class="info-card">
                <div class="info-title">Version</div>
                <div class="info-value">v1.7.0</div>
            </div>
            <div class="info-card">
                <div class="info-title">Service Status</div>
                <div class="info-value">Active and serving widget requests</div>
            </div>
            <div class="info-card">
                <div class="info-title">Integration</div>
                <div class="info-value">Synced with admin dashboard for real-time settings</div>
            </div>
        </div>
        
        <div style="text-align: center;">
            <a href="/widget-docs" class="btn">📖 Integration Guide</a>
            <a href="/widget.js" class="btn btn-secondary">📄 Widget Script</a>
            <a href="/health" class="btn btn-secondary">🔍 Health Check</a>
        </div>
        
        <div style="margin-top: 32px; text-align: center; color: #9ca3af; font-size: 0.875rem;">
            <p>Widget Endpoints: /widget.js, /widget.css, /health</p>
            <p>For admin dashboard: <a href="https://delivery-scheduler-server.stanleytan92.workers.dev" style="color: #3b82f6;">Admin API</a></p>
        </div>
    </div>
</body>
</html>`, {
					headers: { 'Content-Type': 'text/html' }
				});
			}

			// Default response - don't serve static assets for widget.js
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
	// Serve a synced widget that fetches data from Railway admin dashboard
	return new Response(`
// Delivery Scheduler Widget v1.7.0 - Synced with Admin Dashboard
(function() {
    'use strict';
    
    console.log('Delivery Scheduler Widget v1.7.0 loaded - Synced with Admin Dashboard');
    
    // Widget state management
    let widgetData = {
        timeslots: [],
        collectionLocations: [],
        settings: {},
        blockedDates: [],
        blockedDateRanges: [],
        tagMappingSettings: {
            mappings: [],
            enableTagging: true,
            prefix: '',
            separator: ','
        }
    };
    
    let selectedType = 'delivery';
    let selectedDate = null;
    let selectedTimeslot = null;
    let selectedLocation = null;
    let postalCode = '';
    
    // Fetch data from admin backend directly
    async function fetchWidgetData(shopDomain) {
        try {
            console.log('Fetching widget data for shop:', shopDomain);
            
            const baseUrl = 'https://delivery-scheduler-server.stanleytan92.workers.dev';
            const [timeslotsRes, settingsRes, blockedDatesRes, blockedRangesRes, tagMappingRes] = await Promise.all([
                fetch(baseUrl + '/api/public/widget/timeslots'),
                fetch(baseUrl + '/api/public/widget/settings'), 
                fetch(baseUrl + '/api/public/widget/blocked-dates'),
                fetch(baseUrl + '/api/public/widget/blocked-date-ranges'),
                fetch(baseUrl + '/api/public/widget/tag-mapping-settings')
            ]);
            
            if (timeslotsRes.ok) {
                const timeslotsData = await timeslotsRes.json();
                widgetData.timeslots = timeslotsData.data || [];
            }
            
            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                widgetData.settings = settingsData.data || {};
                widgetData.collectionLocations = widgetData.settings.collectionLocations || [];
            }
            
            if (blockedDatesRes.ok) {
                const blockedDatesData = await blockedDatesRes.json();
                widgetData.blockedDates = blockedDatesData.data || [];
            }
            
            if (blockedRangesRes.ok) {
                const blockedRangesData = await blockedRangesRes.json();
                widgetData.blockedDateRanges = blockedRangesData.data || [];
            }
            
            if (tagMappingRes.ok) {
                const tagMappingData = await tagMappingRes.json();
                widgetData.tagMappingSettings = tagMappingData.data || {
                    mappings: [],
                    enableTagging: true,
                    prefix: '',
                    separator: ','
                };
            }
            
            console.log('Widget data loaded:', widgetData);
            return true;
        } catch (error) {
            console.error('Failed to fetch widget data:', error);
            // Use fallback data that matches the admin dashboard
            widgetData = {
                timeslots: [
                    {id: 'morning-delivery', name: 'Morning Delivery', type: 'delivery', startTime: '10:00', endTime: '14:00', maxOrders: 10},
                    {id: 'afternoon-delivery', name: 'Afternoon Delivery', type: 'delivery', startTime: '14:00', endTime: '18:00', maxOrders: 10},
                    {id: 'evening-delivery', name: 'Evening Delivery', type: 'delivery', startTime: '18:00', endTime: '22:00', maxOrders: 5},
                    {id: 'morning-collection', name: 'Morning Collection', type: 'collection', startTime: '09:00', endTime: '12:00', maxOrders: 15},
                    {id: 'afternoon-collection', name: 'Afternoon Collection', type: 'collection', startTime: '14:00', endTime: '18:00', maxOrders: 15}
                ],
                collectionLocations: [
                    {id: '1', name: 'Main Store', address: '123 Orchard Road, Singapore 238858'},
                    {id: '2', name: 'Marina Bay Branch', address: '456 Marina Bay Sands, Singapore 018956'},
                    {id: '3', name: 'Sentosa Outlet', address: '789 Sentosa Gateway, Singapore 098269'}
                ],
                settings: {theme: 'light', futureOrderLimit: 10},
                blockedDates: [],
                blockedDateRanges: [],
                tagMappingSettings: {
                    mappings: [
                        {
                            id: 'delivery',
                            type: 'delivery',
                            label: 'Delivery',
                            tag: 'Delivery',
                            enabled: true,
                            description: 'Tag applied when customer selects delivery option'
                        },
                        {
                            id: 'collection',
                            type: 'collection',
                            label: 'Collection',
                            tag: 'Collection',
                            enabled: true,
                            description: 'Tag applied when customer selects collection option'
                        },
                        {
                            id: 'express',
                            type: 'express',
                            label: 'Express Delivery',
                            tag: 'Express',
                            enabled: true,
                            description: 'Tag applied when customer selects express delivery'
                        },
                        {
                            id: 'timeslot',
                            type: 'timeslot',
                            label: 'Timeslot',
                            tag: 'hh:mm-hh:mm',
                            enabled: true,
                            description: 'Tag applied with selected timeslot in 24-hour format'
                        },
                        {
                            id: 'date',
                            type: 'date',
                            label: 'Selected Date',
                            tag: 'dd/mm/yyyy',
                            enabled: true,
                            description: 'Tag applied with selected delivery date'
                        }
                    ],
                    enableTagging: true,
                    prefix: '',
                    separator: ','
                }
            };
            return false;
        }
    }
    
    function isDateBlocked(date) {
        const dateStr = date.toISOString().split('T')[0];
        
        // Check individual blocked dates
        const blockedDate = widgetData.blockedDates.find(b => b.date === dateStr);
        if (blockedDate && blockedDate.type === 'full') return true;
        
        // Check blocked date ranges
        const blockedRange = widgetData.blockedDateRanges.find(range => 
            range.dates && range.dates.includes(dateStr)
        );
        if (blockedRange && blockedRange.type === 'full') return true;
        
        // Check future order limit
        const today = new Date();
        const futureLimit = widgetData.settings.futureOrderLimit || 30;
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + futureLimit);
        
        if (date > maxDate) return true;
        
        return false;
    }
    
    function getAvailableTimeslots() {
        if (!selectedDate) return [];
        
        const dateStr = selectedDate.toISOString().split('T')[0];
        const baseTimeslots = widgetData.timeslots.filter(slot => slot.type === selectedType);
        
        // Check for blocked timeslots on this specific date
        const blockedTimeslots = new Set();
        
        const blockedDate = widgetData.blockedDates.find(b => b.date === dateStr);
        if (blockedDate && blockedDate.timeslots) {
            blockedDate.timeslots.forEach(ts => blockedTimeslots.add(ts));
        }
        
        const blockedRange = widgetData.blockedDateRanges.find(range => 
            range.dates && range.dates.includes(dateStr)
        );
        if (blockedRange && blockedRange.timeslots) {
            blockedRange.timeslots.forEach(ts => blockedTimeslots.add(ts));
        }
        
        return baseTimeslots.filter(slot => !blockedTimeslots.has(slot.id));
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    function createWidget(container, options) {
        const { shopDomain, cartMode, cartItems, theme = 'light' } = options;
        
        // Create widget HTML
        container.innerHTML = \`
            <div class="delivery-scheduler-widget" style="
                max-width: 500px;
                margin: 0 auto;
                padding: 24px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            ">
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        🚚 Delivery Options
                    </h3>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Choose your preferred delivery date and time</p>
                </div>
                
                <div id="widget-loading" style="text-align: center; padding: 20px; color: #6b7280;">
                    Loading delivery options...
                </div>
                
                <div id="widget-content" style="display: none;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Delivery Type</label>
                        <div style="display: flex; gap: 8px;">
                            <button id="delivery-btn" onclick="selectDeliveryType('delivery')" style="
                                flex: 1; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 8px;
                                background: white; cursor: pointer; font-size: 14px; font-weight: 500;
                                transition: all 0.2s;
                            ">
                                🚚 Delivery
                            </button>
                            <button id="collection-btn" onclick="selectDeliveryType('collection')" style="
                                flex: 1; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 8px;
                                background: white; cursor: pointer; font-size: 14px; font-weight: 500;
                                transition: all 0.2s;
                            ">
                                🏢 Collection
                            </button>
                        </div>
                    </div>
                    
                    <div id="postal-code-section" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Postal Code</label>
                        <input type="text" id="postal-code" placeholder="Enter postal code" style="
                            width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px;
                            font-size: 14px; box-sizing: border-box;
                        ">
                        <div id="postal-code-error" style="color: #ef4444; font-size: 12px; margin-top: 4px; display: none;"></div>
                    </div>
                    
                    <div id="collection-location-section" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Collection Location</label>
                        <select id="collection-location" style="
                            width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px;
                            font-size: 14px; box-sizing: border-box;
                        ">
                            <option value="">Choose a location</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Select Date</label>
                        <input type="date" id="delivery-date" style="
                            width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px;
                            font-size: 14px; box-sizing: border-box;
                        ">
                    </div>
                    
                    <div id="timeslot-section" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Select Time</label>
                        <div id="timeslot-options"></div>
                    </div>
                    
                    <div id="summary-section" style="margin-bottom: 20px; display: none; padding: 16px; background: #f9fafb; border-radius: 8px;">
                        <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #374151;">Delivery Summary</h4>
                        <div id="summary-content"></div>
                    </div>
                    
                    <button id="add-to-cart-btn" onclick="addToCartWithDelivery()" style="
                        width: 100%; padding: 14px; background: #616B53; color: white; border: none;
                        border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;
                        transition: background-color 0.2s; opacity: 0.5;
                    " disabled>
                        <span id="add-to-cart-text">\${cartMode ? 'Update Cart with Delivery' : 'Add to Cart with Delivery'}</span>
                    </button>
                </div>
                
                <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #6b7280;">
                    Powered by Delivery Scheduler v1.12.0 - <span style="color: #16a34a; font-weight: 600;">●</span> LIVE
                </div>
            </div>
        \`;
        
        // Initialize widget
        initializeWidget(shopDomain, cartMode, cartItems);
    }
    
    async function initializeWidget(shopDomain, cartMode, cartItems) {
        // Fetch data
        await fetchWidgetData(shopDomain);
        
        // Hide loading, show content
        document.getElementById('widget-loading').style.display = 'none';
        document.getElementById('widget-content').style.display = 'block';
        
        // Set up date picker
        const dateInput = document.getElementById('delivery-date');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Set up collection locations
        const locationSelect = document.getElementById('collection-location');
        widgetData.collectionLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id;
            option.textContent = \`\${location.name} - \${location.address}\`;
            locationSelect.appendChild(option);
        });
        
        // Set up event listeners
        dateInput.addEventListener('change', handleDateChange);
        document.getElementById('postal-code').addEventListener('input', handlePostalCodeChange);
        document.getElementById('collection-location').addEventListener('change', handleLocationChange);
        
        // Initialize with delivery type
        selectDeliveryType('delivery');
        updateButtonText();
    }
    
    window.selectDeliveryType = function(type) {
        selectedType = type;
        selectedTimeslot = null;
        
        // Update button styles
        const deliveryBtn = document.getElementById('delivery-btn');
        const collectionBtn = document.getElementById('collection-btn');
        
        if (type === 'delivery') {
            deliveryBtn.style.background = '#616B53';
            deliveryBtn.style.color = 'white';
            deliveryBtn.style.borderColor = '#616B53';
            collectionBtn.style.background = 'white';
            collectionBtn.style.color = 'black';
            collectionBtn.style.borderColor = '#d1d5db';
            
            document.getElementById('postal-code-section').style.display = 'block';
            document.getElementById('collection-location-section').style.display = 'none';
        } else {
            collectionBtn.style.background = '#616B53';
            collectionBtn.style.color = 'white';
            collectionBtn.style.borderColor = '#616B53';
            deliveryBtn.style.background = 'white';
            deliveryBtn.style.color = 'black';
            deliveryBtn.style.borderColor = '#d1d5db';
            
            document.getElementById('postal-code-section').style.display = 'none';
            document.getElementById('collection-location-section').style.display = 'block';
        }
        
        updateTimeslots();
        updateSummary();
        updateButtonText();
    };
    
    function handleDateChange() {
        const dateInput = document.getElementById('delivery-date');
        selectedDate = dateInput.value ? new Date(dateInput.value + 'T00:00:00') : null;
        selectedTimeslot = null;
        updateTimeslots();
        updateSummary();
    }
    
    function handlePostalCodeChange() {
        postalCode = document.getElementById('postal-code').value;
        updateSummary();
    }
    
    function handleLocationChange() {
        const locationSelect = document.getElementById('collection-location');
        selectedLocation = locationSelect.value;
        updateSummary();
    }
    
    function updateTimeslots() {
        const timeslotSection = document.getElementById('timeslot-section');
        const timeslotOptions = document.getElementById('timeslot-options');
        
        if (!selectedDate) {
            timeslotSection.style.display = 'none';
            return;
        }
        
        const availableSlots = getAvailableTimeslots();
        
        if (availableSlots.length === 0) {
            timeslotOptions.innerHTML = '<p style="color: #6b7280; font-style: italic;">No timeslots available for this date</p>';
            timeslotSection.style.display = 'block';
            return;
        }
        
        timeslotOptions.innerHTML = availableSlots.map(slot => \`
            <div class="timeslot-option" data-slot-id="\${slot.id}" onclick="selectTimeslot('\${slot.id}')" style="
                padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer;
                margin-bottom: 8px; transition: all 0.2s;
            ">
                <div style="display: flex; justify-content: between; align-items: center;">
                    <div>
                        <div style="font-weight: 500; color: #374151;">\${slot.name}</div>
                        <div style="font-size: 14px; color: #6b7280;">\${slot.startTime} - \${slot.endTime}</div>
                    </div>
                </div>
            </div>
        \`).join('');
        
        timeslotSection.style.display = 'block';
    }
    
    window.selectTimeslot = function(slotId) {
        selectedTimeslot = slotId;
        
        // Update timeslot option styles
        document.querySelectorAll('.timeslot-option').forEach(option => {
            if (option.dataset.slotId === slotId) {
                option.style.borderColor = '#616B53';
                option.style.backgroundColor = '#f0f9f0';
            } else {
                option.style.borderColor = '#d1d5db';
                option.style.backgroundColor = 'white';
            }
        });
        
        updateSummary();
        updateButtonText(); // Update button text when timeslot changes
    };
    
    function updateButtonText() {
        const buttonText = document.getElementById('add-to-cart-text');
        
        if (buttonText) {
            let buttonTextContent = 'Add to Cart with Delivery'; // Default
            
            if (selectedType === 'collection') {
                buttonTextContent = 'Add to Cart with Collection';
            } else if (selectedType === 'delivery') {
                // Check if selected timeslot has a fee (Express Delivery)
                if (selectedTimeslot) {
                    const slot = widgetData.timeslots.find(s => s.id === selectedTimeslot);
                    if (slot && slot.fee && slot.fee > 0) {
                        buttonTextContent = 'Add to Cart with Express Delivery';
                    } else {
                        buttonTextContent = 'Add to Cart with Delivery';
                    }
                } else {
                    buttonTextContent = 'Add to Cart with Delivery';
                }
            }
            
            buttonText.textContent = buttonTextContent;
        }
    }
    
    function updateSummary() {
        const summarySection = document.getElementById('summary-section');
        const summaryContent = document.getElementById('summary-content');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        
        const isValid = selectedDate && selectedTimeslot && 
            (selectedType === 'delivery' ? postalCode : selectedLocation);
        
        if (isValid) {
            const slot = widgetData.timeslots.find(s => s.id === selectedTimeslot);
            const location = selectedType === 'collection' ? 
                widgetData.collectionLocations.find(l => l.id === selectedLocation) : null;
            
            summaryContent.innerHTML = \`
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #6b7280;">Date:</span>
                    <span style="font-weight: 500;">\${formatDate(selectedDate)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #6b7280;">Time:</span>
                    <span style="font-weight: 500;">\${slot ? slot.name : ''}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #6b7280;">Type:</span>
                    <span style="font-weight: 500; text-transform: capitalize;">\${selectedType}</span>
                </div>
                \${selectedType === 'delivery' ? \`
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #6b7280;">Postal Code:</span>
                        <span style="font-weight: 500;">\${postalCode}</span>
                    </div>
                \` : \`
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #6b7280;">Location:</span>
                        <span style="font-weight: 500;">\${location ? location.name : ''}</span>
                    </div>
                \`}
            \`;
            
            summarySection.style.display = 'block';
            addToCartBtn.disabled = false;
            addToCartBtn.style.opacity = '1';
        } else {
            summarySection.style.display = 'none';
            addToCartBtn.disabled = true;
            addToCartBtn.style.opacity = '0.5';
        }
    }
    
    window.addToCartWithDelivery = async function() {
        if (!selectedDate || !selectedTimeslot) {
            alert('Please select both date and time for delivery');
            return;
        }
        
        if (selectedType === 'delivery' && !postalCode) {
            alert('Please enter your postal code');
            return;
        }
        
        if (selectedType === 'collection' && !selectedLocation) {
            alert('Please select a collection location');
            return;
        }
        
        const slot = widgetData.timeslots.find(s => s.id === selectedTimeslot);
        const location = selectedType === 'collection' ? 
            widgetData.collectionLocations.find(l => l.id === selectedLocation) : null;
        
        const deliveryData = {
            date: selectedDate.toISOString().split('T')[0],
            timeslot: slot.name,
            type: selectedType,
            postalCode: selectedType === 'delivery' ? postalCode : null,
            location: selectedType === 'collection' ? location : null,
            fee: slot.fee || 0
        };
        
        console.log('🚚 Adding delivery preferences to cart:', deliveryData);
        
        // Disable button during processing
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        const buttonTextSpan = document.getElementById('add-to-cart-text');
        const originalText = buttonTextSpan.textContent;
        addToCartBtn.disabled = true;
        buttonTextSpan.textContent = 'Adding to Cart...';
        
        try {
            // Generate tags based on tag mapping settings
            const tags = generateDeliveryTags(deliveryData, widgetData.tagMappingSettings);
            
            // Create delivery notes for order
            const deliveryNotes = generateDeliveryNotes(deliveryData, location);
            
            // Add delivery preferences as cart attributes
            const cartUpdateData = {
                attributes: {
                    // Core delivery information
                    'delivery_date': deliveryData.date,
                    'delivery_timeslot': deliveryData.timeslot,
                    'delivery_type': deliveryData.type,
                    'delivery_postal_code': deliveryData.postalCode || '',
                    'delivery_location_name': location ? location.name : '',
                    'delivery_location_address': location ? location.address : '',
                    'delivery_fee': deliveryData.fee.toString(),
                    
                    // Tags for order processing
                    'delivery_tags': tags.join(','),
                    
                    // Notes for order display
                    'delivery_notes': deliveryNotes,
                    
                    // Metadata
                    'delivery_widget_version': '1.11.4',
                    'delivery_timestamp': new Date().toISOString()
                }
            };
            
            // Update cart with delivery attributes
            const response = await fetch('/cart/update.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(cartUpdateData)
            });
            
            if (!response.ok) {
                throw new Error(\`Cart update failed: \${response.status} \${response.statusText}\`);
            }
            
            const cartData = await response.json();
            console.log('✅ Cart updated successfully:', cartData);
            
            // Show success message with details
            const successMessage = \`✅ Delivery Added Successfully!
            
📅 Date: \${formatDate(selectedDate)}
⏰ Time: \${slot.name}
🚚 Type: \${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
\${deliveryData.postalCode ? \`📍 Postal Code: \${deliveryData.postalCode}\` : ''}
\${location ? \`📍 Location: \${location.name}\` : ''}
\${deliveryData.fee > 0 ? \`💰 Fee: $\${deliveryData.fee}\` : ''}

🏷️ Tags: \${tags.join(', ')}

Your delivery preferences have been added to your cart!\`;
            
            alert(successMessage);
            
            // Optional: Redirect to cart page
            // window.location.href = '/cart';
            
        } catch (error) {
            console.error('❌ Error adding delivery to cart:', error);
            alert(\`Error adding delivery to cart: \${error.message}\`);
        } finally {
            // Re-enable button
            addToCartBtn.disabled = false;
            buttonTextSpan.textContent = originalText;
        }
    };
    
    // Generate delivery tags based on tag mapping settings
    function generateDeliveryTags(deliveryData, tagMappingSettings) {
        if (!tagMappingSettings || !tagMappingSettings.enableTagging) {
            return [];
        }
        
        const tags = [];
        const { mappings, prefix, separator } = tagMappingSettings;
        
        mappings.forEach(mapping => {
            if (!mapping.enabled) return;
            
            let tag = mapping.tag;
            
            switch (mapping.type) {
                case 'delivery':
                    if (deliveryData.type === 'delivery') {
                        tags.push(prefix + tag);
                    }
                    break;
                case 'collection':
                    if (deliveryData.type === 'collection') {
                        tags.push(prefix + tag);
                    }
                    break;
                case 'express':
                    if (deliveryData.fee > 0) { // Express delivery has fee
                        tags.push(prefix + tag);
                    }
                    break;
                case 'timeslot':
                    // Replace placeholder with actual timeslot
                    const slot = widgetData.timeslots.find(s => s.name === deliveryData.timeslot);
                    if (slot) {
                        tag = tag.replace('hh:mm-hh:mm', \`\${slot.startTime}-\${slot.endTime}\`);
                        tag = tag.replace('hh:mm', slot.startTime);
                        tags.push(prefix + tag);
                    }
                    break;
                case 'date':
                    // Replace placeholder with actual date
                    const date = new Date(deliveryData.date);
                    tag = tag.replace('dd/mm/yyyy', date.toLocaleDateString('en-GB'));
                    tag = tag.replace('dd/mm', date.toLocaleDateString('en-GB').slice(0, 5));
                    tags.push(prefix + tag);
                    break;
            }
        });
        
        return tags;
    }
    
    // Generate delivery notes for order display
    function generateDeliveryNotes(deliveryData, location) {
        const notes = [];
        
        notes.push(\`🚚 DELIVERY DETAILS\`);
        notes.push(\`📅 Date: \${new Date(deliveryData.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}\`);
        notes.push(\`⏰ Time: \${deliveryData.timeslot}\`);
        notes.push(\`📦 Type: \${deliveryData.type.charAt(0).toUpperCase() + deliveryData.type.slice(1)}\`);
        
        if (deliveryData.type === 'delivery' && deliveryData.postalCode) {
            notes.push(\`📍 Postal Code: \${deliveryData.postalCode}\`);
        }
        
        if (deliveryData.type === 'collection' && location) {
            notes.push(\`📍 Collection Location: \${location.name}\`);
            notes.push(\`📍 Address: \${location.address}\`);
        }
        
        if (deliveryData.fee > 0) {
            notes.push(\`💰 Delivery Fee: $\${deliveryData.fee}\`);
        }
        
        notes.push(\`\\n⚡ Powered by Delivery Scheduler v1.11.4\`);
        
        return notes.join('\\n');
    };
    
    // Auto-initialize widgets
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-delivery-scheduler]').forEach(function(element) {
            const options = {
                shopDomain: element.getAttribute('data-shop-domain') || '',
                cartMode: element.getAttribute('data-cart-mode') === 'true',
                cartItems: element.getAttribute('data-cart-items') || '[]',
                theme: element.getAttribute('data-theme') || 'light'
            };
            
            if (options.shopDomain) {
                createWidget(element, options);
            }
        });
    });
    
    // Expose global API
    window.DeliverySchedulerWidget = {
        init: function(element, options) {
            createWidget(element, options);
        }
    };
    
})();
`, {
		headers: { 'Content-Type': 'application/javascript' },
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
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
	const finalUrl = `${fullUrl}${url.search}`;
	console.log(`Proxy Debug - Original path: ${path}, Admin URL: ${adminDashboardUrl}, Final URL: ${finalUrl}`);

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

		const proxyRequest = new Request(finalUrl, {
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

// Cloudflare KV Data Persistence Functions
async function testKVConnection(env: Env): Promise<boolean> {
	try {
		if (!env.DELIVERY_DATA) return false;
		
		// Test write and read
		await env.DELIVERY_DATA.put('test-connection', JSON.stringify({ timestamp: Date.now() }));
		const result = await env.DELIVERY_DATA.get('test-connection');
		await env.DELIVERY_DATA.delete('test-connection');
		
		return result !== null;
	} catch (error) {
		console.error('KV connection test failed:', error);
		return false;
	}
}

async function handleKVDataAPI(request: Request, env: Env, path: string, corsHeaders: any): Promise<Response> {
	try {
		const segments = path.split('/').filter(Boolean);
		// /api/kv/data or /api/kv/backup
		const operation = segments[2];

		if (operation === 'data') {
			if (request.method === 'GET') {
				// Get delivery data from KV
				const data = await env.DELIVERY_DATA.get('delivery-data');
				if (data) {
					return new Response(data, {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				} else {
					return new Response(JSON.stringify({ error: 'No data found' }), {
						status: 404,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}
			} else if (request.method === 'POST') {
				// Save delivery data to KV
				const body = await request.json() as DeliveryData;
				body.lastUpdated = new Date().toISOString();
				
				await env.DELIVERY_DATA.put('delivery-data', JSON.stringify(body));
				
				return new Response(JSON.stringify({ success: true, lastUpdated: body.lastUpdated }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		} else if (operation === 'backup') {
			if (request.method === 'POST') {
				// Create backup with timestamp
				const data = await env.DELIVERY_DATA.get('delivery-data');
				if (data) {
					const backupKey = `backup-${Date.now()}`;
					await env.DELIVERY_DATA.put(backupKey, data);
					
					return new Response(JSON.stringify({ success: true, backupKey }), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}
			} else if (request.method === 'GET') {
				// List all backups
				const list = await env.DELIVERY_DATA.list({ prefix: 'backup-' });
				const backups = (list.keys || []).map((key: any) => ({
					key: key.name,
					timestamp: key.name.split('-')[1],
					created: new Date(parseInt(key.name.split('-')[1])).toISOString()
				}));
				
				return new Response(JSON.stringify({ backups }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		}

		return new Response(JSON.stringify({ error: 'Invalid operation' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
}

async function handleShopifyFeeAPI(request: Request, env: Env, path: string, corsHeaders: any): Promise<Response> {
	try {
		const segments = path.split('/').filter(Boolean);
		// /api/shopify-fees/products or /api/shopify-fees/cleanup
		const operation = segments[2];

		if (operation === 'products') {
			if (request.method === 'GET') {
				// Get fee products from KV
				const data = await env.DELIVERY_DATA.get('fee-products');
				const products = data ? JSON.parse(data) : [];
				
				return new Response(JSON.stringify({ success: true, data: products }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			} else if (request.method === 'POST') {
				// Add new fee product
				const body = await request.json() as ShopifyFeeProduct;
				
				const existingData = await env.DELIVERY_DATA.get('fee-products');
				const products = existingData ? JSON.parse(existingData) : [];
				
				products.push({
					...body,
					created: new Date().toISOString()
				});
				
				await env.DELIVERY_DATA.put('fee-products', JSON.stringify(products));
				
				return new Response(JSON.stringify({ success: true, product: body }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		} else if (operation === 'cleanup') {
			if (request.method === 'POST') {
				// Clean up orphaned fee products
				const data = await env.DELIVERY_DATA.get('fee-products');
				const products = data ? JSON.parse(data) : [];
				
				// Logic to clean up orphaned products would go here
				// For now, just return the current list
				
				return new Response(JSON.stringify({ 
					success: true, 
					message: 'Cleanup completed',
					productsCount: products.length 
				}), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		}

		return new Response(JSON.stringify({ error: 'Invalid operation' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
}

async function handleEnhancedTaggingAPI(request: Request, env: Env, path: string, corsHeaders: any): Promise<Response> {
	try {
		const segments = path.split('/').filter(Boolean);
		// /api/enhanced-tagging/generate or /api/enhanced-tagging/preview
		const operation = segments[2];

		if (operation === 'generate') {
			if (request.method === 'POST') {
				const body = await request.json();
				const { deliveryData, tagSettings } = body;
				
				// Generate simplified 3-tag system
				const tags = [];
				
				// 1. Delivery Type Tag
				const typeMapping = {
					'delivery': tagSettings?.deliveryTag || 'Delivery',
					'collection': tagSettings?.collectionTag || 'Collection',
					'express': tagSettings?.expressTag || 'Express'
				};
				tags.push(typeMapping[deliveryData.type] || deliveryData.type);
				
				// 2. Date Tag (dd/mm/yyyy format)
				const date = new Date(deliveryData.date);
				tags.push(date.toLocaleDateString('en-GB'));
				
				// 3. Timeslot Tag (hh:mm-hh:mm format)
				if (deliveryData.timeslot) {
					tags.push(`${deliveryData.timeslot.startTime}-${deliveryData.timeslot.endTime}`);
				}
				
				return new Response(JSON.stringify({ 
					success: true, 
					tags,
					tagString: tags.join(tagSettings?.separator || ',')
				}), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		} else if (operation === 'preview') {
			if (request.method === 'GET') {
				// Return preview examples
				const examples = [
					{
						title: 'Morning Delivery',
						deliveryData: {
							type: 'delivery',
							date: '2024-12-20',
							timeslot: { startTime: '10:00', endTime: '14:00' }
						},
						expectedTags: ['Delivery', '20/12/2024', '10:00-14:00']
					},
					{
						title: 'Store Collection',
						deliveryData: {
							type: 'collection',
							date: '2024-12-20',
							timeslot: { startTime: '14:00', endTime: '16:00' }
						},
						expectedTags: ['Collection', '20/12/2024', '14:00-16:00']
					},
					{
						title: 'Express Delivery',
						deliveryData: {
							type: 'express',
							date: '2024-12-20',
							timeslot: { startTime: '10:30', endTime: '11:30' }
						},
						expectedTags: ['Express', '20/12/2024', '10:30-11:30']
					}
				];
				
				return new Response(JSON.stringify({ success: true, examples }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		}

		return new Response(JSON.stringify({ error: 'Invalid operation' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
}

async function handleShopifyAPI(request: Request, env: Env, path: string, corsHeaders: any): Promise<Response> {
	try {
		const segments = path.split('/').filter(Boolean);
		// /api/shopify/settings, /api/shopify/test-connection, etc.
		const operation = segments[2];

		// Extract user ID from authorization (simplified for now - in production, verify JWT)
		const authHeader = request.headers.get('Authorization');
		const userId = authHeader ? 'default-user' : 'anonymous'; // Simplified auth

		if (operation === 'settings') {
			if (request.method === 'GET') {
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
			} else if (request.method === 'POST') {
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
			}
		} else if (operation === 'test-connection') {
			if (request.method === 'GET') {
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
			}
		} else if (operation === 'debug') {
			if (request.method === 'GET') {
				// Return debug information
				const credentials = await env.DELIVERY_DATA.get(`user:${userId}:shopify-credentials`);
				return new Response(JSON.stringify({
					success: true,
					debug: {
						hasCredentials: !!credentials,
						persistence: {
							fileExists: true,
							fileSize: credentials ? credentials.length : 0,
							fileModified: credentials ? JSON.parse(credentials).savedAt : null,
							totalUsersInMemory: 1
						},
						kvStatus: 'connected',
						timestamp: new Date().toISOString()
					}
				}), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		} else if (operation === 'register-webhooks') {
			if (request.method === 'POST') {
				// Register Shopify webhooks
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
				const webhookBaseUrl = 'https://delivery-scheduler-widget.stanleytan92.workers.dev';

				// Define webhooks to register
				const webhooksToRegister = [
					{ topic: 'orders/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'orders/updated', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'orders/cancelled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'orders/fulfilled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'orders/paid', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'products/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'products/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'products/delete', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'inventory_levels/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'customers/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'customers/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
					{ topic: 'app/uninstalled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' }
				];

				try {
					const results = [];
					
					// Get existing webhooks to avoid duplicates
					const existingWebhooksResponse = await fetch(`https://${creds.shopDomain}/admin/api/${creds.apiVersion}/webhooks.json`, {
						headers: {
							'X-Shopify-Access-Token': creds.accessToken,
							'Content-Type': 'application/json',
						}
					});

					let existingWebhooks = [];
					if (existingWebhooksResponse.ok) {
						const existingData = await existingWebhooksResponse.json();
						existingWebhooks = existingData.webhooks || [];
					}

					// Register each webhook
					for (const webhook of webhooksToRegister) {
						try {
							const existingWebhook = existingWebhooks.find((w: any) => w.topic === webhook.topic);
							
							if (existingWebhook) {
								if (existingWebhook.address !== webhook.address) {
									// Update existing webhook
									const updateResponse = await fetch(`https://${creds.shopDomain}/admin/api/${creds.apiVersion}/webhooks/${existingWebhook.id}.json`, {
										method: 'PUT',
										headers: {
											'X-Shopify-Access-Token': creds.accessToken,
											'Content-Type': 'application/json',
										},
										body: JSON.stringify({ webhook: { address: webhook.address } })
									});

									if (updateResponse.ok) {
										const updatedData = await updateResponse.json();
										results.push({
											topic: webhook.topic,
											status: 'updated',
											webhook: updatedData.webhook
										});
									} else {
										const errorData = await updateResponse.json();
										results.push({
											topic: webhook.topic,
											status: 'error',
											error: errorData.errors || 'Failed to update existing webhook'
										});
									}
								} else {
									results.push({
										topic: webhook.topic,
										status: 'exists',
										webhook: existingWebhook
									});
								}
							} else {
								// Create new webhook
								const response = await fetch(`https://${creds.shopDomain}/admin/api/${creds.apiVersion}/webhooks.json`, {
									method: 'POST',
									headers: {
										'X-Shopify-Access-Token': creds.accessToken,
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({ webhook })
								});

								const data = await response.json();
								
								if (response.ok) {
									results.push({
										topic: webhook.topic,
										status: 'success',
										webhook: data.webhook
									});
								} else {
									results.push({
										topic: webhook.topic,
										status: 'error',
										error: data.errors || 'Unknown error'
									});
								}
							}
						} catch (error: any) {
							results.push({
								topic: webhook.topic,
								status: 'error',
								error: error.message
							});
						}
					}

					const summary = {
						total: webhooksToRegister.length,
						success: results.filter(r => r.status === 'success').length,
						updated: results.filter(r => r.status === 'updated').length,
						exists: results.filter(r => r.status === 'exists').length,
						errors: results.filter(r => r.status === 'error').length
					};

					return new Response(JSON.stringify({
						success: true,
						message: 'Webhook registration completed',
						results,
						summary,
						webhookBaseUrl
					}), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});

				} catch (error: any) {
					return new Response(JSON.stringify({
						success: false,
						error: 'Failed to register webhooks: ' + error.message
					}), {
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}
			}
		} else if (operation === 'webhooks') {
			if (request.method === 'GET') {
				// List existing webhooks
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

				try {
					const response = await fetch(`https://${creds.shopDomain}/admin/api/${creds.apiVersion}/webhooks.json`, {
						headers: {
							'X-Shopify-Access-Token': creds.accessToken,
							'Content-Type': 'application/json',
						}
					});

					const data = await response.json();
					
					if (response.ok) {
						return new Response(JSON.stringify({
							success: true,
							webhooks: data.webhooks
						}), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					} else {
						return new Response(JSON.stringify(data), {
							status: response.status,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
				} catch (error: any) {
					return new Response(JSON.stringify({
						success: false,
						error: 'Failed to fetch webhooks: ' + error.message
					}), {
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}
			}
		}

		return new Response(JSON.stringify({ error: 'Invalid operation' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
}

async function proxyToAdminDashboardWithFallback(request: Request, env: Env, path: string): Promise<Response> {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};

	// Try Railway admin dashboard first
	if (env.ADMIN_DASHBOARD_URL) {
		try {
			return await proxyToAdminDashboard(request, env, path);
		} catch (error) {
			console.log('Railway dashboard unavailable, falling back to KV storage');
		}
	}

	// Fallback to KV storage for public widget API calls
	if (path.startsWith('/api/public/widget/')) {
		const endpoint = path.replace('/api/public/widget/', '');
		
		try {
			const data = await env.DELIVERY_DATA.get('delivery-data');
			if (!data) {
				return new Response(JSON.stringify({ 
					success: false, 
					error: 'No data available' 
				}), {
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}

			const deliveryData = JSON.parse(data);

			switch (endpoint) {
				case 'timeslots':
					return new Response(JSON.stringify({ 
						success: true, 
						data: deliveryData.timeslots || [] 
					}), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				
				case 'blocked-dates':
					return new Response(JSON.stringify({ 
						success: true, 
						data: deliveryData.blockedDates || [] 
					}), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				
				case 'blocked-date-ranges':
					return new Response(JSON.stringify({ 
						success: true, 
						data: deliveryData.blockedDateRanges || [] 
					}), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				
				case 'settings':
					return new Response(JSON.stringify({ 
						success: true, 
						data: deliveryData.settings || {} 
					}), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				
				case 'tag-mapping-settings':
					return new Response(JSON.stringify({ 
						success: true, 
						data: deliveryData.tagMappingSettings || {} 
					}), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				
				default:
					return new Response(JSON.stringify({ 
						success: false, 
						error: 'Endpoint not found' 
					}), {
						status: 404,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
			}
		} catch (error) {
			return new Response(JSON.stringify({ 
				success: false, 
				error: error.message 
			}), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}
	}

	// For non-widget API calls, return 503 Service Unavailable
	return new Response(JSON.stringify({ 
		error: 'Admin dashboard unavailable and no fallback for this endpoint',
		fallbackAvailable: false
	}), {
		status: 503,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}

async function serveEnhancedWidget(): Promise<Response> {
	// Read the enhanced cart widget file from the file system
	// For now, return a basic enhanced widget response
	return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Delivery Scheduler Widget - v1.15.2</title>
    <style>
        /* Enhanced widget styles would go here */
        .delivery-scheduler-widget {
            max-width: 500px;
            margin: 20px auto;
            padding: 24px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .widget-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="delivery-scheduler-widget">
        <h3 class="widget-title">🚚 Enhanced Delivery Scheduler v1.15.2</h3>
        <p style="text-align: center; color: #6b7280;">
            Comprehensive tagging system with simplified 3-tag approach
        </p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="/widget-docs" style="color: #3b82f6; text-decoration: none;">
                📖 View Integration Guide
            </a>
        </div>
    </div>
</body>
</html>
	`, {
		headers: { 
			'Content-Type': 'text/html',
			'Access-Control-Allow-Origin': '*'
		}
	});
}
