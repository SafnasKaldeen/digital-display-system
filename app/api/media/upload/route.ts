// app/api/media/upload/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = 'nodejs';
export const maxDuration = 300;

// Generate a signature for client-side direct upload
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const displayId = searchParams.get('displayId');
    const type = searchParams.get('type') || 'default';
    const isVideo = searchParams.get('isVideo') === 'true';
    
    if (!userId || !displayId) {
      return NextResponse.json(
        { error: 'userId and displayId are required' },
        { status: 400 }
      );
    }
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = isVideo 
      ? `${userId}/${displayId}/${type}/video`
      : `${userId}/${displayId}/${type}`;
    
    // Generate signature for client-side upload
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );
    
    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}

// Server-side upload (with 10MB limit - will fail for large files)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Try to parse formData - this will fail for files > 10MB
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      // If formData parsing fails (likely due to size), return instructions for direct upload
      console.error('FormData parsing failed (likely file too large):', error);
      return NextResponse.json(
        { 
          error: 'File too large for server upload',
          useDirectUpload: true,
          message: 'Please use direct upload method for files larger than 10MB'
        },
        { status: 413 } // 413 Payload Too Large
      );
    }
    
    let files = formData.getAll('images') as File[];
    if (files.length === 0) {
      files = formData.getAll('files') as File[];
    }
    
    const userId = formData.get('userId') as string;
    const displayId = formData.get('displayId') as string;
    const type = (formData.get('type') as string) || 'default';
    
    console.log('Upload request:', {
      filesCount: files.length,
      userId,
      displayId,
      type,
    });
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!userId || !displayId) {
      return NextResponse.json(
        { error: 'User ID and Display ID are required' },
        { status: 400 }
      );
    }

    // Check if any file is too large
    const tenMB = 10 * 1024 * 1024;
    const largeFiles = files.filter(f => f.size > tenMB);
    if (largeFiles.length > 0) {
      return NextResponse.json(
        { 
          error: 'Files too large for server upload',
          useDirectUpload: true,
          largeFiles: largeFiles.map(f => ({
            name: f.name,
            size: f.size,
            sizeMB: (f.size / 1024 / 1024).toFixed(2)
          })),
          message: 'Please use direct upload method for large files'
        },
        { status: 413 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) {
        throw new Error(`${file.name} is not a valid image or video file`);
      }

      const timestamp = Date.now();
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      
      let folder = `${userId}/${displayId}/${type}`;
      if (isVideo) {
        folder = `${folder}/video`;
      }
      
      const publicId = `${timestamp}-${fileNameWithoutExt}`;
      
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        isVideo,
        folder,
        publicId
      });
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            public_id: publicId,
            resource_type: isVideo ? 'video' : 'image',
            chunk_size: 6000000,
            timeout: 300000,
            ...(isVideo && {
              eager: [
                { width: 640, height: 360, crop: 'pad', format: 'mp4', quality: 'auto' }
              ],
              eager_async: true,
            }),
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        uploadStream.end(buffer);
      });
      
      console.log('Upload successful:', {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        duration: result.duration
      });
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        userId: userId,
        displayId: displayId,
        type: type,
        resourceType: result.resource_type,
        fileType: isVideo ? 'video' : 'image',
        duration: result.duration,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    console.log(`Successfully uploaded ${uploadedFiles.length} file(s)`);

    return NextResponse.json({
      success: true,
      urls: uploadedFiles.map(file => file.url),
      blobs: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Check if error is related to body size
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('body') || errorMessage.includes('size') || errorMessage.includes('multipart')) {
      return NextResponse.json(
        { 
          error: 'Upload failed - file may be too large',
          useDirectUpload: true,
          details: errorMessage,
          message: 'Please use direct upload method'
        },
        { status: 413 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const resourceType = searchParams.get('resourceType') as 'image' | 'video' | undefined;
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId parameter required' },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image',
      invalidate: true,
    });

    console.log('Successfully deleted:', publicId, 'type:', resourceType || 'image');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}