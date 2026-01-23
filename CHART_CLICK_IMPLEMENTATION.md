# Chart Click Navigation Implementation

## Overview
This document describes the implementation of clickable charts using ECharts that navigate to relevant pages with filters automatically applied.

## What Was Implemented

### 1. **Chart Components Updated**
All three chart components now support click navigation:

- **AssetCategoryChart** (Pie Chart)
- **IdleAssetCategoryChart** (Bar Chart)
- **UtilizationChart** (Line + Bar Chart)

### 2. **Click Navigation Mapping**

When you click on a chart segment/bar, the following navigation happens:

| Chart Type | Clicked Category | Navigation Target | Filter Applied |
|------------|------------------|-------------------|----------------|
| **Drones** | Any category (e.g., "Security & Surveillance") | `/items` | `category=Drones&subcategory=Security & Surveillance` |
| **Staff** | Any job title (e.g., "Management") | `/staff` | `category=Management` |
| **Training** | Any role (e.g., "Instructors") | `/training` | `category=Instructors` |
| **IT Components** | Any type (e.g., "Servers") | `/items` | `category=Servers` |

### 3. **Page Filter Handling**

Three pages were updated to read URL parameters and apply filters automatically:

#### Items Page (`/items`)
- Reads `category` and `subcategory` from URL
- Applies category filter automatically
- Uses search field to filter by subcategory name
- Shows toast notification: "Filtering by: [subcategory]"

#### Staff Page (`/staff`)
- Reads `category` from URL
- Applies department filter automatically
- Shows toast notification: "Filtering by: [category]"

#### Training Page (`/training`)
- Reads `category` from URL
- Applies search filter to find matching training courses
- Shows toast notification: "Filtering by: [category]"

### 4. **User Experience Enhancements**

- Added `cursor-pointer` class to all charts to indicate clickability
- Updated chart descriptions to include: "• Click on any segment/bar to view details"
- Toast notifications inform users when filters are applied from URL parameters

## Example Usage

### Example 1: Clicking on "Security & Surveillance" in Drones Chart
1. User clicks on "Security & Surveillance" segment
2. Navigation: `window.location = '/items?category=Drones&subcategory=Security%20%26%20Surveillance'`
3. Items page loads with:
   - Category filter set to "Drones"
   - Search field populated with "Security & Surveillance"
   - Filtered list showing only matching items
   - Toast: "Filtering by: Security & Surveillance"

### Example 2: Clicking on "Management" in Staff Chart
1. User clicks on "Management" bar
2. Navigation: `window.location = '/staff?category=Management'`
3. Staff page loads with:
   - Department filter set to "Management"
   - Filtered list showing only management staff
   - Toast: "Filtering by: Management"

## Technical Details

### Chart Click Handler Pattern
```typescript
const handleChartClick = (params: { name: string }) => {
  const categoryName = params.name;
  
  switch(activeChartType) {
    case 'drones':
      router.push(`/items?category=Drones&subcategory=${encodeURIComponent(categoryName)}`);
      break;
    case 'staff':
      router.push(`/staff?category=${encodeURIComponent(categoryName)}`);
      break;
    // ... more cases
  }
};
```

### URL Parameter Handling Pattern
```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
      setSelectedCategory(category);
      toast.info(`Filtering by: ${category}`);
    }
  }
}, [router]);
```

### ECharts Configuration
```typescript
<ReactECharts 
  option={getChartOption(currentData.categories)} 
  style={{ height: 600, width: '100%' }} 
  className='bg-transparent rounded-lg p-4 cursor-pointer' 
  onEvents={{
    click: handleChartClick
  }}
/>
```

## Data Considerations

### Current Implementation
The current implementation uses **sample data** from:
- `/src/data/sampleChartData.ts` - Contains drone, staff, training, and IT component categories

### If You Need to Modify Sample Data

The chart data categories should match the actual items in your database. For example:

**Drone Categories in Chart:**
- Aerial Photography
- Surveying & Mapping
- Search & Rescue
- Agricultural Monitoring
- Infrastructure Inspection
- Security & Surveillance

**Should map to items with:**
- `category = "Drones"`
- `description` or `project` field containing these category names

### Suggested Database Schema (If Not Already Present)

If you want to improve filtering, you might want to add a `subcategory` or `project_type` field to your components table:

```sql
-- Add subcategory column to components table
ALTER TABLE components ADD COLUMN subcategory VARCHAR(255);

-- Example data for drone components
UPDATE components 
SET subcategory = 'Security & Surveillance' 
WHERE category = 'Drones' 
AND (name LIKE '%security%' OR description LIKE '%surveillance%');

-- Add index for better query performance
CREATE INDEX idx_components_category_subcategory ON components(category, subcategory);
```

## Testing

### Test Steps
1. Navigate to `/dashboard`
2. Switch to "Analytics" tab
3. Click on any segment in the "Asset Category" chart (pie chart)
4. Verify you're redirected to the appropriate page with filters applied
5. Check that the toast notification appears
6. Verify the filtered results match the clicked category

### Test Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Drone Chart Click | Click "Security & Surveillance" | Navigate to items page, Drones category selected, search shows "Security & Surveillance" |
| Staff Chart Click | Click "Management" | Navigate to staff page, department filter shows "Management" |
| IT Components Click | Click "Servers" | Navigate to items page, category filter shows "Servers" |
| Training Chart Click | Click "Instructors" | Navigate to training page, search shows "Instructors" |

## Files Modified

### Chart Components (3 files)
1. `/src/components/AssetCategoryChart.tsx`
   - Added router import
   - Added `handleChartClick` function
   - Added `onEvents` prop to ReactECharts
   - Updated description with click instruction

2. `/src/components/IdleAssetCategoryChart.tsx`
   - Same changes as AssetCategoryChart

3. `/src/components/UtilizationChart.tsx`
   - Same changes as AssetCategoryChart

### Page Components (3 files)
4. `/src/pages/items/index.tsx`
   - Added useEffect to handle URL parameters
   - Reads `category` and `subcategory` from URL
   - Applies filters automatically

5. `/src/pages/staff/index.tsx`
   - Added toast import
   - Added useEffect to handle URL parameters
   - Applies department filter from URL

6. `/src/pages/training/index.tsx`
   - Added useEffect import
   - Added useEffect to handle URL parameters
   - Applies search filter from URL

## Future Enhancements

### Potential Improvements
1. **Backend Integration**: Connect chart data to real-time database queries
2. **Custom Subcategory Field**: Add dedicated subcategory field to database
3. **Advanced Filtering**: Support multiple filter parameters (category + status + location)
4. **Click Analytics**: Track which chart categories are clicked most often
5. **Breadcrumb Navigation**: Show filter trail when navigating from charts
6. **Clear Filters Button**: Add prominent button to clear URL-based filters
7. **Deep Linking**: Allow sharing filtered views via URL

## Notes

- All URL parameters are properly encoded using `encodeURIComponent()`
- Toast notifications use the `sonner` library
- Navigation uses Next.js `useRouter()` hook
- TypeScript types are properly defined for click handlers
- No linter errors or warnings

## Support

If you need to:
1. **Add new chart types**: Follow the pattern in existing chart components
2. **Modify navigation targets**: Update the switch statement in `handleChartClick`
3. **Change filter behavior**: Modify the useEffect in the target page component
4. **Add more filter parameters**: Extend the URL parameters and page filtering logic

---

**Last Updated**: January 2026
**Implementation Status**: ✅ Complete and Tested
