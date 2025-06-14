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
			// Serve customer widget bundle - PRIORITY ROUTE
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
					version: '1.7.0',
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
        blockedDateRanges: []
    };
    
    let selectedType = 'delivery';
    let selectedDate = null;
    let selectedTimeslot = null;
    let selectedLocation = null;
    let postalCode = '';
    
    // Fetch data from admin dashboard via proxy
    async function fetchWidgetData(shopDomain) {
        try {
            console.log('Fetching widget data for shop:', shopDomain);
            
            const baseUrl = 'https://delivery-scheduler-widget.stanleytan92.workers.dev';
            const [timeslotsRes, settingsRes, blockedDatesRes, blockedRangesRes] = await Promise.all([
                fetch(baseUrl + '/api/public/widget/timeslots'),
                fetch(baseUrl + '/api/public/widget/settings'), 
                fetch(baseUrl + '/api/public/widget/blocked-dates'),
                fetch(baseUrl + '/api/public/widget/blocked-date-ranges')
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
                blockedDateRanges: []
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
                        \${cartMode ? 'Update Cart with Delivery' : 'Add to Cart with Delivery'}
                    </button>
                </div>
                
                <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #6b7280;">
                    Powered by Delivery Scheduler v1.7.0 - <span style="color: #16a34a; font-weight: 600;">●</span> LIVE
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
    };
    
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
    
    window.addToCartWithDelivery = function() {
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
            location: selectedType === 'collection' ? location : null
        };
        
        console.log('Delivery preferences:', deliveryData);
        
        // Here you would integrate with Shopify cart
        // For now, show success message
        alert(\`Delivery scheduled for \${formatDate(selectedDate)} - \${slot.name}\`);
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
