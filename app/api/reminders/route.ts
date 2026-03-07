// API routes for Reminder Management
// These are placeholder implementations that would connect to a backend

import { NextResponse } from 'next/server'
import { mockReminders } from '@/lib/auth'

// GET /api/reminders
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  // In a real implementation, this would fetch from backend
  let reminders = [...mockReminders]
  
  // Apply filters
  if (status) {
    reminders = reminders.filter(r => r.status === status)
  }
  
  if (startDate) {
    const start = new Date(startDate)
    reminders = reminders.filter(r => new Date(r.scheduledTime) >= start)
  }
  
  if (endDate) {
    const end = new Date(endDate)
    reminders = reminders.filter(r => new Date(r.scheduledTime) <= end)
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedReminders = reminders.slice(startIndex, endIndex)
  
  return NextResponse.json({ 
    success: true, 
    reminders: paginatedReminders,
    pagination: {
      page,
      limit,
      total: reminders.length,
      pages: Math.ceil(reminders.length / limit)
    }
  })
}

// GET /api/reminders/{id}
export async function GET_byId(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch from backend
  const reminder = mockReminders.find(r => r.id === id)
  
  if (reminder) {
    return NextResponse.json({ 
      success: true, 
      reminder 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Reminder not found" 
  }, { status: 404 })
}

// POST /api/reminders
export async function POST(request: Request) {
  const { title, description, scheduledTime, repeat } = await request.json()
  
  // In a real implementation, this would create reminder in backend
  const newReminder = {
    id: `${Date.now()}`,
    title,
    description,
    adminId: "1", // Default to admin user
    scheduledTime,
    status: "pending",
    repeat,
    createdAt: new Date().toISOString()
  }
  
  console.log('Creating reminder:', newReminder)
  
  return NextResponse.json({ 
    success: true, 
    reminder: newReminder 
  })
}

// PUT /api/reminders/{id}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { title, description, scheduledTime, repeat, status } = await request.json()
  
  // In a real implementation, this would update reminder in backend
  const reminderIndex = mockReminders.findIndex(r => r.id === id)
  
  if (reminderIndex !== -1) {
    const updatedReminder = {
      ...mockReminders[reminderIndex],
      title,
      description,
      scheduledTime,
      repeat,
      status,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Updating reminder:', updatedReminder)
    
    return NextResponse.json({ 
      success: true, 
      reminder: updatedReminder 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Reminder not found" 
  }, { status: 404 })
}

// DELETE /api/reminders/{id}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would delete reminder from backend
  const reminderIndex = mockReminders.findIndex(r => r.id === id)
  
  if (reminderIndex !== -1) {
    const deletedReminder = mockReminders[reminderIndex]
    console.log('Deleting reminder:', deletedReminder)
    
    return NextResponse.json({ 
      success: true, 
      message: "Reminder deleted successfully"
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Reminder not found" 
  }, { status: 404 })
}

// PATCH /api/reminders/{id}/status
export async function PATCH_status(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { status } = await request.json()
  
  // In a real implementation, this would update reminder status in backend
  const reminderIndex = mockReminders.findIndex(r => r.id === id)
  
  if (reminderIndex !== -1) {
    const updatedReminder = {
      ...mockReminders[reminderIndex],
      status,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Updating reminder status:', updatedReminder)
    
    return NextResponse.json({ 
      success: true, 
      reminder: updatedReminder 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Reminder not found" 
  }, { status: 404 })
}