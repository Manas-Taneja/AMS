import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "./sidebar";
import { 
  LuLayoutDashboard, 
  LuUsers, 
  LuPackage, 
  LuTarget, 
  LuMapPin, 
  LuGraduationCap, 
  LuReceipt
} from "react-icons/lu";
import { Avatar, AvatarFallback } from "./avatar";
import { CommandPalette } from "../CommandPalette";
import { LuSearch } from "react-icons/lu";
import { ThemeToggle } from "../ThemeToggle";

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
  const { user } = useAuth();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border shadow-sm bg-card text-card-foreground z-40 w-auto">
      <SidebarHeader className="h-16 flex items-center justify-center px-2 border-b border-border">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400 overflow-hidden">
           <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center text-white shrink-0">
             P
           </div>
           {/* Hidden text for screen readers */}
           <span className="sr-only">AMS Enterprise</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        {/* Search Trigger in Sidebar */}
        <div className="px-2 mb-4 flex justify-center">
          <CommandPalette 
            customTrigger={
              <div className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent text-muted-foreground cursor-pointer transition-colors border border-transparent hover:border-border">
                <LuSearch className="w-5 h-5 opacity-70" />
              </div>
            }
          />
        </div>

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
                .map((item) => {
                  const isActive = pathname === item.url || (item.url !== '/' && pathname?.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.title}
                        className={`
                          transition-all duration-200 justify-center group-data-[collapsible=icon]:!p-2
                          ${isActive 
                            ? "scale-105 shadow-md bg-card text-blue-600 dark:text-blue-400" 
                            : "text-muted-foreground hover:scale-105 hover:shadow-md hover:bg-card hover:text-foreground"
                          }
                        `}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"} transition-colors`} />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          {/* Theme Toggle Button */}
          <SidebarMenuItem>
            <div className="flex items-center justify-center py-2">
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
          
          {/* Profile Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Profile & Settings"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-center group-data-[collapsible=icon]:!p-2"
            >
              <Link href="/profile" className="flex items-center justify-center">
                <Avatar className="h-8 w-8 rounded-lg transition-transform hover:scale-105">
                  <AvatarFallback className="rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium text-xs">
                    {user?.full_name ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">{user?.full_name || 'User'}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
