// app/api/preview/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Same storage as create route (in real app, use Redis/KV)
const previewStore = new Map<string, { config: any; expiresAt: number }>()

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const stored = previewStore.get(params.token)
    
    if (!stored) {
      return NextResponse.json(
        { error: 'Preview not found or expired' },
        { status: 404 }
      )
    }

    // Check if expired
    if (stored.expiresAt < Date.now()) {
      previewStore.delete(params.token)
      return NextResponse.json(
        { error: 'Preview expired' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(stored.config)
  } catch (error) {
    console.error('Error fetching preview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview' },
      { status: 500 }
    )
  }
}