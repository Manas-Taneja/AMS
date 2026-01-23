# Quick Start: Asset Transfer Feature

## Visual Indicators at a Glance

### 🟠 Orange = Transferred
When you see orange badges, icons, or alerts, it means the asset is currently transferred to another location.

---

## How to Use (Step-by-Step)

### ✅ Transfer an Asset

1. Go to **Items** page
2. Click on any item to open details
3. Click **"Transfer Asset"** button (top right)
4. Fill in the form:
   - **Select destination location** (required)
   - Add expected return date (optional)
   - Add reason (optional)
   - Add notes (optional)
5. Click **"Transfer Asset"**

✨ The item will now show:
- 🟠 Orange "Transferred" badge
- 🟠 Orange location icon
- Current location + home location

---

### ✅ Return an Asset

1. Open a transferred asset's detail page
2. You'll see an **orange alert** at the top
3. Click **"Return Asset"** button
4. Add return notes (optional)
5. Click **"Return to Home"**

✨ The item will return to its home location and orange indicators will disappear.

---

### ✅ Find Transferred Assets

**Option 1: Use the Filter**
1. Go to Items page
2. Click **"Transfer Status"** dropdown
3. Select **"🔄 Transferred Only"**

**Option 2: Look for Orange Badges**
- Grid view: Orange badge on cards
- List view: Orange badge next to status

---

### ✅ View Transfer Details

On any item detail page:
- **If transferred**: Orange alert card shows:
  - From → To locations
  - Transfer date
  - Expected return date
  - Transfer notes

- **Dashboard**: See total count of transferred assets

---

## What the Colors Mean

| Color | Meaning |
|-------|---------|
| 🟠 Orange Badge | Asset is transferred |
| 🟠 Orange Icon | Current location (not home) |
| 🟢 Green (Active) | Asset status (separate from transfer) |
| 🟡 Yellow (Maintenance) | Asset status (separate from transfer) |

---

## Pro Tips

💡 **Search both locations**: Search includes both home and current location

💡 **Track returns**: Set expected return dates to keep track of when assets should come back

💡 **Add context**: Use notes field to explain why the transfer happened

💡 **Dashboard overview**: Check dashboard to see how many assets are currently transferred

💡 **Filter combinations**: Combine transfer filter with status, category, and owner filters

---

## Examples

### Example 1: Project Equipment
```
Scenario: Need a drone at Branch Office for a project

Steps:
1. Open drone detail page
2. Click "Transfer Asset"
3. Select "Branch Office"
4. Set return date: End of project
5. Reason: "Project XYZ aerial survey"
6. Transfer!

Result: Drone shows orange badge, current location = Branch Office
```

### Example 2: Training Equipment
```
Scenario: Return camera from training center

Steps:
1. Open camera detail page (shows orange alert)
2. Click "Return Asset" in the alert
3. Add note: "Training completed"
4. Confirm return

Result: Camera back at home location, no orange indicators
```

---

## Visual Examples

### Items List - Grid View
```
┌─────────────────────────┐
│ DJI Mavic 3 Pro        │
│ For aerial photography  │
│                         │
│ [Active] [Transferred] │  ← Orange badge
│ 🟠 Branch Office A      │  ← Orange icon
│    Home: Headquarters   │
└─────────────────────────┘
```

### Detail Page - Transferred Item
```
┌──────────────────────────────────────┐
│ 🟠 Asset Currently Transferred       │
│                                      │
│ From: Headquarters → To: Branch A    │
│ Transfer Date: Jan 20, 2024         │
│ Expected Return: Feb 1, 2024        │
│ Notes: Project XYZ requirement      │
│                        [Return Asset]│
└──────────────────────────────────────┘
```

---

## That's It!

The transfer feature is designed to be simple and visual. Look for 🟠 orange indicators to spot transferred assets instantly!

For detailed documentation, see `ASSET_TRANSFER_FEATURE.md`
For technical details, see `TRANSFER_IMPLEMENTATION_SUMMARY.md`
