feat: Add age group detail report page with attendance table

## Overview

Implemented a comprehensive age group detail report system that displays attendance data in a table format, showing member names on the Y-axis and event sessions (grouped by date) on the X-axis with checkmarks indicating attendance.

## Major Features

### Reports Page Enhancement

- Added clickable navigation to age group cards in ReportsManagement component
- Cards now navigate to detail pages when clicked using Next.js router
- Integrated with morphing-card-stack component's onCardClick handler

### Age Group Detail Report Function

- Created `getAgeGroupDetailReport()` function in `lib/reports.ts`
- Fetches all attendance records with full member data (first_name, last_name, id)
- Filters members by age group using same logic as stats:
  - "all": all members
  - "men": age_category === "Men" && gender === "male"
  - "women": age_category === "Women" && gender === "female"
  - "yan": age_category === "YAN"
  - "kkb": age_category === "KKB"
  - "kids": age_category === "Children"
- Groups event sessions by event name and date (YYYY-MM-DD format)
- Returns structured data: members, sessions, and attendance map
- Members sorted alphabetically by last name, then first name
- Sessions sorted by date (oldest first), then by event name

### Detail Report Page Route

- Created dynamic route `/admin/report/[ageGroup]/page.tsx`
- Server component that validates age group key
- Fetches report data server-side for better performance
- Handles Next.js 15 async params pattern
- Returns 404 for invalid age group keys

### Age Group Detail Report Component

- Created `AgeGroupDetailReport.tsx` client component
- Displays scrollable table with:
  - Fixed first column: Member names (sticky on horizontal scroll)
  - Dynamic columns: Event sessions (format: "Event Name - Date")
  - Cells: Green checkmark (✓) for attendance, gray dash (—) for no attendance
- Responsive design with:
  - Horizontal scrolling for many event sessions
  - Vertical scrolling for many members
  - Sticky header row
  - Sticky member name column
  - Custom scrollbar styling
- Header section with:
  - Back button to return to reports page
  - Age group name and description
  - Vertical layout (back button above title)
- Empty state when no data available

### Site Header Update

- Updated `site-header.tsx` to handle detail report pages
- Shows "Report - [AgeGroup]" for detail pages (e.g., "Report - Men")
- Falls back to "Report" for main reports page

### UI Component Updates

- Updated `morphing-card-stack.tsx` to support conditional font sizing:
  - Stack view: Large text (text-4xl/5xl/6xl)
  - Grid view: Medium text (text-xl/2xl)
  - List view: Small text (text-lg/xl)
- Centers title when no icon and no description for cleaner card display

## Technical Implementation

### Data Structure

```typescript
interface EventSession {
  sessionId: string; // e.g., "worship-service-2024-01-15"
  eventName: string; // e.g., "Worship Service"
  date: string; // ISO date string (YYYY-MM-DD)
  displayName: string; // e.g., "Worship Service - 2024-01-15"
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

interface AgeGroupDetailReport {
  members: Member[];
  sessions: EventSession[];
  attendance: Record<string, string[]>; // memberId -> Array of sessionIds
}
```

### Key Features

- **Event Session Grouping**: Groups attendance records by `event_id` (event name) and date portion of `scanned_at` (ignoring time)
- **Efficient Data Fetching**: Single query fetches all attendance records with member data
- **Client-Side Rendering**: Table component is client-side for interactivity
- **Server-Side Data Fetching**: Report data fetched server-side for security and performance
- **JSON-Serializable**: Attendance map uses arrays instead of Sets for proper serialization

## Files Created

- `app/(admin)/admin/report/[ageGroup]/page.tsx` - Dynamic route for detail pages
- `components/AgeGroupDetailReport.tsx` - Table component for displaying attendance data
- `components/ReportsManagement.tsx` - Enhanced with navigation
- `lib/reports.ts` - Added detail report function and interfaces

## Files Modified

- `components/site-header.tsx` - Added route handling for detail pages
- `components/ui/morphing-card-stack.tsx` - Added conditional font sizing and centered title support

## User Experience

- Click any age group card to view detailed attendance report
- Scroll horizontally to see all event sessions
- Scroll vertically to see all members
- Member names remain visible while scrolling horizontally
- Clear visual indicators (checkmarks) for attendance
- Easy navigation back to reports page

## Performance Considerations

- Single database query fetches all required data
- Server-side filtering and processing
- Efficient data structures for fast lookups
- Sticky columns/headers for better UX with large datasets
