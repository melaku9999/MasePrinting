// Test API route
// This is a simple test to verify API routes are working

import { NextResponse } from 'next/server'

// GET /api/test
export async function GET(request: Request) {
  return NextResponse.json({ 
    success: true, 
    message: "Test route is working"
  })
}