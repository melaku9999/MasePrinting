# Reminder Manager Usage Guide

## Accessing the Reminder Manager

1. Log in to the admin dashboard
2. In the left sidebar navigation, click on "Reminders"
3. The Reminder Manager page will load showing all existing reminders

## Creating a New Reminder

1. Click the "New Reminder" button in the top right corner
2. Fill in the following fields in the modal:
   - **Title**: A short descriptive name for the reminder
   - **Description**: Detailed information about the reminder (optional)
   - **Scheduled Time**: Date and time when the reminder should trigger
3. Click "Create Reminder" to save

## Editing a Reminder

1. Find the reminder you want to edit in the table
2. Click the edit icon (pencil) in the Actions column
3. Modify any of the fields in the edit modal
4. Click "Save Changes" to update the reminder

## Managing Reminder Notifications

When a reminder's scheduled time arrives:
1. An alarm sound will play (looping beep)
2. A notification modal will appear with the reminder details
3. You can choose one of two actions:
   - **Snooze**: Temporarily dismiss the reminder for a set duration
     - Select 5, 10, or 30 minutes from the dropdown
     - The reminder will reappear after the snooze period
   - **Mark as Done**: Permanently complete the reminder
     - The alarm will stop
     - The reminder status will change to "Done"

## Reminder Status Indicators

- **Pending** (yellow): Reminder is scheduled but not yet due
- **Snoozed** (blue): Reminder has been temporarily dismissed
- **Done** (green): Reminder has been completed

## Technical Implementation

### Frontend
- Built with React and TypeScript
- Uses Tailwind CSS for styling
- Implements client-side timer checks with `setInterval` (checks every 30 seconds)
- Audio alarm using HTML5 Audio API with looping beep sound
- Responsive design that works on all screen sizes

### Backend Integration
- API endpoints for CRUD operations:
  - `GET /api/reminders` - Retrieve all reminders
  - `POST /api/reminders` - Create a new reminder
  - `PATCH /api/reminders/:id` - Update reminder status (snooze/mark as done)
- Designed to integrate with Django REST Framework backend

## Data Structure

```typescript
interface Reminder {
  id: string
  title: string
  description: string
  adminId: string
  scheduledTime: string  // ISO format datetime
  status: "pending" | "snoozed" | "done"
  snoozeUntil?: string   // ISO format datetime (only when snoozed)
  createdAt: string      // ISO format datetime
}
```