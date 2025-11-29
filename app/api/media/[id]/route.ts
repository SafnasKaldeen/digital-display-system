// app/api/media/[id]/route.ts
import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    const pathname = decodeURIComponent(id);
    
    // Delete from Vercel Blob
    await del(pathname);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}