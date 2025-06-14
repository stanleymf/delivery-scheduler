import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DeliveryAreas } from "@/components/modules/DeliveryAreas";
import { TimeSlots } from "@/components/modules/TimeSlots";
import { Express } from "@/components/modules/Express";
import { AvailabilityCalendar } from "@/components/modules/AvailabilityCalendar";
import { ProductManagement } from "@/components/modules/ProductManagement";
import { LivePreview } from "@/components/modules/LivePreview";
import { Settings } from "@/components/modules/Settings";
import { ShopifyIntegration } from "@/components/modules/ShopifyIntegration";
import { AccountManagement } from "@/components/account/AccountManagement";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/layout/Header";

function AppContent() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/delivery-areas" replace />} />
              <Route path="/delivery-areas" element={<DeliveryAreas />} />
              <Route path="/time-slots" element={<TimeSlots />} />
              <Route path="/express" element={<Express />} />
              <Route path="/calendar" element={<AvailabilityCalendar />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/preview" element={<LivePreview />} />
              <Route path="/shopify" element={<ShopifyIntegration />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/account" element={<AccountManagement />} />
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/delivery-areas" replace />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;