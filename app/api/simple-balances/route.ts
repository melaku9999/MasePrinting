// Simple API route for Balance Management
// This is a simplified version to test if the route works

import { NextResponse } from 'next/server'

// GET /api/simple-balances
export async function GET(request: Request) {
  return NextResponse.json({ 
    success: true, 
    message: "Simple balances route is working"
  })
}

// POST /api/simple-balances
export async function POST(request: Request) {
  return NextResponse.json({ 
    success: true, 
    message: "Simple balances POST route is working"
  })
}