import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  MapPin, 
  Clock, 
  Zap, 
  Calendar, 
  Package, 
  Eye, 
  Settings,
  Flower2,
  Store
} from "lucide-react";

interface AppSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  {
    title: "Delivery Areas",
    icon: MapPin,
    id: "delivery-areas",
    emoji: "🗺️"
  },
  {
    title: "Time Slots",
    icon: Clock,
    id: "time-slots",
    emoji: "⏰"
  },
  {
    title: "Express",
    icon: Zap,
    id: "express",
    emoji: "⚡"
  },
  {
    title: "Availability Calendar",
    icon: Calendar,
    id: "calendar",
    emoji: "📅"
  },
  {
    title: "Product Management",
    icon: Package,
    id: "products",
    emoji: "📦"
  },
  {
    title: "Live Preview",
    icon: Eye,
    id: "preview",
    emoji: "👁️"
  },
  {
    title: "Shopify Integration",
    icon: Store,
    id: "shopify",
    emoji: "🛍️"
  },
  {
    title: "Settings",
    icon: Settings,
    id: "settings",
    emoji: "⚙️"
  },
];

export function AppSidebar({ activeModule, onModuleChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-olive rounded-lg flex items-center justify-center">
            <Flower2 className="w-5 h-5 text-olive-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Delivery Manager</h2>
            <p className="text-sm text-muted-foreground">Flower Delivery System</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onModuleChange(item.id)}
                    isActive={activeModule === item.id}
                    className="w-full justify-start"
                  >
                    <span className="mr-2">{item.emoji}</span>
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}