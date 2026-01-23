# Asset Transfer Feature Documentation

## Overview
The Asset Transfer Feature allows you to track when assets (items/components) are temporarily borrowed or transferred from their home location to another center or location. This provides complete visibility into asset movements across your organization.

## Key Features

### 1. **Transfer Tracking**
- Track when an asset is moved from its home location to another center
- Record expected return dates
- Add notes and reasons for transfers
- Maintain complete audit trail of all transfers

### 2. **Visual Indicators**
- **Orange Badge**: Transferred assets are marked with an orange "Transferred" badge
- **Orange Location Icon**: Location pins turn orange for transferred assets
- **Dual Location Display**: Shows both current location and home location
- **Alert Card**: Detail pages show prominent transfer status alerts

### 3. **Filtering & Search**
- Filter items by transfer status:
  - 🔄 Transferred Only
  - 📍 At Home Location
  - All Items
- Search includes both home and current locations

## Database Schema

### New Fields Added to `components` Table
- `home_location`: Original/permanent location of the asset
- `current_location`: Current physical location of the asset
- `is_transferred`: Boolean flag indicating if asset is transferred
- `transferred_to`: Location name where asset is transferred
- `transfer_date`: When the transfer occurred
- `expected_return_date`: Expected date for asset return
- `transfer_notes`: Additional notes about the transfer
- `transfer_approved_by`: User who approved the transfer

### New `component_transfers` Table
Maintains complete audit trail with:
- Transfer history for each asset
- From/To locations
- Transfer dates and return dates
- Transfer status (active, completed, cancelled)
- Initiator and approver information
- Transfer reasons and notes

## How to Use

### 1. **Transferring an Asset**

#### From Items List Page:
1. Navigate to the Items page
2. Click on an item to open its detail page
3. Click the "Transfer Asset" button (top right of Component Details card)
4. In the dialog:
   - Select destination location
   - Set expected return date (optional)
   - Add transfer reason
   - Add any additional notes
5. Click "Transfer Asset"

#### Transfer Information Required:
- **Destination Location*** (required)
- Expected Return Date (optional)
- Reason for Transfer (optional)
- Additional Notes (optional)

### 2. **Returning an Asset**

#### From Detail Page:
1. Open the transferred asset's detail page
2. You'll see an orange alert card at the top showing transfer status
3. Click "Return Asset" button
4. Add return notes (optional)
5. Confirm the return

The asset will automatically return to its home location.

### 3. **Viewing Transferred Assets**

#### Items List Page:
- Look for the orange "Transferred" badge on item cards
- Filter using "Transfer Status" dropdown:
  - Select "🔄 Transferred Only" to see only borrowed items
  - Select "📍 At Home Location" to see items at their home
- Transferred items show:
  - Current location with orange icon
  - "Home: [location]" text below current location

#### Detail Page:
- Orange alert card at top shows full transfer details:
  - From and To locations
  - Transfer date
  - Expected return date
  - Transfer notes

## API Endpoints (Backend Integration Required)

### Transfer an Asset
```
POST /api/components/{id}/transfer
```
**Body:**
```json
{
  "to_location": "Location Name",
  "expected_return_date": "2024-12-31",
  "transfer_reason": "Project requirement",
  "notes": "Needed for training session"
}
```

### Return an Asset
```
POST /api/components/{id}/return
```
**Body:**
```json
{
  "notes": "Asset returned in good condition"
}
```

### Get Transfer History
```
GET /api/components/{id}/transfers
```

## Database Migration

Run the SQL migration script to add transfer functionality:

```bash
psql -U postgres -d your_database -f supabase/03_asset_transfer_feature.sql
```

Or apply through Supabase Dashboard:
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `03_asset_transfer_feature.sql`
3. Execute the SQL

## Visual Design

### Color Coding
- **Orange (#f97316)**: Indicates transferred status
  - Badges: Orange background with white text
  - Icons: Orange colored location pins
  - Alert cards: Orange-tinted background

### Badge Styles
- Status badges remain with their original colors (green for Active, etc.)
- Transfer badge is always orange and appears alongside status badge
- Uses Lucide React icons: `LuArrowRightLeft` for transfers

## Business Rules

1. **Transfer Restrictions:**
   - Cannot transfer to the same location (filtered out in dropdown)
   - Managers and above can initiate transfers
   - All staff can view transfer status

2. **Return Process:**
   - Asset automatically returns to `home_location`
   - Transfer record is marked as 'completed'
   - `is_transferred` flag is set to false

3. **Location Tracking:**
   - `home_location`: Never changes (permanent assignment)
   - `current_location`: Updates when transferred
   - Legacy `location` field: Migrated to `home_location`

## Benefits

1. **Complete Visibility**: Know exactly where each asset is at all times
2. **Audit Trail**: Full history of all asset movements
3. **Planning**: Track expected return dates for better resource planning
4. **Accountability**: Record who initiated and approved transfers
5. **Quick Filtering**: Easily find all transferred assets across locations

## Future Enhancements

Potential additions:
- Transfer approval workflow
- Automatic notifications for overdue returns
- Transfer requests system
- Bulk transfer operations
- Transfer analytics and reporting
- QR code scanning for transfers
- Mobile app for quick transfer logging

## Support

For issues or questions about the transfer feature:
1. Check transfer history in the component_transfers table
2. Verify the asset's current_location and home_location fields
3. Review transfer_notes for context
4. Check the audit trail for transfer approvals

## Technical Notes

### Database Functions

**`initiate_component_transfer()`**
- Creates transfer record
- Updates component status
- Returns transfer ID

**`return_component_from_transfer()`**
- Completes transfer record
- Resets component to home location
- Updates timestamps

### Indexes
Performance indexes added for:
- `is_transferred` flag
- `current_location` field
- Transfer status
- Component ID in transfers table

### Permissions
- All authenticated users: View transfers
- Staff and above: Initiate transfers
- Managers and above: Approve transfers
- Admins only: Delete transfer records
