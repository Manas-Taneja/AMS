"use client"

import * as React from "react"
import {
  LuSettings,
  LuUser,
  LuPackage,
  LuMapPin,
  LuTarget,
  LuReceipt,
  LuGraduationCap,
  LuLayoutDashboard,
  LuPlus,
  LuLogOut,
  LuMoon,
  LuSun,
  LuMonitor,
  LuSearch,
  LuClock,
  LuDownload,
  LuRefreshCw,
  LuUsers
} from "react-icons/lu"
import { useRouter } from "next/navigation"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { toast } from "sonner"

interface RecentItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
  timestamp: number
}

export function CommandPalette({ customTrigger }: { customTrigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [recentItems, setRecentItems] = React.useState<RecentItem[]>([])
  const router = useRouter()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()

  // Load recent items from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('commandPaletteRecent')
    if (stored) {
      try {
        setRecentItems(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse recent items', e)
      }
    }
  }, [])

  // Save recent items to localStorage
  const addRecentItem = React.useCallback((item: Omit<RecentItem, 'timestamp'>) => {
    const newItem: RecentItem = { ...item, timestamp: Date.now() }
    setRecentItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id)
      const updated = [newItem, ...filtered].slice(0, 5)
      localStorage.setItem('commandPaletteRecent', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      
      // Cmd/Ctrl + P for profile (when palette is closed)
      if (e.key === "p" && (e.metaKey || e.ctrlKey) && !open) {
        e.preventDefault()
        router.push('/profile')
      }
      
      // Cmd/Ctrl + B for dashboard (when palette is closed)
      if (e.key === "b" && (e.metaKey || e.ctrlKey) && !open) {
        e.preventDefault()
        router.push('/')
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, router])

  const runCommand = React.useCallback((command: () => unknown, recentItem?: Omit<RecentItem, 'timestamp'>) => {
    setOpen(false)
    setSearchQuery("")
    command()
    if (recentItem) {
      addRecentItem(recentItem)
    }
  }, [addRecentItem])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
    setOpen(false)
  }

  const handleExportData = () => {
    toast.info('Preparing export...')
    setTimeout(() => {
      toast.success('Data exported successfully')
    }, 1000)
    setOpen(false)
  }

  const handleRefreshData = () => {
    toast.info('Refreshing data...')
    setTimeout(() => {
      toast.success('Data refreshed')
    }, 1000)
    setOpen(false)
  }

  return (
    <>
      {customTrigger ? (
        <div 
          onClick={() => setOpen(true)} 
          className="cursor-pointer"
          title="Open command palette (⌘K)"
        >
          {customTrigger}
        </div>
      ) : (
        <div 
          className="hidden md:flex items-center text-sm text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200 w-64 justify-between"
          onClick={() => setOpen(true)}
          title="Open command palette"
        >
          <div className="flex items-center gap-2">
            <LuSearch className="h-4 w-4" />
            <span>Search...</span>
          </div>
          <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-md border border-border bg-card px-2 font-mono text-[11px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found. Try a different search.</CommandEmpty>
          
          {/* Recent Items */}
          {recentItems.length > 0 && !searchQuery && (
            <>
              <CommandGroup heading="Recent">
                {recentItems.map((item) => (
                  <CommandItem 
                    key={item.id} 
                    onSelect={() => runCommand(() => router.push(item.path))}
                  >
                    <LuClock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(
              () => router.push('/items/new'),
              { id: 'new-item', label: 'Add New Item', path: '/items/new', icon: <LuPlus /> }
            )}>
              <LuPlus className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Add New Item</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => router.push('/bills/upload'),
              { id: 'upload-bill', label: 'Upload Bill', path: '/bills/upload', icon: <LuReceipt /> }
            )}>
              <LuReceipt className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Upload Bill</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => handleExportData())}>
              <LuDownload className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Export Dashboard Data</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => handleRefreshData())}>
              <LuRefreshCw className="mr-2 h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span>Refresh Data</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(
              () => router.push('/'),
              { id: 'dashboard', label: 'Dashboard', path: '/', icon: <LuLayoutDashboard /> }
            )}>
              <LuLayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => router.push('/items'),
              { id: 'items', label: 'Items Inventory', path: '/items', icon: <LuPackage /> }
            )}>
              <LuPackage className="mr-2 h-4 w-4" />
              <span>Items Inventory</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => router.push('/location'),
              { id: 'locations', label: 'Locations', path: '/location', icon: <LuMapPin /> }
            )}>
              <LuMapPin className="mr-2 h-4 w-4" />
              <span>Locations</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => router.push('/projects'),
              { id: 'projects', label: 'Projects', path: '/projects', icon: <LuTarget /> }
            )}>
              <LuTarget className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => router.push('/bills'),
              { id: 'bills', label: 'Bills', path: '/bills', icon: <LuReceipt /> }
            )}>
              <LuReceipt className="mr-2 h-4 w-4" />
              <span>Bills</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => router.push('/training'),
              { id: 'training', label: 'Training', path: '/training', icon: <LuGraduationCap /> }
            )}>
              <LuGraduationCap className="mr-2 h-4 w-4" />
              <span>Training</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => router.push('/staff'),
              { id: 'staff', label: 'Staff', path: '/staff', icon: <LuUsers /> }
            )}>
              <LuUsers className="mr-2 h-4 w-4" />
              <span>Staff</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Theme Switching */}
          <CommandGroup heading="Appearance">
            <CommandItem onSelect={() => handleThemeChange('light')}>
              <LuSun className="mr-2 h-4 w-4" />
              <span>Light Theme</span>
              {theme === 'light' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </CommandItem>
            <CommandItem onSelect={() => handleThemeChange('dark')}>
              <LuMoon className="mr-2 h-4 w-4" />
              <span>Dark Theme</span>
              {theme === 'dark' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </CommandItem>
            <CommandItem onSelect={() => handleThemeChange('system')}>
              <LuMonitor className="mr-2 h-4 w-4" />
              <span>System Theme</span>
              {theme === 'system' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Settings & Profile */}
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(
              () => router.push('/profile'),
              { id: 'profile', label: 'Profile', path: '/profile', icon: <LuUser /> }
            )}>
              <LuUser className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => router.push('/settings'),
              { id: 'settings', label: 'Settings', path: '/settings', icon: <LuSettings /> }
            )}>
              <LuSettings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => logout())}>
              <LuLogOut className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
              <span>Log out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
