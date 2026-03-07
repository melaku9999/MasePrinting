// API route for Balance History
// GET /api/balances/history

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  // In a real implementation, this would fetch from backend
  // For now, we'll simulate balance adjustments
  const mockAdjustments = [
    {
      id: "adj_1",
      customerId: "1",
      amount: 1000,
      notes: "Initial deposit",
      createdAt: "2024-01-20T10:00:00Z",
      createdBy: "admin"
    },
    {
      id: "adj_2",
      customerId: "1",
      amount: -200,
      notes: "Credit adjustment",
      createdAt: "2024-03-01T14:30:00Z",
      createdBy: "admin"
    },
    {
      id: "adj_3",
      customerId: "2",
      amount: 500,
      notes: "Service deposit",
      createdAt: "2024-02-25T09:15:00Z",
      createdBy: "admin"
    }
  ]
  
  // Apply filters
  let adjustments = [...mockAdjustments]
  
  if (customerId) {
    adjustments = adjustments.filter(a => a.customerId === customerId)
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedAdjustments = adjustments.slice(startIndex, endIndex)
  
  return NextResponse.json({ 
    success: true, 
    adjustments: paginatedAdjustments,
    pagination: {
      page,
      limit,
      total: adjustments.length,
      pages: Math.ceil(adjustments.length / limit)
    }
  })
}