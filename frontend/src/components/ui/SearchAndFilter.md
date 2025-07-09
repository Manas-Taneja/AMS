# SearchAndFilter Component

A unified, reusable search and filter component that provides consistent search and filtering functionality across the application.

## Features

- **Search**: Full-text search with customizable placeholder
- **Filters**: Multiple dropdown filters with configurable options
- **View Mode Toggle**: Optional grid/list view toggle
- **Results Summary**: Shows filtered vs total count
- **Clear Filters**: One-click filter reset
- **Custom Actions**: Support for additional action buttons
- **Responsive**: Mobile-friendly design

## Usage

### Basic Example

```tsx
import SearchAndFilter from "../components/ui/SearchAndFilter"

function MyPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [data, setData] = useState([])
  
  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <SearchAndFilter
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search items..."
      filters={[
        {
          key: "status",
          label: "Status",
          value: statusFilter,
          options: [
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" }
          ],
          onValueChange: setStatusFilter
        }
      ]}
      totalCount={data.length}
      filteredCount={filteredData.length}
      itemLabel="items"
      onClearFilters={() => {
        setSearch("")
        setStatusFilter("all")
      }}
      hasActiveFilters={!!(search || statusFilter !== "all")}
    />
  )
}
```

### With View Mode Toggle

```tsx
<SearchAndFilter
  searchValue={search}
  onSearchChange={setSearch}
  filters={[...]}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  showViewToggle={true}
  totalCount={data.length}
  filteredCount={filteredData.length}
  itemLabel="items"
  onClearFilters={clearFilters}
  hasActiveFilters={hasFilters}
/>
```

### With Custom Actions

```tsx
<SearchAndFilter
  searchValue={search}
  onSearchChange={setSearch}
  filters={[...]}
  totalCount={data.length}
  filteredCount={filteredData.length}
  itemLabel="items"
  onClearFilters={clearFilters}
  hasActiveFilters={hasFilters}
  customActions={
    <Button variant="outline" onClick={handleExport}>
      Export
    </Button>
  }
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `searchValue` | `string` | Yes | Current search term |
| `onSearchChange` | `(value: string) => void` | Yes | Search change handler |
| `searchPlaceholder` | `string` | No | Search input placeholder (default: "Search...") |
| `filters` | `FilterConfig[]` | No | Array of filter configurations |
| `viewMode` | `"grid" \| "list"` | No | Current view mode |
| `onViewModeChange` | `(mode: "grid" \| "list") => void` | No | View mode change handler |
| `showViewToggle` | `boolean` | No | Show view mode toggle (default: false) |
| `totalCount` | `number` | Yes | Total number of items |
| `filteredCount` | `number` | Yes | Number of filtered items |
| `itemLabel` | `string` | No | Label for items (default: "items") |
| `onClearFilters` | `() => void` | No | Clear all filters handler |
| `hasActiveFilters` | `boolean` | No | Whether any filters are active |
| `customActions` | `React.ReactNode` | No | Additional action buttons |
| `className` | `string` | No | Additional CSS classes |

## Filter Configuration

```tsx
interface FilterConfig {
  key: string           // Unique identifier for the filter
  label: string         // Display label for the filter
  value: string         // Current selected value
  options: FilterOption[] // Available options
  onValueChange: (value: string) => void // Value change handler
}

interface FilterOption {
  value: string  // Option value
  label: string  // Display label
}
```

## Styling

The component uses Tailwind CSS classes and follows the design system. It's fully responsive and includes:

- Hover effects on interactive elements
- Focus states for accessibility
- Mobile-first responsive design
- Consistent spacing and typography
- Card-based layout with subtle shadows

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management 