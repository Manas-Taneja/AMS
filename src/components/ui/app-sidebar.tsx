import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
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
import { LuLayoutDashboard, LuUsers, LuPackage, LuTarget, LuMapPin, LuLogOut, LuGraduationCap, LuReceipt } from "react-icons/lu";

const items = [
  { title: "Dashboard", url: "/", icon: LuLayoutDashboard },
  { title: "Locations", url: "/location", icon: LuMapPin },
  { title: "Team", url: "/staff", icon: LuUsers },
  { title: "Projects", url: "/projects", icon: LuTarget },
  { title: "Items", url: "/items", icon: LuPackage },
  { title: "Bills", url: "/bills", icon: LuReceipt },
  { title: "Training", url: "/training", icon: LuGraduationCap },
  { title: "Users", url: "/users", icon: LuUsers }
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login"); // Redirect to login after logout
  };

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="h-screen"
      >
        <Sidebar collapsible="icon" className="py-2 border-r border-gray-200 shadow-lg w-54 bg-white h-screen text-green-600">
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
                        <Link
                          href={item.url}
                          className="flex items-center gap-2 hover:shadow-lg hover:bg-gray-200 rounded-lg"
                          {...(item.title === "Dashboard" ? { 'aria-current': 'page' } : {})}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
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
                    <SidebarMenuButton 
                      onClick={handleLogout}
                      className="flex items-center gap-2 hover:shadow-lg hover:bg-gray-200 rounded-lg text-red-600 cursor-pointer"
                    >
                      <LuLogOut className="w-4 h-4" />
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