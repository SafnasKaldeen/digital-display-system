import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const id = formData.get('id') as string;
    const environment = formData.get('environment') as string; // 'preview' or 'production'
    const imageId = formData.get('imageId') as string;
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!id || !environment || !imageId) {
      return NextResponse.json(
        { error: 'Missing required parameters: id, environment, or imageId' },
        { status: 400 }
      );
    }

    if (environment !== 'preview' && environment !== 'production') {
      return NextResponse.json(
        { error: 'Environment must be either "preview" or "production"' },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      // Create organized path: id/environment/imageId/filename
      const pathname = `${id}/${environment}/${imageId}/${file.name}`;
      
      const blob = await put(pathname, file, {
        access: 'public',
        addRandomSuffix: false, // Keep original filename in organized structure
      });
      
      return {
        ...blob,
        id,
        environment,
        imageId,
      };
    });

    const uploadedBlobs = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      blobs: uploadedBlobs,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}