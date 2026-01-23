import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
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
  SidebarProvider,
  SidebarRail,
} from "./sidebar";
import { 
  LuLayoutDashboard, 
  LuUsers, 
  LuPackage, 
  LuTarget, 
  LuMapPin, 
  LuLogOut, 
  LuGraduationCap, 
  LuReceipt,
  LuChevronsUpDown,
  LuUser,
  LuSettings,
  LuBell
} from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Avatar, AvatarFallback } from "./avatar";

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
  const [open, setOpen] = useState(true); // Default to open
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar collapsible="icon" className="border-r border-gray-200 shadow-sm bg-white text-gray-900">
        <SidebarHeader className="h-16 flex items-center px-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-900 overflow-hidden">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
               P
             </div>
             <span className="truncate group-data-[collapsible=icon]:hidden">AMS Enterprise</span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent className="py-4">
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
                            transition-all duration-200
                            ${isActive 
                              ? "bg-blue-50 text-blue-700 font-medium" 
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }
                          `}
                        >
                          <Link href={item.url} className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-100 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      {/* <AvatarImage src={user?.avatar} alt={user?.name} /> */}
                      <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 font-medium">
                        {user?.full_name ? getInitials(user.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">{user?.full_name || 'User'}</span>
                      <span className="truncate text-xs text-gray-500 capitalize">{user?.role || 'Staff'}</span>
                    </div>
                    <LuChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700">
                           {user?.full_name ? getInitials(user.full_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.full_name}</span>
                        <span className="truncate text-xs text-gray-500">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <LuUser className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LuSettings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LuBell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LuLogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}
