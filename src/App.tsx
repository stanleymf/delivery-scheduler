import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DeliveryAreas } from "@/components/modules/DeliveryAreas";
import { TimeSlots } from "@/components/modules/TimeSlots";
import { Express } from "@/components/modules/Express";
import { AvailabilityCalendar } from "@/components/modules/AvailabilityCalendar";
import { ProductManagement } from "@/components/modules/ProductManagement";
import { LivePreview } from "@/components/modules/LivePreview";
import { Settings } from "@/components/modules/Settings";
import { ShopifyIntegration } from "@/components/modules/ShopifyIntegration";

function App() {
  const [activeModule, setActiveModule] = useState("delivery-areas");

  const renderModule = () => {
    switch (activeModule) {
      case "delivery-areas":
        return <DeliveryAreas />;
      case "time-slots":
        return <TimeSlots />;
      case "express":
        return <Express />;
      case "calendar":
        return <AvailabilityCalendar />;
      case "products":
        return <ProductManagement />;
      case "preview":
        return <LivePreview />;
      case "shopify":
        return <ShopifyIntegration />;
      case "settings":
        return <Settings />;
      default:
        return <DeliveryAreas />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <SidebarInset className="flex-1">
          <div className="flex items-center gap-2 p-4 border-b">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold">Delivery Scheduler</h1>
          </div>
          <main className="flex-1 p-6 overflow-auto">
            {renderModule()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default App;