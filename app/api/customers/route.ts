// API routes for Customer Management
// These are placeholder implementations that would connect to a backend

import { NextResponse } from 'next/server'
import { mockCustomers } from '@/lib/auth'

// GET /api/customers
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  
  // In a real implementation, this would fetch from backend
  let customers = [...mockCustomers]
  
  // Apply search filter
  if (search) {
    customers = customers.filter(customer => 
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  // Apply status filter
  if (status) {
    customers = customers.filter(customer => customer.status === status)
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedCustomers = customers.slice(startIndex, endIndex)
  
  return NextResponse.json({ 
    success: true, 
    customers: paginatedCustomers,
    pagination: {
      page,
      limit,
      total: customers.length,
      pages: Math.ceil(customers.length / limit)
    }
  })
}

// GET /api/customers/{id}
export async function GET_byId(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch from backend
  const customer = mockCustomers.find(c => c.id === id)
  
  if (customer) {
    return NextResponse.json({ 
      success: true, 
      customer 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Customer not found" 
  }, { status: 404 })
}

// POST /api/customers
export async function POST(request: Request) {
  const { name, email, phone, address, status } = await request.json()
  
  // In a real implementation, this would create customer in backend
  const newCustomer = {
    id: `${Date.now()}`,
    name,
    email,
    phone,
    address,
    status,
    createdAt: new Date().toISOString(),
    balance: 0,
    prepaymentBalance: 0,
    outstandingBalance: 0
  }
  
  console.log('Creating customer:', newCustomer)
  
  return NextResponse.json({ 
    success: true, 
    customer: newCustomer 
  })
}

// PUT /api/customers/{id}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { name, email, phone, address, status } = await request.json()
  
  // In a real implementation, this would update customer in backend
  const customerIndex = mockCustomers.findIndex(c => c.id === id)
  
  if (customerIndex !== -1) {
    const updatedCustomer = {
      ...mockCustomers[customerIndex],
      name,
      email,
      phone,
      address,
      status
    }
    
    console.log('Updating customer:', updatedCustomer)
    
    return NextResponse.json({ 
      success: true, 
      customer: updatedCustomer 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Customer not found" 
  }, { status: 404 })
}

// DELETE /api/customers/{id}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would delete customer from backend
  const customerIndex = mockCustomers.findIndex(c => c.id === id)
  
  if (customerIndex !== -1) {
    const deletedCustomer = mockCustomers[customerIndex]
    console.log('Deleting customer:', deletedCustomer)
    
    return NextResponse.json({ 
      success: true, 
      message: "Customer deleted successfully"
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Customer not found" 
  }, { status: 404 })
}

// GET /api/customers/{id}/services
export async function GET_services(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch customer services from backend
  const customer = mockCustomers.find(c => c.id === id)
  
  if (customer) {
    // Return empty array for now as we don't have service assignments in mock data
    return NextResponse.json({ 
      success: true, 
      services: [] 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Customer not found" 
  }, { status: 404 })
}

// GET /api/customers/{id}/tasks
export async function GET_tasks(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  
  // In a real implementation, this would fetch customer tasks from backend
  // For now, we'll return empty array
  return NextResponse.json({ 
    success: true, 
    tasks: [] 
  })
}

// GET /api/customers/{id}/files
export async function GET_files(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch customer files from backend
  // For now, we'll return empty array
  return NextResponse.json({ 
    success: true, 
    files: [] 
  })
}

// GET /api/customers/{id}/payments
export async function GET_payments(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch customer payments from backend
  const customer = mockCustomers.find(c => c.id === id)
  
  if (customer) {
    return NextResponse.json({ 
      success: true, 
      payments: customer.paymentHistory || [] 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Customer not found" 
  }, { status: 404 })
}

// GET /api/customers/{id}/payment-history
export async function GET_paymentHistory(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch customer payment history from backend
  const customer = mockCustomers.find(c => c.id === id)
  
  if (customer) {
    return NextResponse.json({ 
      success: true, 
      payments: customer.paymentHistory || [] 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Customer not found" 
  }, { status: 404 })
}