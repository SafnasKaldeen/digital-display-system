// app/api/preview/create/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage (for development)
const previewStore = new Map<string, { config: any; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const customization = await request.json()
    
    // Generate short token
    const token = Math.random().toString(36).substring(2, 15)
    
    // Store config temporarily (expires in 1 hour)
    previewStore.set(token, {
      config: customization,
      expiresAt: Date.now() + 60 * 60 * 1000
    })
    
    return NextResponse.json({ 
      token,
      previewUrl: `/preview?token=${token}`
    })
  } catch (error) {
    console.error('Error creating preview:', error)
    return NextResponse.json(
      { error: 'Failed to create preview' },
      { status: 500 }
    )
  }
}