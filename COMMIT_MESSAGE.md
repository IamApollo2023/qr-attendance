# Commit Message

```
feat: Implement event-based attendance system with UI improvements and RLS fixes

## Major Features

### Event Management System
- Add fixed events system with pre-seeded events (Worship Service, Night of Power, Life Group, Youth Zone)
- Implement event activation/deactivation with database triggers ensuring only one active event
- Add event-specific images for each fixed event (ws.jpg, nop.jpg, lg.png, yz.png)
- Create events table with RLS policies for admin management and scanner access
- Add realtime support for events table to enable live updates when events are activated/deactivated

### Attendance Page Redesign
- Redesign attendance page with event card-based UI instead of direct table view
- Add EventCard component with event images, stats display, and navigation
- Add EventAttendanceCards component for grid layout of event cards
- Move activate/deactivate functionality from dedicated events page to attendance page
- Create dynamic route for event-specific attendance details (/admin/attendance/[eventId])
- Remove dedicated events management page and consolidate functionality

### Scanner Improvements
- Add logout confirmation dialog to prevent accidental logouts
- Implement realtime subscription for events to update scanner when event changes
- Add automatic event fetching and display in scanner UI
- Show warning message when no active event is set
- Update scanner to use active event from database instead of hardcoded values

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
- components/EventCard.tsx - Reusable event card with image, stats, and actions
- components/EventAttendanceCards.tsx - Grid layout for event cards with state management
- components/ui/textarea.tsx - Textarea UI component
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
- components/QRScanner.tsx - Add realtime event updates, logout confirmation, active event display
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
- Ensure scanner user role is properly set for RLS policies

## Database Schema Changes
- Add events table with id, name, description, is_active, timestamps
- Add unique constraint on is_active=true to ensure only one active event
- Add member_id foreign key to qr_attendance table (from members-table-setup.sql)
- Enable realtime replication for events table

## UI/UX Improvements
- Improve event card visual design with images and better spacing
- Add active badge indicator on event cards
- Improve button consistency across login form
- Better mobile responsiveness for event cards
- Add proper loading states for activate/deactivate actions

## Documentation
- Add cleanup-redundant-files.md with guidance on SQL file organization
- Add comprehensive comments in SQL migration files
- Document RLS policy structure and troubleshooting steps

## Testing Notes
- Verify scanner can scan for all events including Youth Zone
- Test event activation/deactivation from attendance page
- Verify realtime updates work when events are activated
- Test logout confirmation dialog
- Verify password reveal toggle works correctly
- Test RLS policies with scanner and admin roles

## Migration Instructions
1. Run sql/events-table-setup.sql to create events table and seed data
2. Run sql/final-rls-fix.sql to fix RLS policies if needed
3. Ensure scanner users have 'scanner' role in user_profiles table
4. Enable realtime for events table in Supabase Dashboard > Database > Replication
5. Users may need to log out and log back in after role changes

## Breaking Changes
- Events management page removed (functionality moved to attendance page)
- Event creation/editing/deletion removed from UI (events are now fixed and pre-seeded)
- Attendance page now shows event cards instead of direct table view

## Related Issues
- Fixes RLS policy violations for new events
- Resolves scanner not updating when events are activated
- Improves mobile usability of login form
- Consolidates event management into attendance page
```
