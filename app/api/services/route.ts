// API routes for Service Management
// These are placeholder implementations that would connect to a backend

import { NextResponse } from 'next/server'
import { mockServices } from '@/lib/auth'

// GET /api/services
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  // In a real implementation, this would fetch from backend
  let services = [...mockServices]
  
  // Apply search filter
  if (search) {
    services = services.filter(service => 
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  // Apply category filter
  if (category) {
    services = services.filter(service => service.category === category)
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedServices = services.slice(startIndex, endIndex)
  
  return NextResponse.json({ 
    success: true, 
    services: paginatedServices,
    pagination: {
      page,
      limit,
      total: services.length,
      pages: Math.ceil(services.length / limit)
    }
  })
}

// GET /api/services/{id}
export async function GET_byId(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch from backend
  const service = mockServices.find(s => s.id === id)
  
  if (service) {
    return NextResponse.json({ 
      success: true, 
      service 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Service not found" 
  }, { status: 404 })
}

// POST /api/services
export async function POST(request: Request) {
  const { name, description, category, price, requiresLicense, requiredFields, subtasks } = await request.json()
  
  // In a real implementation, this would create service in backend
  const newService = {
    id: `${Date.now()}`,
    name,
    description,
    price,
    requiresLicense,
    requiredFields,
    category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: subtasks || []
  }
  
  console.log('Creating service:', newService)
  
  return NextResponse.json({ 
    success: true, 
    service: newService 
  })
}

// PUT /api/services/{id}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { name, description, category, price, requiresLicense, requiredFields, subtasks } = await request.json()
  
  // In a real implementation, this would update service in backend
  const serviceIndex = mockServices.findIndex(s => s.id === id)
  
  if (serviceIndex !== -1) {
    const updatedService = {
      ...mockServices[serviceIndex],
      name,
      description,
      category,
      price,
      requiresLicense,
      requiredFields,
      updatedAt: new Date().toISOString(),
      subtasks: subtasks || mockServices[serviceIndex].subtasks
    }
    
    console.log('Updating service:', updatedService)
    
    return NextResponse.json({ 
      success: true, 
      service: updatedService 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Service not found" 
  }, { status: 404 })
}

// DELETE /api/services/{id}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would delete service from backend
  const serviceIndex = mockServices.findIndex(s => s.id === id)
  
  if (serviceIndex !== -1) {
    const deletedService = mockServices[serviceIndex]
    console.log('Deleting service:', deletedService)
    
    return NextResponse.json({ 
      success: true, 
      message: "Service deleted successfully"
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Service not found" 
  }, { status: 404 })
}

// GET /api/services/{id}/subscribed-customers
export async function GET_subscribedCustomers(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch subscribed customers from backend
  const service = mockServices.find(s => s.id === id)
  
  if (service) {
    return NextResponse.json({ 
      success: true, 
      customers: service.subscribedCustomers || [] 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Service not found" 
  }, { status: 404 })
}

// GET /api/services/{id}/pending-customers
export async function GET_pendingCustomers(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch pending customers from backend
  const service = mockServices.find(s => s.id === id)
  
  if (service) {
    return NextResponse.json({ 
      success: true, 
      customers: service.pendingCustomers || [] 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Service not found" 
  }, { status: 404 })
}