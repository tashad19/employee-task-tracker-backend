# Employee Task Tracker - Design Guidelines

## Design Approach
**Design System**: Material Design + Linear-inspired productivity aesthetic  
**Rationale**: Internal productivity tool requiring clarity, efficiency, and information density. Focus on usability over visual flair.

## Core Design Principles
1. **Clarity First**: Clean information hierarchy, scannable data displays
2. **Efficiency**: Quick task updates, minimal clicks for common actions
3. **Role Adaptation**: UI adapts based on Admin vs Regular User permissions
4. **Data Density**: Comfortable information display without overwhelming users

---

## Layout System

### Structure
- **Sidebar Navigation** (240px fixed width): Logo, main nav items (Dashboard, Tasks, Employees, Profile), role indicator
- **Main Content Area**: Full remaining width, max-w-7xl container with breathing room
- **Spacing Scale**: Use Tailwind units of 2, 4, 6, and 8 consistently (p-4, gap-6, m-8)

### Dashboard Layout
- Top metrics row: 3-4 stat cards displaying total tasks, completion %, pending count
- Task status breakdown: Pie/donut chart or progress bars
- Recent tasks table: Compact, scrollable list
- Quick actions panel for Admins

---

## Typography

**Primary Font**: Inter (via Google Fonts CDN)  
**Secondary Font**: System UI stack for data tables

### Hierarchy
- **Page Titles**: text-2xl font-semibold (Dashboard, Tasks, Employees)
- **Section Headers**: text-lg font-medium
- **Card Titles**: text-base font-medium
- **Body Text**: text-sm regular
- **Table Data**: text-sm regular, monospace for IDs
- **Metrics**: text-3xl font-bold for numbers, text-xs text-gray-500 for labels

---

## Component Library

### Navigation Sidebar
- Dark background with light text
- Active state: subtle background highlight
- Icon + label for each nav item (use Heroicons)
- User profile section at bottom with role badge

### Dashboard Cards
- White background, subtle border
- Icon in top-left (colorful accent)
- Large metric number centered
- Label below in muted text
- 4px border-radius, subtle shadow on hover

### Task Table
- Alternating row backgrounds for scannability
- Columns: Task Title, Assigned To, Status, Due Date, Actions
- Status badges: Pill-shaped with color coding (subtle, not bright)
  - Pending: gray
  - In Progress: blue
  - Completed: green
- Inline action buttons (edit/delete icons) visible on row hover

### Employee Cards/Table
- Grid layout (3 columns on desktop): Employee card with avatar placeholder, name, role, email
- Or table format: Name, Role, Email, Task Count, Actions
- Click to view assigned tasks

### Forms & Modals
- Modal overlay: Semi-transparent dark background
- Modal content: White, centered, max-w-md, 8px border-radius
- Form inputs: Border style, focus ring in accent color
- Submit buttons: Primary action prominent, cancel secondary
- Labels above inputs, helper text below

### Status Filters
- Horizontal pill buttons: All, Pending, In Progress, Completed
- Active state: filled background
- Inactive state: outline style

### Authentication UI
- Centered login card on blank background
- Logo at top
- Simple form: Email, Password, Submit
- Role selection dropdown for registration (Admin/Regular User)
- "Remember me" checkbox

### Dashboard Widgets
- Task completion chart: Simple bar or line chart
- Task distribution by employee: Horizontal bar chart
- Quick stats: Icon + number + percentage change

---

## Interactions & States

### Button States
- **Primary**: Solid background, white text, subtle shadow
- **Hover**: Slightly darker, lift effect (shadow increase)
- **Active**: Scale down slightly (transform: scale(0.98))
- **Disabled**: Reduced opacity, cursor not-allowed

### Loading States
- Skeleton loaders for tables (gray animated bars)
- Spinner for form submissions
- Disable buttons during async operations

### Empty States
- Icon + "No tasks found" message for empty tables
- "Get started" CTA for new users

---

## Role-Based UI Adaptations

### Admin View
- Full access to all sections
- Create/Edit/Delete buttons visible throughout
- "Add Employee" and "Add Task" prominent CTAs
- Can see all tasks and all employees

### Regular User View
- Dashboard shows only assigned tasks
- No employee management section
- No create/edit/delete actions
- "My Tasks" section instead of "All Tasks"
- Filter limited to own tasks

---

## Accessibility
- ARIA labels for icon-only buttons
- Keyboard navigation for all interactive elements
- Focus indicators visible on all form inputs
- Color contrast meeting WCAG AA standards
- Screen reader announcements for status changes

---

## Icons
**Library**: Heroicons (via CDN)  
**Usage**:
- Dashboard icon for Dashboard nav
- Checklist icon for Tasks
- Users icon for Employees  
- User circle for Profile
- Plus icon for Add actions
- Pencil for Edit
- Trash for Delete
- Filter icon for filtering controls

---

## Images
**No hero images** - This is a productivity application, not a marketing site.  

**Avatar Placeholders**: Use initials in colored circles for employee avatars (generate color from name hash)

---

## Performance Notes
- Lazy load task table rows if >100 tasks
- Debounce filter/search inputs
- Cache dashboard metrics for 30 seconds
- Optimistic UI updates for status changes (update immediately, sync in background)