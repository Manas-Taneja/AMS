# Regional Analytics Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing and customizing the Regional Analytics feature in your Asset Management System.

## Files Created

### Components
1. **`/src/components/RegionalChart.tsx`** - Main regional comparison chart
2. **`/src/components/RegionalDetailsChart.tsx`** - Detailed center breakdown component

### Pages
3. **`/src/pages/regional-analytics/index.tsx`** - Dedicated regional analytics page

### Hooks
4. **`/src/hooks/useRegionalData.ts`** - Custom hook for API integration

### Documentation
5. **`/REGIONAL_ANALYTICS.md`** - Feature documentation
6. **`/REGIONAL_ANALYTICS_IMPLEMENTATION.md`** - This file

### Modified Files
- **`/src/pages/dashboard/index.tsx`** - Added RegionalChart to Analytics tab
- **`/src/components/ui/app-sidebar.tsx`** - Added navigation link
- **`/README.md`** - Updated with feature information

## Quick Start

### 1. Access the Feature

The Regional Analytics feature can be accessed in three ways:

**A. From Dashboard:**
```
Navigate to Dashboard → Analytics Tab → Scroll down to Regional Chart
```

**B. From Sidebar:**
```
Click "Regional Analytics" in the sidebar navigation menu
```

**C. Direct URL:**
```
http://your-domain/regional-analytics
```

### 2. Basic Usage

```typescript
// In any component
import RegionalChart from '@/components/RegionalChart';

function MyComponent() {
  return (
    <div>
      <RegionalChart />
    </div>
  );
}
```

### 3. With API Integration

```typescript
// In your component
import { useRegionalData } from '@/hooks/useRegionalData';
import { useAuth } from '@/context/AuthContext';

function RegionalAnalytics() {
  const { token } = useAuth();
  const { regionalData, loading, error, summary } = useRegionalData({ token });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Total Centers: {summary.totalCenters}</h2>
      <h3>Total Assets: {summary.totalAssets}</h3>
      {/* Use regionalData for your charts */}
    </div>
  );
}
```

## Configuration

### Adding New Regional Centers

#### Step 1: Update RegionalChart.tsx

```typescript
// In /src/components/RegionalChart.tsx
const regionalData: RegionalData[] = [
  // ... existing centers
  {
    region: 'Chennai',
    assets: 180,
    staff: 48,
    projects: 9,
    utilization: 84.2,
    status: 'active'
  },
];
```

#### Step 2: Update RegionalDetailsChart.tsx

```typescript
// In /src/components/RegionalDetailsChart.tsx
const centerDetailsData: Record<string, CenterDetails> = {
  // ... existing centers
  'Chennai': {
    name: 'Chennai',
    type: 'branch',
    status: 'active',
    address: 'Chennai, Tamil Nadu',
    manager: 'Suresh Raman',
    assets: {
      total: 180,
      drones: 50,
      itComponents: 85,
      equipment: 32,
      vehicles: 13,
    },
    staff: {
      total: 48,
      technical: 25,
      administrative: 16,
      management: 7,
    },
    projects: {
      active: 9,
      completed: 30,
      pending: 5,
    },
    utilization: 84.2,
    performance: [
      { month: 'Jan', efficiency: 82, incidents: 2 },
      { month: 'Feb', efficiency: 84, incidents: 1 },
      { month: 'Mar', efficiency: 83, incidents: 2 },
      { month: 'Apr', efficiency: 85, incidents: 1 },
      { month: 'May', efficiency: 86, incidents: 1 },
      { month: 'Jun', efficiency: 84, incidents: 2 },
    ]
  },
};
```

### Customizing Chart Appearance

#### Change Colors

```typescript
// In chart options
color: [
  '#2563eb',  // Blue
  '#10b981',  // Green
  '#f59e0b',  // Orange
  '#ef4444',  // Red
  '#8b5cf6',  // Purple
  '#ec4899',  // Pink
  '#14b8a6',  // Teal - Add your custom colors here
]
```

#### Modify Chart Height

```typescript
<ReactECharts 
  option={getChartOption()} 
  style={{ height: 700, width: '100%' }}  // Change height here
  className='bg-transparent rounded-lg p-4 cursor-pointer' 
/>
```

#### Adjust Chart Margins

```typescript
grid: { 
  left: 80,    // Increase for more left margin
  right: 80,   // Increase for more right margin
  bottom: 100, // Increase for more bottom margin
  top: 80      // Increase for more top margin
}
```

## API Integration

### Backend Requirements

Your backend API should provide the following endpoints:

#### 1. Get All Regional Metrics
```
GET /api/regional/metrics
Authorization: Bearer {token}

Response:
[
  {
    "region": "Headquarters",
    "assets": 245,
    "staff": 68,
    "projects": 12,
    "utilization": 87.5,
    "status": "active"
  },
  ...
]
```

#### 2. Get Specific Center Details
```
GET /api/regional/centers/{centerName}
Authorization: Bearer {token}

Response:
{
  "name": "Headquarters",
  "type": "headquarters",
  "status": "active",
  "address": "New Delhi, India",
  "manager": "Rajesh Kumar",
  "assets": {
    "total": 245,
    "drones": 65,
    "itComponents": 120,
    "equipment": 45,
    "vehicles": 15
  },
  "staff": {
    "total": 68,
    "technical": 35,
    "administrative": 20,
    "management": 13
  },
  "projects": {
    "active": 12,
    "completed": 45,
    "pending": 8
  },
  "utilization": 87.5,
  "performance": [
    {
      "month": "Jan",
      "efficiency": 85,
      "incidents": 2
    },
    ...
  ]
}
```

### Frontend Integration

#### Step 1: Update API Endpoints Configuration

```typescript
// In /src/config/index.ts
export const API_ENDPOINTS = {
  // ... existing endpoints
  REGIONAL_METRICS: '/api/regional/metrics',
  REGIONAL_CENTER: (name: string) => `/api/regional/centers/${name}`,
};
```

#### Step 2: Use the Custom Hook

```typescript
// In your component
import { useRegionalData } from '@/hooks/useRegionalData';
import { useAuth } from '@/context/AuthContext';

function MyRegionalComponent() {
  const { token } = useAuth();
  const { 
    regionalData, 
    loading, 
    error, 
    summary,
    refetch 
  } = useRegionalData({ token });

  // Use the data in your component
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {regionalData.map(center => (
        <div key={center.region}>
          {center.region}: {center.assets} assets
        </div>
      ))}
    </div>
  );
}
```

#### Step 3: Replace Static Data

In `RegionalChart.tsx`, replace the static `regionalData` array:

```typescript
// Old (static data)
const regionalData: RegionalData[] = [
  { region: 'Headquarters', assets: 245, ... },
  ...
];

// New (dynamic data)
const { token } = useAuth();
const { regionalData, loading } = useRegionalData({ token });

if (loading) return <LoadingSpinner />;

// Use regionalData in your charts
```

## Advanced Customization

### Adding New Metrics

#### 1. Update the Interface

```typescript
interface RegionalData {
  region: string;
  assets: number;
  staff: number;
  projects: number;
  utilization: number;
  status: 'active' | 'maintenance' | 'inactive';
  // Add new metrics
  revenue: number;
  satisfaction: number;
}
```

#### 2. Update Chart Options

```typescript
const getOverviewChartOption = () => ({
  radar: {
    indicator: [
      { name: 'Assets', max: 250 },
      { name: 'Staff', max: 70 },
      { name: 'Projects', max: 15 },
      { name: 'Utilization %', max: 100 },
      // Add new indicators
      { name: 'Revenue (M)', max: 50 },
      { name: 'Satisfaction %', max: 100 },
    ],
    // ... rest of config
  },
  series: [{
    data: sortedData.map(region => ({
      value: [
        region.assets, 
        region.staff, 
        region.projects, 
        region.utilization,
        // Add new values
        region.revenue,
        region.satisfaction
      ],
      name: region.region,
    })),
  }]
});
```

### Custom Export Formats

#### Excel Export

```typescript
import * as XLSX from 'xlsx';

const exportToExcel = (data: RegionalMetrics[]) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Regional Data');
  XLSX.writeFile(wb, `regional_analytics_${new Date().toISOString()}.xlsx`);
};
```

#### PDF Export

```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportToPDF = (data: RegionalMetrics[]) => {
  const doc = new jsPDF();
  doc.text('Regional Analytics Report', 14, 15);
  
  doc.autoTable({
    head: [['Region', 'Assets', 'Staff', 'Projects', 'Utilization']],
    body: data.map(d => [
      d.region, 
      d.assets, 
      d.staff, 
      d.projects, 
      `${d.utilization}%`
    ]),
  });
  
  doc.save(`regional_analytics_${new Date().toISOString()}.pdf`);
};
```

## Performance Optimization

### 1. Memoize Chart Options

```typescript
const chartOption = useMemo(
  () => getChartOption(currentData),
  [currentData, isDark, textColor]
);
```

### 2. Debounce Chart Updates

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdate = useDebouncedCallback(
  (newData) => {
    setChartData(newData);
  },
  300
);
```

### 3. Lazy Load Charts

```typescript
import dynamic from 'next/dynamic';

const RegionalChart = dynamic(
  () => import('@/components/RegionalChart'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false // Disable server-side rendering for charts
  }
);
```

## Testing

### Unit Tests

```typescript
// In /src/components/__tests__/RegionalChart.test.tsx
import { render, screen } from '@testing-library/react';
import RegionalChart from '../RegionalChart';

describe('RegionalChart', () => {
  it('renders without crashing', () => {
    render(<RegionalChart />);
    expect(screen.getByText('Regional Center Performance')).toBeInTheDocument();
  });

  it('displays all chart types', () => {
    render(<RegionalChart />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Staff')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// Test API integration
import { renderHook, waitFor } from '@testing-library/react';
import { useRegionalData } from '../useRegionalData';

describe('useRegionalData', () => {
  it('fetches regional data successfully', async () => {
    const { result } = renderHook(() => 
      useRegionalData({ token: 'test-token' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.regionalData).toHaveLength(6);
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Charts Not Displaying

**Problem:** Charts appear blank or don't render.

**Solutions:**
- Verify ECharts is installed: `bun pm ls echarts echarts-for-react`
- Check that data structure matches expected format
- Ensure theme context is available
- Check browser console for errors

#### 2. Dark Mode Not Working

**Problem:** Charts don't adapt to dark mode.

**Solutions:**
- Verify ThemeContext is properly imported
- Check that `actualTheme` is being read correctly
- Ensure text colors are defined for both themes

#### 3. Click Events Not Working

**Problem:** Clicking chart elements doesn't navigate.

**Solutions:**
- Verify router is imported from `next/navigation` not `next/router`
- Check that location page exists
- Ensure click handler is properly defined in `onEvents`

#### 4. Export Failing

**Problem:** CSV export doesn't download.

**Solutions:**
- Check browser download settings
- Verify data format is correct
- Ensure Blob API is supported

## Best Practices

1. **Data Validation**: Always validate data before passing to charts
2. **Error Boundaries**: Wrap charts in error boundaries
3. **Loading States**: Show loading indicators during data fetch
4. **Accessibility**: Add aria-labels to chart containers
5. **Responsive Design**: Test on multiple screen sizes
6. **Performance**: Memoize expensive calculations
7. **Documentation**: Keep API documentation updated

## Next Steps

1. Connect to real backend API
2. Add real-time data updates
3. Implement advanced filters
4. Add custom date ranges
5. Create scheduled reports
6. Add KPI alerts
7. Implement comparative analysis

## Support

For questions or issues:
- Review component documentation
- Check ECharts documentation: https://echarts.apache.org/
- Review Next.js documentation: https://nextjs.org/docs
- Contact development team
