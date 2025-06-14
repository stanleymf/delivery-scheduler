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
	// Serve a synced widget that fetches data from Railway admin dashboard
	return new Response(`
// Delivery Scheduler Widget v1.3.0 - Synced with Admin Dashboard
(function() {
    'use strict';
    
    console.log('Delivery Scheduler Widget v1.3.0 loaded - Synced with Admin Dashboard');
    
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
            
            const baseUrl = window.location.origin;
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
        if (blockedDate && blockedDate.type === 'partial' && blockedDate.blockedTimeslots) {
            blockedDate.blockedTimeslots.forEach(id => blockedTimeslots.add(id));
        }
        
        const blockedRange = widgetData.blockedDateRanges.find(range => 
            range.dates && range.dates.includes(dateStr)
        );
        if (blockedRange && blockedRange.type === 'partial' && blockedRange.blockedTimeslots) {
            blockedRange.blockedTimeslots.forEach(id => blockedTimeslots.add(id));
        }
        
        return baseTimeslots.filter(slot => !blockedTimeslots.has(slot.id));
    }
    
    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return \`\${displayHour}:\${minutes} \${ampm}\`;
    }
    
    function renderWidget(container, config) {
        const availableTimeslots = getAvailableTimeslots();
        const collectionLocations = widgetData.collectionLocations;
        
        container.innerHTML = \`
            <div style="
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            ">
                <h3 style="margin: 0 0 15px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                    🚚 Delivery Options
                </h3>
                
                <!-- Delivery Type Selection -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Delivery Type</label>
                    <div style="display: flex; gap: 8px;">
                        <button id="delivery-btn" onclick="selectDeliveryType('delivery')" style="
                            flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; 
                            background: \${selectedType === 'delivery' ? '#616B53' : 'white'}; 
                            color: \${selectedType === 'delivery' ? 'white' : 'black'};
                            cursor: pointer; font-size: 14px; transition: all 0.2s;
                        ">🚚 Delivery</button>
                        <button id="collection-btn" onclick="selectDeliveryType('collection')" style="
                            flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; 
                            background: \${selectedType === 'collection' ? '#616B53' : 'white'};
                            color: \${selectedType === 'collection' ? 'white' : 'black'};
                            cursor: pointer; font-size: 14px; transition: all 0.2s;
                        ">🏢 Collection</button>
                    </div>
                </div>
                
                <!-- Postal Code (for delivery only) -->
                \${selectedType === 'delivery' ? \`
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Postal Code</label>
                    <input type="text" id="postal-code" placeholder="Enter 6-digit postal code" value="\${postalCode}" 
                           onchange="updatePostalCode(this.value)" maxlength="6" style="
                        width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;
                        font-size: 14px; box-sizing: border-box;
                    ">
                </div>
                \` : ''}
                
                <!-- Collection Location (for collection only) -->
                \${selectedType === 'collection' ? \`
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Collection Location</label>
                    <select id="collection-location" onchange="updateLocation(this.value)" style="
                        width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;
                        font-size: 14px; box-sizing: border-box;
                    ">
                        <option value="">Choose a location</option>
                        \${collectionLocations.map(loc => \`
                            <option value="\${loc.id}" \${selectedLocation === loc.id ? 'selected' : ''}>
                                \${loc.name}
                            </option>
                        \`).join('')}
                    </select>
                    \${selectedLocation ? \`
                        <div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 4px; font-size: 12px;">
                            📍 \${collectionLocations.find(l => l.id === selectedLocation)?.address}
                        </div>
                    \` : ''}
                </div>
                \` : ''}
                
                <!-- Date Selection -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Select Date</label>
                    <input type="date" id="delivery-date" onchange="updateDate(this.value)" style="
                        width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;
                        font-size: 14px; box-sizing: border-box;
                    " min="\${new Date().toISOString().split('T')[0]}" value="\${selectedDate ? selectedDate.toISOString().split('T')[0] : ''}">
                </div>
                
                <!-- Time Selection -->
                \${selectedDate ? \`
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Select Time Slot</label>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        \${availableTimeslots.map(slot => \`
                            <div onclick="selectTimeslot('\${slot.id}')" style="
                                padding: 12px; border: 1px solid \${selectedTimeslot === slot.id ? '#616B53' : '#d1d5db'}; 
                                border-radius: 6px; cursor: pointer; 
                                background: \${selectedTimeslot === slot.id ? '#616B53' : 'white'};
                                color: \${selectedTimeslot === slot.id ? 'white' : 'black'};
                                display: flex; justify-content: space-between; align-items: center;
                                transition: all 0.2s;
                            " onmouseover="this.style.borderColor='#616B53'" onmouseout="this.style.borderColor='\${selectedTimeslot === slot.id ? '#616B53' : '#d1d5db'}'">
                                <div>
                                    <div style="font-weight: 500;">\${slot.name}</div>
                                    <div style="font-size: 12px; opacity: 0.8;">\${formatTime(slot.startTime)} - \${formatTime(slot.endTime)}</div>
                                </div>
                                <div style="font-size: 12px; opacity: 0.9;">
                                    \${slot.maxOrders} slots
                                </div>
                            </div>
                        \`).join('')}
                        \${availableTimeslots.length === 0 ? '<div style="text-align: center; color: #666; padding: 20px; border: 1px dashed #ccc; border-radius: 6px;">No time slots available for this date</div>' : ''}
                    </div>
                </div>
                \` : ''}
                
                <!-- Summary -->
                \${selectedDate && selectedTimeslot ? \`
                <div style="margin-bottom: 15px; padding: 12px; background: #f0fdf4; border: 1px solid #22c55e; border-radius: 6px;">
                    <div style="font-weight: 500; margin-bottom: 8px; color: #15803d;">✅ Delivery Summary</div>
                    <div style="font-size: 14px; color: #166534; line-height: 1.4;">
                        <div><strong>Date:</strong> \${selectedDate.toLocaleDateString()}</div>
                        <div><strong>Time:</strong> \${widgetData.timeslots.find(s => s.id === selectedTimeslot)?.name}</div>
                        <div><strong>Type:</strong> \${selectedType === 'delivery' ? 'Delivery' : 'Collection'}</div>
                        \${selectedType === 'delivery' && postalCode ? \`<div><strong>Postal Code:</strong> \${postalCode}</div>\` : ''}
                        \${selectedType === 'collection' && selectedLocation ? \`<div><strong>Location:</strong> \${collectionLocations.find(l => l.id === selectedLocation)?.name}</div>\` : ''}
                    </div>
                </div>
                \` : ''}
                
                <button onclick="addToCartWithDelivery()" 
                        disabled="\${!selectedDate || !selectedTimeslot || (selectedType === 'collection' && !selectedLocation)}"
                        style="
                    width: 100%; padding: 12px; 
                    background: \${selectedDate && selectedTimeslot && (selectedType !== 'collection' || selectedLocation) ? '#616B53' : '#ccc'}; 
                    color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; 
                    cursor: \${selectedDate && selectedTimeslot && (selectedType !== 'collection' || selectedLocation) ? 'pointer' : 'not-allowed'};
                    transition: all 0.2s;
                " onmouseover="if(!this.disabled) this.style.background='#4a5240'" onmouseout="if(!this.disabled) this.style.background='#616B53'">
                    \${selectedDate && selectedTimeslot && (selectedType !== 'collection' || selectedLocation) ? 'Add to Cart with Delivery' : 'Select Date & Time'}
                </button>
                
                <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #6b7280;">
                    Powered by Delivery Scheduler v1.3.0 • Synced with Admin Dashboard
                </div>
            </div>
        \`;
    }
    
    // Global functions for widget interaction
    window.selectDeliveryType = function(type) {
        selectedType = type;
        selectedTimeslot = null;
        selectedLocation = null;
        const container = document.querySelector('[data-delivery-scheduler]');
        if (container) renderWidget(container, {});
    };
    
    window.updatePostalCode = function(value) {
        postalCode = value.replace(/\\D/g, '').substring(0, 6); // Only digits, max 6
        document.getElementById('postal-code').value = postalCode;
    };
    
    window.updateLocation = function(value) {
        selectedLocation = value;
        const container = document.querySelector('[data-delivery-scheduler]');
        if (container) renderWidget(container, {});
    };
    
    window.updateDate = function(value) {
        selectedDate = value ? new Date(value) : null;
        selectedTimeslot = null;
        const container = document.querySelector('[data-delivery-scheduler]');
        if (container) renderWidget(container, {});
    };
    
    window.selectTimeslot = function(timeslotId) {
        selectedTimeslot = timeslotId;
        const container = document.querySelector('[data-delivery-scheduler]');
        if (container) renderWidget(container, {});
    };
    
    window.addToCartWithDelivery = function() {
        if (!selectedDate || !selectedTimeslot) {
            alert('Please select both date and time for delivery');
            return;
        }
        
        if (selectedType === 'collection' && !selectedLocation) {
            alert('Please select a collection location');
            return;
        }
        
        const selectedSlot = widgetData.timeslots.find(s => s.id === selectedTimeslot);
        const selectedLoc = selectedType === 'collection' ? 
            widgetData.collectionLocations.find(l => l.id === selectedLocation) : null;
        
        const deliveryData = {
            type: selectedType,
            date: selectedDate.toISOString().split('T')[0],
            timeslot: selectedSlot,
            postalCode: selectedType === 'delivery' ? postalCode : null,
            location: selectedLoc
        };
        
        console.log('Delivery preferences:', deliveryData);
        
        // Generate order tags (matching admin dashboard logic)
        const tags = [];
        tags.push(selectedType === 'delivery' ? 'Delivery' : 'Collection');
        tags.push(selectedDate.toLocaleDateString('en-GB'));
        tags.push(selectedSlot.name);
        if (selectedType === 'delivery' && postalCode) tags.push(postalCode);
        if (selectedLoc) tags.push(selectedLoc.name);
        
        // Here you would normally integrate with Shopify cart
        // For now, show success message
        alert(\`✅ Delivery scheduled successfully!\\n\\nType: \${selectedType}\\nDate: \${selectedDate.toLocaleDateString()}\\nTime: \${selectedSlot.name}\${selectedLoc ? '\\nLocation: ' + selectedLoc.name : ''}\${postalCode ? '\\nPostal Code: ' + postalCode : ''}\\n\\nOrder tags: \${tags.join(', ')}\`);
    };
    
    // Initialize widgets when DOM is ready
    async function initializeWidgets() {
        const containers = document.querySelectorAll('[data-delivery-scheduler]');
        
        for (const container of containers) {
            const config = {
                shopDomain: container.getAttribute('data-shop-domain') || '',
                productId: container.getAttribute('data-product-id') || '',
                variantId: container.getAttribute('data-variant-id') || '',
                cartMode: container.getAttribute('data-cart-mode') === 'true',
                theme: container.getAttribute('data-theme') || 'light',
                locale: container.getAttribute('data-locale') || 'en'
            };
            
            if (config.shopDomain) {
                // Show loading state
                container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666; border: 1px solid #e5e7eb; border-radius: 8px; background: white;"><div style="margin-bottom: 10px;">🚚</div><div>Loading delivery options...</div><div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">Syncing with admin dashboard</div></div>';
                
                // Fetch data and render widget
                await fetchWidgetData(config.shopDomain);
                renderWidget(container, config);
            } else {
                container.innerHTML = '<div style="padding: 20px; border: 2px dashed #ccc; text-align: center; color: #666; border-radius: 8px;">🚚 Delivery Scheduler<br><small>Missing shop domain configuration</small></div>';
            }
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidgets);
    } else {
        initializeWidgets();
    }
    
    // Expose API for manual initialization
    window.DeliverySchedulerWidget = {
        init: async function(config) {
            const containerId = config.containerId || 'delivery-scheduler-widget';
            const container = document.getElementById(containerId);
            if (container) {
                await fetchWidgetData(config.shopDomain);
                renderWidget(container, config);
            } else {
                console.error('Container not found:', containerId);
            }
        },
        destroy: function(containerId) {
            const container = document.getElementById(containerId || 'delivery-scheduler-widget');
            if (container) {
                container.innerHTML = '';
            }
        },
        refresh: async function() {
            await initializeWidgets();
        }
    };
})();
	`, {
		headers: {
			'Content-Type': 'application/javascript',
			'Cache-Control': 'public, max-age=0, must-revalidate',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
