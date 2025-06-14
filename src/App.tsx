import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DeliveryAreas } from "@/components/modules/DeliveryAreas";
import { TimeSlots } from "@/components/modules/TimeSlots";
import { Express } from "@/components/modules/Express";
import { AvailabilityCalendar } from "@/components/modules/AvailabilityCalendar";
import { ProductManagement } from "@/components/modules/ProductManagement";
import { LivePreview } from "@/components/modules/LivePreview";
import { SettingsPage } from "@/pages/SettingsPage";
import { ShopifyIntegration } from "@/components/modules/ShopifyIntegration";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/layout/Header";

function AppContent() {
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
        return <SettingsPage />;
      default:
        return <DeliveryAreas />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            {renderModule()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;