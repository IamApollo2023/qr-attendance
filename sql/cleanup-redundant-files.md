# Database Cleanup Guide

## Current SQL Files Status

### Core Setup Files (Keep These)

1. **supabase-setup.sql** - Main setup for user_profiles and qr_attendance
2. **events-table-setup.sql** - Events table with fixed events (Worship Service, Night of Power, Life Group, Youth Zone)
3. **members-table-setup.sql** - Members table with age category logic
4. **activities-table-setup.sql** - Activities table (if used)
5. **financial-tables-setup.sql** - Financial tables (if used)

### Fix/Troubleshooting Files (Can be archived/deleted after verification)

These were created during troubleshooting and can be removed once everything is working:

1. **fix-rls-policies.sql** - Old fix, superseded by final-rls-fix.sql
2. **fix-qr-attendance-rls.sql** - Old fix, superseded by final-rls-fix.sql
3. **comprehensive-rls-fix.sql** - Old fix, superseded by final-rls-fix.sql
4. **fix-scanner-user-role.sql** - Diagnostic/fix script (can keep for reference)
5. **diagnose-rls-issue.sql** - Diagnostic script (can keep for reference)
6. **final-rls-fix.sql** - **KEEP THIS** - This is the current working fix

### Migration Files (Keep for history)

1. **migrate-membership-types.sql**
2. **migrate-membership-type-classification.sql**
3. **migrate-activities-to-albums.sql**
4. **update-user-profiles-constraint.sql**

### Seed Files (Keep if needed)

1. **seed-finance-user.sql**
2. **seed-finance-user-function.sql**

## Recommended Cleanup

After running `database-audit.sql` and verifying everything works:

1. **Archive old fix files** - Move to an `archive/` folder:
   - fix-rls-policies.sql
   - fix-qr-attendance-rls.sql
   - comprehensive-rls-fix.sql

2. **Keep diagnostic files** for future troubleshooting:
   - diagnose-rls-issue.sql
   - fix-scanner-user-role.sql
   - database-audit.sql (new)

3. **Keep final-rls-fix.sql** as the reference for RLS policies

## Current Database Structure

### Tables

- `user_profiles` - User roles and profiles
- `qr_attendance` - Attendance records
- `events` - Fixed events (Worship Service, Night of Power, Life Group, Youth Zone)
- `members` - Member information
- `activities` - Activities (if used)
- Financial tables (if used)

### Key Features

- Row Level Security (RLS) enabled on all tables
- Automatic user profile creation on signup
- Event-based attendance tracking
- Member validation during scanning
- Real-time updates for events table
