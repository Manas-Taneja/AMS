# Chart Dark Mode Support - Implementation

## Issue
Charts (ECharts) were not adapting their text colors to dark mode, making them difficult or impossible to read in dark theme.

## Root Cause
The chart configuration options were using default colors (typically black text) which don't automatically adapt to the theme. ECharts doesn't inherently support CSS-based theming, so colors must be explicitly set based on the current theme.

## Solution
Added theme detection and dynamic color configuration to all chart components using the `useTheme` hook from our ThemeContext.

## Files Updated

### 1. AssetCategoryChart.tsx (Pie Chart)
**Changes:**
- Added `useTheme` import and hook usage
- Defined `isDark` boolean and `textColor` variable based on theme
- Updated chart options with theme-aware colors:
  - Tooltip background and text color
  - Legend text color
  - Label colors and label line colors

**Theme Colors:**
- Light mode text: `#374151` (gray-700)
- Dark mode text: `#e5e7eb` (gray-200)
- Light mode tooltip bg: `#ffffff` (white)
- Dark mode tooltip bg: `#1f2937` (gray-800)

### 2. UtilizationChart.tsx (Bar & Line Chart)
**Changes:**
- Added `useTheme` import and hook usage
- Defined theme-based colors
- Updated chart options with theme-aware styling:
  - Tooltip styling
  - Legend text color
  - X-axis and Y-axis labels
  - Axis lines
  - Grid split lines
  - Axis name text

**Additional Styling:**
- Axis lines: Light `#d1d5db` / Dark `#4b5563`
- Split lines: Light `#e5e7eb` / Dark `#374151`

### 3. IdleAssetCategoryChart.tsx (Bar Chart)
**Changes:**
- Added `useTheme` import and hook usage
- Defined theme-based colors
- Updated chart options with theme-aware styling:
  - Tooltip styling
  - X-axis and Y-axis labels
  - Axis lines
  - Grid split lines
  - Axis name text

## Implementation Pattern

All charts now follow this pattern:

```tsx
import { useTheme } from '@/context/ThemeContext';

const ChartComponent: React.FC = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';

  const getChartOption = () => ({
    // ... chart config with dynamic colors
    textStyle: { color: textColor },
    tooltip: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      textStyle: { color: textColor }
    },
    // ... etc
  });
}
```

## Color Reference

### Text Colors
| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Primary Text | `#374151` (gray-700) | `#e5e7eb` (gray-200) |

### Background Colors
| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Tooltip | `#ffffff` (white) | `#1f2937` (gray-800) |

### Border/Line Colors
| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Tooltip Border | `#e5e7eb` (gray-200) | `#374151` (gray-700) |
| Axis Lines | `#d1d5db` (gray-300) | `#4b5563` (gray-600) |
| Split Lines | `#e5e7eb` (gray-200) | `#374151` (gray-700) |

## Chart Elements Updated

### Common to All Charts
- ✅ Tooltip background and border
- ✅ Tooltip text color
- ✅ Legend text color

### Pie Chart (AssetCategoryChart)
- ✅ Data labels
- ✅ Label connecting lines

### Bar/Line Charts (UtilizationChart, IdleAssetCategoryChart)
- ✅ X-axis labels
- ✅ Y-axis labels
- ✅ Axis names
- ✅ Axis lines
- ✅ Grid split lines

## Testing
- ✅ No linter errors
- ✅ Charts now display readable text in both light and dark modes
- ✅ Smooth transitions when switching themes
- ✅ All chart types (pie, bar, line) properly themed

## Result
All charts now seamlessly adapt to the current theme, maintaining excellent readability in both light and dark modes. The text, tooltips, axes, and grid lines all use appropriate colors that provide good contrast with their backgrounds.
