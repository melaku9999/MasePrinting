// API routes for Service Assignment Management
// These are placeholder implementations that would connect to a backend

import { NextResponse } from 'next/server'
import { mockServiceAssignments } from '@/lib/services'

// GET /api/service-assignments
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId') || ''
  const serviceId = searchParams.get('serviceId') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  // In a real implementation, this would fetch from backend
  let assignments = [...mockServiceAssignments]
  
  // Apply filters
  if (customerId) {
    assignments = assignments.filter(a => a.customerId === customerId)
  }
  
  if (serviceId) {
    assignments = assignments.filter(a => a.serviceId === serviceId)
  }
  
  if (status) {
    assignments = assignments.filter(a => a.status === status)
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedAssignments = assignments.slice(startIndex, endIndex)
  
  return NextResponse.json({ 
    success: true, 
    assignments: paginatedAssignments,
    pagination: {
      page,
      limit,
      total: assignments.length,
      pages: Math.ceil(assignments.length / limit)
    }
  })
}

// GET /api/service-assignments/{id}
export async function GET_byId(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch from backend
  const assignment = mockServiceAssignments.find(a => a.id === id)
  
  if (assignment) {
    return NextResponse.json({ 
      success: true, 
      assignment 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Service assignment not found" 
  }, { status: 404 })
}

// POST /api/service-assignments
export async function POST(request: Request) {
  const { customerId, serviceId, customPrice, notes } = await request.json()
  
  // In a real implementation, this would create assignment in backend
  const newAssignment = {
    id: `${Date.now()}`,
    customerId,
    serviceId,
    status: "pending",
    customPrice,
    notes,
    assignedDate: new Date().toISOString()
  }
  
  console.log('Creating service assignment:', newAssignment)
  
  return NextResponse.json({ 
    success: true, 
    assignment: newAssignment 
  })
}

// PUT /api/service-assignments/{id}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { status, customPrice, notes } = await request.json()
  
  // In a real implementation, this would update assignment in backend
  const assignmentIndex = mockServiceAssignments.findIndex(a => a.id === id)
  
  if (assignmentIndex !== -1) {
    const updatedAssignment = {
      ...mockServiceAssignments[assignmentIndex],
      status,
      customPrice,
      notes,
      startDate: status === "active" && !mockServiceAssignments[assignmentIndex].startDate 
        ? new Date().toISOString() 
        : mockServiceAssignments[assignmentIndex].startDate,
      endDate: status === "completed" && !mockServiceAssignments[assignmentIndex].endDate 
        ? new Date().toISOString() 
        : mockServiceAssignments[assignmentIndex].endDate
    }
    
    console.log('Updating service assignment:', updatedAssignment)
    
    return NextResponse.json({ 
      success: true, 
      assignment: updatedAssignment 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Service assignment not found" 
  }, { status: 404 })
}

// DELETE /api/service-assignments/{id}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would delete assignment from backend
  const assignmentIndex = mockServiceAssignments.findIndex(a => a.id === id)
  
  if (assignmentIndex !== -1) {
    const deletedAssignment = mockServiceAssignments[assignmentIndex]
    console.log('Deleting service assignment:', deletedAssignment)
    
    return NextResponse.json({ 
      success: true, 
      message: "Service assignment deleted successfully"
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Service assignment not found" 
  }, { status: 404 })
}