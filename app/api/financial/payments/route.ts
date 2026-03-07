// API routes for Payment Management
// These are placeholder implementations that would connect to a backend

import { NextResponse } from 'next/server'
import { mockCustomers } from '@/lib/auth'

// GET /api/payments
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId') || ''
  const type = searchParams.get('type') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  // In a real implementation, this would fetch from backend
  // For now, we'll collect payments from all customers
  let allPayments: any[] = []
  
  mockCustomers.forEach(customer => {
    if (customer.paymentHistory) {
      customer.paymentHistory.forEach(payment => {
        allPayments.push({
          ...payment,
          customerId: customer.id
        })
      })
    }
  })
  
  // Apply filters
  if (customerId) {
    allPayments = allPayments.filter(p => p.customerId === customerId)
  }
  
  if (type) {
    allPayments = allPayments.filter(p => p.type === type)
  }
  
  if (startDate) {
    const start = new Date(startDate)
    allPayments = allPayments.filter(p => new Date(p.date) >= start)
  }
  
  if (endDate) {
    const end = new Date(endDate)
    allPayments = allPayments.filter(p => new Date(p.date) <= end)
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedPayments = allPayments.slice(startIndex, endIndex)
  
  return NextResponse.json({ 
    success: true, 
    payments: paginatedPayments,
    pagination: {
      page,
      limit,
      total: allPayments.length,
      pages: Math.ceil(allPayments.length / limit)
    }
  })
}

// GET /api/payments/{id}
export async function GET_byId(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch from backend
  // For now, we'll search through all customers
  for (const customer of mockCustomers) {
    if (customer.paymentHistory) {
      const payment = customer.paymentHistory.find(p => p.id === id)
      if (payment) {
        return NextResponse.json({ 
          success: true, 
          payment: {
            ...payment,
            customerId: customer.id
          }
        })
      }
    }
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Payment not found" 
  }, { status: 404 })
}

// POST /api/payments
export async function POST(request: Request) {
  const { customerId, amount, notes, type, paymentMethod } = await request.json()
  
  // In a real implementation, this would create payment in backend
  const newPayment = {
    id: `p_${Date.now()}`,
    customerId,
    date: new Date().toISOString(),
    amount,
    notes,
    type,
    paymentMethod,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  console.log('Creating payment:', newPayment)
  
  return NextResponse.json({ 
    success: true, 
    payment: newPayment 
  })
}

// PUT /api/payments/{id}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { amount, notes, type, paymentMethod } = await request.json()
  
  // In a real implementation, this would update payment in backend
  // For now, we'll just simulate the update
  console.log(`Updating payment ${id}:`, { amount, notes, type, paymentMethod })
  
  return NextResponse.json({ 
    success: true, 
    message: "Payment updated successfully"
  })
}

// DELETE /api/payments/{id}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would delete payment from backend
  console.log('Deleting payment:', id)
  
  return NextResponse.json({ 
    success: true, 
    message: "Payment deleted successfully"
  })
}