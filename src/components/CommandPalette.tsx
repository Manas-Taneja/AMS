"use client"

import * as React from "react"
import {
  LuCalculator,
  LuCalendar,
  LuCreditCard,
  LuSettings,
  LuSmile,
  LuUser,
  LuPackage,
  LuMapPin,
  LuTarget,
  LuReceipt,
  LuGraduationCap,
  LuLayoutDashboard,
  LuPlus,
  LuLogOut
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

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <div 
        className="hidden md:flex items-center text-sm text-muted-foreground border rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(true)}
      >
        <span className="mr-4 text-gray-500">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => router.push('/items/new'))}>
              <LuPlus className="mr-2 h-4 w-4" />
              <span>Add New Item</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/bills/upload'))}>
              <LuPlus className="mr-2 h-4 w-4" />
              <span>Upload Bill</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
              <LuLayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/items'))}>
              <LuPackage className="mr-2 h-4 w-4" />
              <span>Items Inventory</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/location'))}>
              <LuMapPin className="mr-2 h-4 w-4" />
              <span>Locations</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/projects'))}>
              <LuTarget className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/bills'))}>
              <LuReceipt className="mr-2 h-4 w-4" />
              <span>Bills</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/training'))}>
              <LuGraduationCap className="mr-2 h-4 w-4" />
              <span>Training</span>
            </CommandItem>
             <CommandItem onSelect={() => runCommand(() => router.push('/staff'))}>
              <LuUser className="mr-2 h-4 w-4" />
              <span>Staff</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push('/profile'))}>
              <LuUser className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
              <LuSettings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => logout())}>
              <LuLogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
