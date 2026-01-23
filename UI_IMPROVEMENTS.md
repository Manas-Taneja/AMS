# UI/UX Improvement Plan for AMS

As a senior frontend engineer, I've analyzed the current codebase and identified several key areas to elevate the user experience to an Enterprise Standard.

## 1. High-Impact Quick Wins (Already Implemented)
*   **Asset Transfer Dialog**: Updated to use direct Supabase RPC calls for reliability.
*   **Sidebar Navigation**: Completely redesigned `AppSidebar` to include:
    *   **User Profile Section**: Bottom-anchored profile with Avatar, Name, Role, and Dropdown menu (Profile, Settings, Logout).
    *   **Active State Handling**: Better visual feedback for the current page.
    *   **Collapsible State**: Better handling of the "icon-only" mode.
    *   **Branding**: Added a proper "AMS Enterprise" logo area.

## 2. Recommended UI Enhancements

### A. Dashboard Maturity
*   **Widget Grid System**: Move away from static cards to a grid layout system (e.g., `react-grid-layout`) allowing users to resize/move widgets.
*   **Real "Idle Assets" Widget**: Convert the toast notification into a permanent dashboard card showing "Top 5 Idle Assets" with action buttons (Return, Transfer).
*   **Activity Feed**: Add a "Recent Activity" timeline widget showing:
    *   "John transferred Drone X to HQ"
    *   "Maintenance completed on Sensor Y"

### B. Data Grids (Items, Bills, Staff)
The current `tanstack-table` implementation is functional but basic.
*   **Bulk Actions Bar**: When rows are selected, show a floating bar at the bottom:
    *   `[Transfer Selected] [Delete Selected] [Export Selected]`
*   **Density Toggle**: Allow users to switch between "Compact" (high density) and "Comfortable" (standard) row heights.
*   **Column Visibility**: A dropdown to hide/show specific columns.
*   **Advanced Filtering**: Slide-out panel for complex filters (e.g., `Purchase Date > 2023 AND Cost > $500`).

### C. Visual Language & Theme
*   **Consistent Status Colors**:
    *   **Active/Approved**: Emerald/Green
    *   **Pending/Maintenance**: Amber/Orange
    *   **Error/Rejected**: Rose/Red
    *   **Idle**: Slate/Gray
*   **Empty States**: Improve empty states with illustrations and clear "Call to Action" buttons (e.g., "No Bills Found. Upload your first bill now.").

### D. Mobile Responsiveness
*   **Sheet-based Forms**: On mobile, open "Add Item" or "Transfer" forms in a bottom sheet instead of a center modal for better reachability.
*   **Stacked Tables**: Convert table rows to "Cards" on mobile screens automatically.

## 3. Specific Feature UIs to Build

### A. Asset Lifecycle Timeline
Create a new component `AssetTimeline` for the Item Detail page:
*   Vertical line connecting events.
*   Icons for different event types (Transfer, Maintenance, Purchase).
*   User avatars next to each event.

### B. Maintenance Scheduler
A Calendar view (`react-big-calendar` or similar) to visualize upcoming maintenance tasks across all assets.

### C. QR Code Generator
Add a "Print Label" button to the Item Detail page that generates a PDF with:
*   QR Code (containing Asset ID URL).
*   Asset Name & ID.
*   Company Logo.

## 4. Accessibility (a11y)
*   Ensure all form inputs have associated labels.
*   Ensure color contrast ratios meet WCAG AA standards (especially light gray text on white backgrounds).
*   Add `aria-label` to all icon-only buttons.
