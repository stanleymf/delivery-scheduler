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
  SidebarTrigger,
  SidebarRail,
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
    id: "delivery-areas"
  },
  {
    title: "Time Slots",
    icon: Clock,
    id: "time-slots"
  },
  {
    title: "Express",
    icon: Zap,
    id: "express"
  },
  {
    title: "Availability Calendar",
    icon: Calendar,
    id: "calendar"
  },
  {
    title: "Product Management",
    icon: Package,
    id: "products"
  },
  {
    title: "Live Preview",
    icon: Eye,
    id: "preview"
  },
  {
    title: "Shopify Integration",
    icon: Store,
    id: "shopify"
  },
  {
    title: "Settings",
    icon: Settings,
    id: "settings"
  },
];

export function AppSidebar({ activeModule, onModuleChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-border" collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-olive rounded-lg flex items-center justify-center">
            <Flower2 className="w-5 h-5 text-olive-foreground" />
          </div>
          <div className="group-data-[state=collapsed]:hidden">
            <h2 className="font-semibold text-lg">Delivery Manager</h2>
            <p className="text-sm text-muted-foreground">Flower Delivery System</p>
          </div>
        </div>
        <SidebarTrigger className="absolute right-2 top-2 group-data-[state=collapsed]:relative group-data-[state=collapsed]:right-0 group-data-[state=collapsed]:top-0" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onModuleChange(item.id)}
                    isActive={activeModule === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    <span className="group-data-[state=collapsed]:hidden">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}