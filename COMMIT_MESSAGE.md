feat: Enhance event system with realtime improvements, UI animations, and better error handling

## Major Features

### Event Management System

- Add fixed events system with pre-seeded events (Worship Service, Night of Power, Life Group, Youth Zone)
- Implement event activation/deactivation with database triggers ensuring only one active event
- Add event-specific images for each fixed event (ws.jpg, nop.jpg, lg.png, yz.png)
- Create events table with RLS policies for admin management and scanner access
- Add realtime support for events table to enable live updates when events are activated/deactivated
- Add deactivation confirmation dialog to prevent accidental deactivations

### Attendance Page Redesign

- Redesign attendance page with event card-based UI instead of direct table view
- Add EventCard component with event images, stats display, and navigation
- Add EventAttendanceCards component for grid layout of event cards with realtime sync
- Move activate/deactivate functionality from dedicated events page to attendance page
- Create dynamic route for event-specific attendance details (/admin/attendance/[eventId])
- Remove dedicated events management page and consolidate functionality
- Add pulse animation to active event cards for better visual feedback

### Scanner Improvements

- Add logout confirmation dialog to prevent accidental logouts
- Implement realtime subscription for events using Supabase realtime payloads directly
- Add automatic event fetching and display in scanner UI
- Show warning message when no active event is set
- Update scanner to use active event from database instead of hardcoded values
- Add dynamic gradient colors based on active event (blue for Worship Service, green for Life Group, purple for Night of Power, yellow for Youth Zone)
- Apply event-based gradients to scanner header, buttons, list overlay, and floating action button
- Add dynamic status indicator showing "Ready for next scan" or "Error" based on scanner state
- Fix redundant toast notifications by using Supabase realtime payloads directly
- Add toast notification when current event is deactivated

### Login Form Enhancements

- Increase button heights for better mobile usability (py-3 md:py-4)
- Convert "Back to Home" from text link to button with consistent styling
- Add reveal password toggle with eye icon (Eye/EyeOff from lucide-react)
- Improve spacing between form elements for better visual hierarchy
- Make all form elements (inputs, buttons) consistent height

### Database & Security

- Fix RLS policies for qr_attendance table to allow scanners to insert for all events
- Add comprehensive RLS policy fixes and diagnostic scripts
- Create database audit script to review table structure, policies, functions, and triggers
- Add scripts to identify and clean up duplicate policies
- Ensure proper role-based access control for all tables

## Technical Changes

### New Components

- components/EventCard.tsx - Reusable event card with image, stats, actions, and pulse animation
- components/EventAttendanceCards.tsx - Grid layout for event cards with state management and realtime sync
- components/ui/textarea.tsx - Textarea UI component
- components/LogoutConfirmDialog.tsx - Reusable logout confirmation dialog
- app/(admin)/admin/attendance/[eventId]/page.tsx - Dynamic route for event attendance details

### New Libraries

- lib/events.ts - Event management functions (getAllEvents, getActiveEvent, setActiveEvent, getEventStats)

### Database Migrations

- sql/events-table-setup.sql - Events table with triggers, RLS, and pre-seeded data
- sql/final-rls-fix.sql - Final RLS policy fixes for qr_attendance
- sql/database-audit.sql - Database structure audit script
- sql/find-duplicate-policies.sql - Script to identify duplicate RLS policies
- sql/cleanup-duplicate-policies.sql - Script to clean up duplicate policies
- sql/diagnose-rls-issue.sql - RLS troubleshooting diagnostic script
- sql/fix-scanner-user-role.sql - Script to fix scanner user roles

### Modified Components

- components/QRScanner.tsx:
  - Refactor realtime subscription to use Supabase payloads directly (no refs, no debouncing)
  - Add dynamic gradient colors based on active event
  - Apply gradients to header, buttons, list overlay, and FAB
  - Add dynamic status indicator (Ready/Error)
  - Fix redundant toast notifications
  - Add toast when event is deactivated
  - Handle both activation and deactivation events via realtime

- components/EventCard.tsx:
  - Add pulse animation to active badge with ping ring effect
  - Add pulsing ring around active card border
  - Enhance active card styling with blue border and shadow

- components/EventAttendanceCards.tsx:
  - Add deactivation confirmation dialog
  - Improve error handling with event existence verification
  - Add detailed error logging for debugging
  - Fix activation logic to work with database triggers
  - Use maybeSingle() instead of single() to handle edge cases

- components/LoginForm.tsx - UI improvements, password reveal toggle
- components/AttendanceManagement.tsx - Update to work with event-specific routes
- app/(admin)/admin/attendance/page.tsx - Redesign with event cards and activate/deactivate
- app/scanner/page.tsx - Fetch and pass active event to scanner component

### Removed Components

- app/(admin)/admin/events/page.tsx - Events management page (functionality moved to attendance page)
- components/EventsManagement.tsx - Events management component (consolidated into attendance page)
- components/EventFormDialog.tsx - Event form dialog (no longer needed for fixed events)

### Assets

- public/ws.jpg - Worship Service event image
- public/nop.jpg - Night of Power event image
- public/lg.png - Life Group event image
- public/yz.png - Youth Zone event image

## Bug Fixes

- Fix RLS policy violation when scanning for new events (Youth Zone)
- Fix duplicate event header display in attendance detail page
- Fix deactivate button not being clickable in event cards
- Fix redundant toast notifications when events are activated/deactivated
- Fix missing toast notifications by properly handling realtime events
- Fix activation not working when another event is already active
- Fix "Cannot coerce the result to a single JSON object" error by using maybeSingle()
- Fix scanner not updating when events are deactivated
- Ensure scanner user role is properly set for RLS policies
- Handle stale session issues with better error messages

## Database Schema Changes

- Add events table with id, name, description, is_active, timestamps
- Add trigger ensure_single_active_event to ensure only one event is active at a time
- Add member_id foreign key to qr_attendance table (from members-table-setup.sql)
- Enable realtime replication for events table

## UI/UX Improvements

- Add pulse animations to active event cards (badge and border ring)
- Add dynamic gradient colors throughout scanner UI based on active event
- Improve event card visual design with images and better spacing
- Add active badge indicator on event cards with pulse animation
- Improve button consistency across login form
- Better mobile responsiveness for event cards
- Add proper loading states for activate/deactivate actions
- Add dynamic status indicator in scanner (Ready/Error)
- Add deactivation confirmation dialog for safety
- Enhance visual feedback for active events

## Performance Improvements

- Remove unnecessary refs and debouncing in realtime subscription
- Use Supabase realtime payloads directly instead of refetching
- Optimize event activation by leveraging database triggers

## Code Quality

- Improve error handling with detailed logging
- Add event existence verification before updates
- Use maybeSingle() instead of single() for safer queries
- Better error messages for debugging
- Remove redundant code and simplify realtime logic

## Documentation

- Add cleanup-redundant-files.md with guidance on SQL file organization
- Add comprehensive comments in SQL migration files
- Document RLS policy structure and troubleshooting steps

## Testing Notes

- Verify scanner can scan for all events including Youth Zone
- Test event activation/deactivation from attendance page
- Verify realtime updates work when events are activated/deactivated
- Test logout confirmation dialog
- Verify password reveal toggle works correctly
- Test RLS policies with scanner and admin roles
- Verify gradient colors change correctly for each event
- Test pulse animations on active event cards
- Verify toast notifications appear correctly (no duplicates)
- Test deactivation confirmation dialog
- Verify dynamic status indicator shows correct state

## Migration Instructions

1. Run sql/events-table-setup.sql to create events table and seed data
2. Run sql/final-rls-fix.sql to fix RLS policies if needed
3. Ensure scanner users have 'scanner' role in user_profiles table
4. Enable realtime for events table in Supabase Dashboard > Database > Replication
5. Users may need to log out and log back in after role changes (stale session fix)

## Breaking Changes

- Events management page removed (functionality moved to attendance page)
- Event creation/editing/deletion removed from UI (events are now fixed and pre-seeded)
- Attendance page now shows event cards instead of direct table view

## Related Issues

- Fixes RLS policy violations for new events
- Resolves scanner not updating when events are activated/deactivated
- Improves mobile usability of login form
- Consolidates event management into attendance page
- Fixes redundant toast notifications
- Resolves activation issues with better error handling

```

```
