# Dark Mode Implementation

This application now supports **Light Mode**, **Dark Mode**, and **System Preference** themes.

## Features

- **Three Theme Options:**
  - **Light Mode**: Traditional light theme
  - **Dark Mode**: Eye-friendly dark theme
  - **System**: Automatically follows your operating system's theme preference

- **Persistent Theme**: Your theme choice is saved in localStorage and persists across sessions
- **No Flash**: Theme is applied before page render to prevent flash of wrong theme
- **Smooth Transitions**: All color changes are animated for a smooth experience

## Usage

### Theme Toggle Location

The theme toggle button is available in two locations:

1. **Desktop Sidebar** (left sidebar) - Next to the search icon
2. **Mobile Header** - Top right corner when viewing on mobile devices

### How to Change Theme

1. Click the theme toggle button (sun/moon icon)
2. Select your preferred theme from the dropdown:
   - **Light** - Light theme
   - **Dark** - Dark theme  
   - **System** - Follow system preference

## Technical Implementation

### Components

- **ThemeContext** (`src/context/ThemeContext.tsx`): React context for theme management
- **ThemeToggle** (`src/components/ThemeToggle.tsx`): Toggle button component
- **Theme colors** are defined in `src/styles/globals.css` using CSS custom properties

### Color System

The application uses semantic color tokens that automatically adapt to the current theme:

- `bg-background` / `text-foreground` - Base colors
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary elements
- `bg-muted` / `text-muted-foreground` - Muted/subtle elements
- `bg-accent` / `text-accent-foreground` - Hover states
- `border-border` - Borders
- `border-input` - Input borders

### CSS Variables

All colors are defined as HSL values in CSS custom properties and automatically switch based on the theme class (`.light` or `.dark`) applied to the root element.

## Browser Support

Works in all modern browsers that support:
- CSS Custom Properties
- LocalStorage
- Media Queries (prefers-color-scheme)

## Notes for Developers

When adding new components or pages:

1. **Use semantic color classes** instead of hardcoded colors:
   - ✅ `className="bg-card text-foreground"`
   - ❌ `className="bg-white text-gray-900"`

2. **Add dark mode variants** when needed:
   - `className="bg-white dark:bg-gray-900"`

3. **Test in both themes** to ensure good contrast and readability

4. **Use existing UI components** from `src/components/ui/` as they already have dark mode support built-in
