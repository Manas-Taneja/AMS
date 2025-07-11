import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarProvider,
} from "./sidebar";
import { Home, Users, Package, Target, MapPinned, LogOut, Settings, GraduationCap, Receipt } from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Locations", url: "/location", icon: MapPinned },
  { title: "Team", url: "/staff", icon: Users },
  { title: "Projects", url: "/projects", icon: Target },
  { title: "Items", url: "/components", icon: Package },
  { title: "Bills", url: "/bills", icon: Receipt },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Users", url: "/users", icon: Users }
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="h-screen"
      >
        <Sidebar collapsible="icon" className="py-2 border-r border-gray-200 shadow-lg w-54 bg-white h-screen">
          <SidebarHeader />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items
                    .filter(item => {
                      if (item.title === "Users") {
                        return user && (user.role === "admin" || user.is_superuser)
                      }
                      if (item.title === "Projects" || item.title === "Training") {
                        return user && (user.role === "manager" || user.role === "admin" || user.is_superuser)
                      }
                      return true
                    })
                    .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a
                          href={item.url}
                          className="flex items-center gap-2 hover:shadow-lg hover:bg-gray-200 rounded-lg"
                          {...(item.title === "Dashboard" ? { 'aria-current': 'page' } : {})}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* User section */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a
                        href="/settings"
                        className="flex items-center gap-2 hover:shadow-lg hover:bg-gray-200 rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={handleLogout}
                      className="flex items-center gap-2 hover:shadow-lg hover:bg-gray-200 rounded-lg text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
} 