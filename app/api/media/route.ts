// app/api/media/route.ts
import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list();
    
    const mediaItems = blobs.map((blob) => {
      const pathParts = blob.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      return {
        id: blob.pathname,
        fileName: fileName,
        fileType: blob.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : "video",
        fileUrl: blob.url,
        fileSize: blob.size,
        uploadedAt: blob.uploadedAt,
        userId: pathParts[0] || '',
        environment: pathParts[1] || '',
        imageId: pathParts[2] || ''
      };
    });

    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
