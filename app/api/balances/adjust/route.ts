// API route for Balance Adjustment
// POST /api/balances/adjust

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { customerId, amount, notes } = await request.json()
  
  // In a real implementation, this would adjust balance in backend
  const adjustment = {
    id: `adj_${Date.now()}`,
    customerId,
    amount,
    notes,
    createdAt: new Date().toISOString(),
    createdBy: "admin" // This would come from auth context in real implementation
  }
  
  console.log('Adjusting balance:', adjustment)
  
  return NextResponse.json({ 
    success: true, 
    adjustment
  })
}