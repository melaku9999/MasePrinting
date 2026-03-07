# Reminder Manager Component

## Overview
The Reminder Manager is a feature-rich component that allows administrators to create, manage, and receive notifications for scheduled tasks and events.

## Features
- Create new reminders with title, description, and scheduled time
- Edit existing reminders
- View all reminders in a table format with status indicators
- Automatic alarm notification when a reminder is due
- Snooze functionality with 5, 10, or 30-minute options
- Mark reminders as done to complete them

## Data Structure
```typescript
interface Reminder {
  id: string
  title: string
  description: string
  adminId: string
  scheduledTime: string
  status: "pending" | "snoozed" | "done"
  snoozeUntil?: string
  createdAt: string
}
```

## API Endpoints
- `GET /api/reminders` - Fetch all reminders
- `POST /api/reminders` - Create a new reminder
- `PATCH /api/reminders/:id` - Update a reminder (mark as done, snooze, etc.)

## Implementation Details
- Uses React with TypeScript for type safety
- Implements client-side timer checks with `setInterval`
- Plays looping alarm sound when a reminder is due
- Responsive design using Tailwind CSS
- Modal dialogs for creating/editing reminders and alarm notifications
- Status badges for visual indication of reminder state

## Usage
1. Navigate to the "Reminders" section in the admin dashboard
2. Click "New Reminder" to create a new scheduled task
3. Set the title, description, and scheduled time
4. When the scheduled time arrives, an alarm will trigger
5. Choose to snooze the reminder or mark it as done

## Dependencies
- React (v18+)
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Next.js (for API routes)