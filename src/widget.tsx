import React from 'react';
import { createRoot } from 'react-dom/client';
import { CustomerWidget } from './components/CustomerWidget';

// Widget configuration interface
interface WidgetConfig {
  shopDomain: string;
  productId?: string;
  variantId?: string;
  containerId?: string;
  theme?: 'light' | 'dark';
  locale?: string;
}

// Global widget function
declare global {
  interface Window {
    DeliverySchedulerWidget: {
      init: (config: WidgetConfig) => void;
      destroy: (containerId?: string) => void;
    };
  }
}

// Initialize widget
function initWidget(config: WidgetConfig) {
  const containerId = config.containerId || 'delivery-scheduler-widget';
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  // Create React root
  const root = createRoot(container);
  
  // Render widget
  root.render(
    <React.StrictMode>
      <CustomerWidget 
        shopDomain={config.shopDomain}
        productId={config.productId}
        variantId={config.variantId}
      />
    </React.StrictMode>
  );

  // Store reference for cleanup
  (window as any).__deliverySchedulerRoots = (window as any).__deliverySchedulerRoots || {};
  (window as any).__deliverySchedulerRoots[containerId] = root;
}

// Destroy widget
function destroyWidget(containerId?: string) {
  const id = containerId || 'delivery-scheduler-widget';
  const roots = (window as any).__deliverySchedulerRoots || {};
  
  if (roots[id]) {
    roots[id].unmount();
    delete roots[id];
  }
}

// Expose global API
window.DeliverySchedulerWidget = {
  init: initWidget,
  destroy: destroyWidget
};

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-delivery-scheduler]');
  
  containers.forEach(container => {
    const config: WidgetConfig = {
      shopDomain: container.getAttribute('data-shop-domain') || '',
      productId: container.getAttribute('data-product-id') || undefined,
      variantId: container.getAttribute('data-variant-id') || undefined,
      containerId: container.id,
      theme: (container.getAttribute('data-theme') as 'light' | 'dark') || 'light',
      locale: container.getAttribute('data-locale') || 'en'
    };

    if (config.shopDomain) {
      initWidget(config);
    }
  });
});

// Export for module usage
export { CustomerWidget, initWidget, destroyWidget }; 