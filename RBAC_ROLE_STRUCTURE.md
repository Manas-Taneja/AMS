# RBAC Role Structure & Access Hierarchy

## Visual Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                            ADMIN                                 │
│                    (Full System Access)                          │
│          ✓ All Segments  ✓ All Centers  ✓ All Data             │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                       HQ MANAGER                                 │
│                    (All India Access)                            │
│     ✓ PSSL Centers  ✓ IIDT Centers  ✓ Prakhar Centers          │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────┴─────────┐  ┌──────┴────────┐  ┌───────┴────────┐
│ PSSL Segment Mgr │  │ IIDT Seg. Mgr │  │ Prakhar Seg Mgr│
│  (PSSL Only)     │  │  (IIDT Only)  │  │ (Prakhar Only) │
├──────────────────┤  ├───────────────┤  ├────────────────┤
│ ✓ PSSL HQ        │  │ ✓ IIDT RC     │  │ ✓ Prakhar TC   │
│ ✓ Mumbai Branch  │  │ ✓ Chennai     │  │ ✓ Maintenance  │
│ ✓ Data Center    │  │ ✓ Dehradun    │  │                │
└──────┬───────────┘  └───────┬───────┘  └────────┬───────┘
       │                      │                    │
  ┌────┼────┬────┐      ┌────┼────┬────┐     ┌───┴────┐
  │    │    │    │      │    │    │    │     │        │
┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐  ┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐ ┌─┴─┐   ┌─┴─┐
│HQ ││Mum││DC ││...│  │RC ││Che││Deh││...│ │TC │   │MH │
│Mgr││Mgr││Mgr││   │  │Mgr││Mgr││Mgr││   │ │Mgr│   │Mgr│
└───┘└───┘└───┘└───┘  └───┘└───┘└───┘└───┘ └───┘   └───┘
  Center Managers         Center Managers      Center Managers
  (Single Location)       (Single Location)    (Single Location)
```

---

## Access Matrix by Role

### Admin
```
┌──────────────────────────────────────────────────────┐
│ ADMIN                                                 │
├──────────────────────────────────────────────────────┤
│ Scope:      All Segments, All Centers               │
│ Access:     Full CRUD everywhere                     │
│ View:       Everything                               │
│ Manage:     Everything                               │
├──────────────────────────────────────────────────────┤
│ PSSL:       ✓ HQ  ✓ Mumbai  ✓ Data Center          │
│ IIDT:       ✓ RC  ✓ Chennai  ✓ Dehradun           │
│ PRAKHAR:    ✓ TC  ✓ Maintenance Hub                │
├──────────────────────────────────────────────────────┤
│ Can:                                                 │
│  • Create/edit/delete any resource                   │
│  • Manage all users and roles                        │
│  • Access all segments and centers                   │
│  • View system-wide analytics                        │
└──────────────────────────────────────────────────────┘
```

### HQ Manager (Headquarters / All India)
```
┌──────────────────────────────────────────────────────┐
│ HQ MANAGER                                           │
├──────────────────────────────────────────────────────┤
│ Scope:      All Segments, All Centers               │
│ Access:     Read All, Manage Most                    │
│ View:       Everything                               │
│ Manage:     Most resources (not system settings)     │
├──────────────────────────────────────────────────────┤
│ PSSL:       ✓ HQ  ✓ Mumbai  ✓ Data Center          │
│ IIDT:       ✓ RC  ✓ Chennai  ✓ Dehradun           │
│ PRAKHAR:    ✓ TC  ✓ Maintenance Hub                │
├──────────────────────────────────────────────────────┤
│ Can:                                                 │
│  • View all segments and centers                     │
│  • Manage resources across segments                  │
│  • Approve requests from any center                  │
│  • View all-India analytics and reports              │
│  • Create resources in any segment                   │
│                                                      │
│ Cannot:                                              │
│  • Delete segments or major system config            │
│  • Manage admin accounts                             │
└──────────────────────────────────────────────────────┘
```

### Segment Manager (e.g., PSSL Division Head)
```
┌──────────────────────────────────────────────────────┐
│ SEGMENT MANAGER - PSSL                               │
├──────────────────────────────────────────────────────┤
│ Scope:      PSSL Segment Only                        │
│ Access:     Full within segment                      │
│ View:       All PSSL centers                         │
│ Manage:     All PSSL resources                       │
├──────────────────────────────────────────────────────┤
│ PSSL:       ✓ HQ  ✓ Mumbai  ✓ Data Center          │
│ IIDT:       ✗ (Cannot see)                          │
│ PRAKHAR:    ✗ (Cannot see)                          │
├──────────────────────────────────────────────────────┤
│ Can:                                                 │
│  • View all PSSL centers and their data              │
│  • Manage staff across all PSSL centers              │
│  • Create/edit components at any PSSL center         │
│  • Approve bills from any PSSL center                │
│  • View PSSL-wide analytics                          │
│  • Manage center managers within PSSL                │
│                                                      │
│ Cannot:                                              │
│  • See IIDT or Prakhar data                          │
│  • Access other segments' resources                  │
│  • Manage users outside PSSL                         │
└──────────────────────────────────────────────────────┘
```

### Center Manager (e.g., Mumbai Branch Manager)
```
┌──────────────────────────────────────────────────────┐
│ CENTER MANAGER - Mumbai (PSSL)                       │
├──────────────────────────────────────────────────────┤
│ Scope:      Mumbai Center Only                       │
│ Access:     Full within center                       │
│ View:       Mumbai only                              │
│ Manage:     Mumbai resources                         │
├──────────────────────────────────────────────────────┤
│ PSSL:       ✗ HQ  ✓ Mumbai  ✗ Data Center          │
│ IIDT:       ✗ (Cannot see)                          │
│ PRAKHAR:    ✗ (Cannot see)                          │
├──────────────────────────────────────────────────────┤
│ Can:                                                 │
│  • View all Mumbai center data                       │
│  • Manage staff at Mumbai                            │
│  • Create/edit components at Mumbai                  │
│  • Approve bills for Mumbai                          │
│  • View Mumbai-specific analytics                    │
│  • Manage regular users at Mumbai                    │
│                                                      │
│ Cannot:                                              │
│  • See other PSSL centers (HQ, Data Center)          │
│  • Access IIDT or Prakhar data                       │
│  • Manage resources outside Mumbai                   │
│  • View segment-wide or all-India data               │
└──────────────────────────────────────────────────────┘
```

### User (Regular Staff)
```
┌──────────────────────────────────────────────────────┐
│ USER (Regular Staff)                                 │
├──────────────────────────────────────────────────────┤
│ Scope:      Limited based on assignment              │
│ Access:     Read mostly, limited updates             │
│ View:       Their location and assigned resources    │
│ Manage:     Own records only                         │
├──────────────────────────────────────────────────────┤
│ Can:                                                 │
│  • View resources at their location                  │
│  • Update their own profile                          │
│  • Submit bills (pending approval)                   │
│  • View training programs                            │
│  • Access read-only data                             │
│                                                      │
│ Cannot:                                              │
│  • Create or delete resources                        │
│  • Approve bills or requests                         │
│  • Manage other users                                │
│  • Access data from other locations                  │
└──────────────────────────────────────────────────────┘
```

---

## Data Flow & Access Examples

### Example 1: Viewing Locations

```
User Role          | Query: SELECT * FROM locations        | Results
─────────────────────────────────────────────────────────────────────
Admin              | No filter                            | ALL locations (8)
HQ Manager         | No filter                            | ALL locations (8)
PSSL Segment Mgr   | WHERE segment_code = 'PSSL'         | PSSL locations (3)
Mumbai Center Mgr  | WHERE id = 4                        | Mumbai only (1)
User               | Limited based on assignment          | May see 0-1
```

### Example 2: Viewing Staff

```
User Role          | Query: SELECT * FROM staff            | Results
─────────────────────────────────────────────────────────────────────
Admin              | No filter                            | ALL staff (10)
HQ Manager         | No filter                            | ALL staff (10)
PSSL Segment Mgr   | WHERE segment_code = 'PSSL'         | PSSL staff (3)
Mumbai Center Mgr  | WHERE location_id = 4               | Mumbai staff (1)
User               | Limited                              | May see 0-2
```

### Example 3: Creating a Component

```
User Role          | Action: Insert drone at Mumbai       | Result
─────────────────────────────────────────────────────────────────────
Admin              | ✓ Allowed                            | Success
HQ Manager         | ✓ Allowed                            | Success
PSSL Segment Mgr   | ✓ Allowed (Mumbai is PSSL)          | Success
IIDT Segment Mgr   | ✗ Blocked (Mumbai is not IIDT)      | Error
Mumbai Center Mgr  | ✓ Allowed                            | Success
Chennai Center Mgr | ✗ Blocked (not their center)        | Error
User               | ✗ Blocked (no permission)           | Error
```

### Example 4: Approving a Bill

```
User Role          | Action: Approve bill from Chennai    | Result
─────────────────────────────────────────────────────────────────────
Admin              | ✓ Allowed                            | Success
HQ Manager         | ✓ Allowed                            | Success
IIDT Segment Mgr   | ✓ Allowed (Chennai is IIDT)         | Success
PSSL Segment Mgr   | ✗ Blocked (Chennai is not PSSL)     | Error
Chennai Center Mgr | ✓ Allowed                            | Success
Mumbai Center Mgr  | ✗ Blocked (not their center)        | Error
User               | ✗ Blocked (no permission)           | Error
```

---

## Segment & Center Mapping

### PSSL Segment
```
PSSL (Prakhar Softwares Systems Limited)
│
├─ 🏢 PSSL Headquarters
│   Location ID: 1
│   Manager: Dr. Rajesh Kumar
│   Team: 25
│   Type: headquarters
│
├─ 🏢 PSSL Branch Office - Mumbai
│   Location ID: 4
│   Manager: Ms. Sneha Patel
│   Team: 15
│   Type: branch
│
└─ 🏢 PSSL Data Center
    Location ID: 7
    Manager: Mr. Arjun Mehta
    Team: 6
    Type: branch
```

### IIDT Segment
```
IIDT (Indian Institute of Drone Technology)
│
├─ 🏢 IIDT Research Center
│   Location ID: 2
│   Manager: Prof. Priya Sharma
│   Team: 18
│   Type: headquarters
│
├─ 🏢 IIDT Satellite Office - Chennai
│   Location ID: 5
│   Manager: Mr. Karthik Reddy
│   Team: 8
│   Type: satellite
│
└─ 🏢 IIDT Field Station - Dehradun
    Location ID: 8
    Manager: Dr. Meera Joshi
    Team: 5
    Type: field_station
```

### PRAKHAR Segment
```
PRAKHAR (Prakhar Aviation Services)
│
├─ 🏢 Prakhar Aviation Training Center
│   Location ID: 3
│   Manager: Capt. Amit Singh
│   Team: 12
│   Type: headquarters
│
└─ 🏢 Prakhar Aviation Maintenance Hub
    Location ID: 6
    Manager: Mr. Deepak Verma
    Team: 10
    Type: branch
```

---

## Role Assignment Examples

### Scenario 1: National Operations Team
```
Person: Mr. Amit Verma
Position: Director of Operations
Role: hq_manager
Access Level: headquarters
Segment: NULL (all segments)
Center: NULL (all centers)

Can see:
  ✓ All PSSL centers (3)
  ✓ All IIDT centers (3)
  ✓ All Prakhar centers (2)
  ✓ Total: 8 locations
  ✓ All staff, components, training across India
```

### Scenario 2: PSSL Division Head
```
Person: Dr. Rajesh Kumar
Position: PSSL Division Head
Role: segment_manager
Access Level: segment
Segment: PSSL
Center: NULL (all PSSL centers)

Can see:
  ✓ PSSL Headquarters (id=1)
  ✓ PSSL Mumbai Branch (id=4)
  ✓ PSSL Data Center (id=7)
  ✗ Cannot see IIDT or Prakhar centers
  ✓ All PSSL staff, components, training
```

### Scenario 3: Mumbai Branch Manager
```
Person: Ms. Sneha Patel
Position: Mumbai Branch Manager
Role: center_manager
Access Level: center
Segment: PSSL
Center: 4 (Mumbai)

Can see:
  ✓ Mumbai Branch only (id=4)
  ✗ Cannot see other PSSL centers (HQ, Data Center)
  ✗ Cannot see IIDT or Prakhar centers
  ✓ Only Mumbai staff, components, training
```

### Scenario 4: IIDT Research Director
```
Person: Prof. Priya Sharma
Position: IIDT Research Director
Role: segment_manager
Access Level: segment
Segment: IIDT
Center: NULL (all IIDT centers)

Can see:
  ✓ IIDT Research Center (id=2)
  ✓ IIDT Chennai Satellite (id=5)
  ✓ IIDT Dehradun Field Station (id=8)
  ✗ Cannot see PSSL or Prakhar centers
  ✓ All IIDT staff, components, training
```

### Scenario 5: Regular Engineer
```
Person: Anurag Upadhyay
Position: Project Associate (Drone)
Role: user
Access Level: center
Segment: PSSL
Center: 1 (PSSL HQ)

Can see:
  ✓ Limited view of PSSL HQ data
  ✗ Cannot see other centers
  ✗ Cannot manage resources
  ✓ Can view training, submit bills
```

---

## Permission Matrix

| Action | Admin | HQ Mgr | Seg Mgr | Ctr Mgr | User |
|--------|-------|--------|---------|---------|------|
| **Locations** |
| View all | ✓ | ✓ | Segment | Center | Limited |
| Create | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Staff** |
| View all | ✓ | ✓ | Segment | Center | Limited |
| Create | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Components** |
| View all | ✓ | ✓ | Segment | Center | Limited |
| Create | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Training** |
| View all | ✓ | ✓ | Segment | Center | ✓ |
| Create | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Bills** |
| View own | ✓ | ✓ | ✓ | ✓ | ✓ |
| View all | ✓ | ✓ | Segment | Center | ✗ |
| Submit | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete | ✓ | ✓ | Scope | Scope | ✗ |
| **Projects** |
| View all | ✓ | ✓ | Segment | Limited | Limited |
| Create | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Users** |
| View all | ✓ | ✓ | Segment | Center | ✗ |
| Create | ✓ | ✗ | ✗ | ✗ | ✗ |
| Edit roles | ✓ | ✗ | ✗ | ✗ | ✗ |
| Delete | ✓ | ✗ | ✗ | ✗ | ✗ |

Legend:
- ✓ = Full access
- Segment = Access within their segment only
- Center = Access within their center only
- Scope = Access within their scope (segment or center)
- Limited = Restricted view/access
- ✗ = No access

---

## Promotion Paths

```
Pending User → User → Center Manager → Segment Manager → HQ Manager → Admin
   (New)      (Staff)  (Single Loc)    (All Locs in    (All India)  (System)
                                         Segment)
```

### Example Promotion: User to Center Manager
```sql
UPDATE profiles 
SET 
  role = 'center_manager',
  access_level = 'center',
  center_id = 4  -- Assign to Mumbai
WHERE email = 'user@example.com';
```

### Example Promotion: Center Manager to Segment Manager
```sql
UPDATE profiles 
SET 
  role = 'segment_manager',
  access_level = 'segment',
  center_id = NULL  -- Remove center restriction
WHERE email = 'mumbai.manager@pssl.com';
```

---

## Use Case Examples

### Use Case 1: All-India Report
**Who**: HQ Manager  
**Query**: Get staff count by segment
```sql
SELECT 
  segment_code, 
  COUNT(*) as staff_count 
FROM staff 
GROUP BY segment_code;

Result:
  PSSL: 3 staff
  IIDT: 3 staff
  PRAKHAR: 2 staff
```

### Use Case 2: PSSL Performance Review
**Who**: PSSL Segment Manager  
**Query**: Get all PSSL locations with staff count
```sql
SELECT 
  l.name, 
  l.team, 
  COUNT(s.id) as actual_staff
FROM locations l
LEFT JOIN staff s ON l.id = s.location_id
WHERE l.segment_code = 'PSSL'
GROUP BY l.id, l.name, l.team;

Result:
  PSSL HQ: 1 staff
  Mumbai Branch: 1 staff
  Data Center: 1 staff
```

### Use Case 3: Mumbai Daily Operations
**Who**: Mumbai Center Manager  
**Query**: Get Mumbai resources
```sql
-- Staff at Mumbai
SELECT * FROM staff WHERE location_id = 4;

-- Components at Mumbai
SELECT * FROM components WHERE location_id = 4;

-- Bills for Mumbai
SELECT * FROM bills WHERE location_id = 4;

Result: Only Mumbai data visible
```

---

This role structure ensures that each manager level sees exactly what they need - no more, no less - while maintaining security and data isolation between segments and centers.
