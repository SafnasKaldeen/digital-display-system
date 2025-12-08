// app/api/media/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterUserId = searchParams.get('userId');

    // Get all resources from Cloudinary
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      resource_type: 'image',
    });
    
    const mediaItems = result.resources.map((resource: any) => {
      const pathParts = resource.public_id.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      return {
        id: resource.public_id,
        fileName: fileName,
        fileType: resource.resource_type === 'video' ? 'video' : 'image',
        fileUrl: resource.secure_url,
        fileSize: resource.bytes,
        uploadedAt: resource.created_at,
        userId: pathParts[0] || '',
        displayId: pathParts[1] || '',
        type: pathParts[2] || ''
      };
    });

    const filteredItems = filterUserId 
      ? mediaItems.filter(item => item.userId === filterUserId)
      : mediaItems;

    console.log(`Total resources: ${mediaItems.length}, Filtered for user ${filterUserId}: ${filteredItems.length}`);

    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}