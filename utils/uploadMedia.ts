// utils/uploadMedia.ts
// Smart upload utility with automatic fallback to direct Cloudinary upload

interface UploadResult {
  url: string;
  publicId: string;
  userId: string;
  displayId: string;
  type: string;
  resourceType: string;
  fileType: 'image' | 'video';
  duration?: number;
}

/**
 * Upload files with automatic fallback to direct Cloudinary upload
 * If server upload fails (e.g., file too large), automatically switches to direct upload
 */
export async function uploadMedia(
  files: File[],
  userId: string,
  displayId: string,
  type: string = 'default',
  onProgress?: (fileName: string, progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const file of files) {
    try {
      // Try server upload first
      const result = await uploadViaServer(file, userId, displayId, type, onProgress);
      results.push(result);
    } catch (error: any) {
      console.warn(`Server upload failed for ${file.name}, trying direct upload...`, error);
      
      // If server upload fails, try direct upload
      try {
        const result = await uploadDirectToCloudinary(file, userId, displayId, type, onProgress);
        results.push(result);
      } catch (directError) {
        console.error(`Both upload methods failed for ${file.name}:`, directError);
        throw directError;
      }
    }
  }
  
  return results;
}

/**
 * Upload via Next.js API route (works for files < 10MB)
 */
async function uploadViaServer(
  file: File,
  userId: string,
  displayId: string,
  type: string,
  onProgress?: (fileName: string, progress: number) => void
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('userId', userId);
  formData.append('displayId', displayId);
  formData.append('type', type);
  
  console.log(`📤 Uploading ${file.name} via server (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  
  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  
  // Check if server suggests using direct upload
  if (!response.ok && (data.useDirectUpload || response.status === 413)) {
    throw new Error('File too large for server upload');
  }
  
  if (!response.ok) {
    throw new Error(data.details || data.error || 'Upload failed');
  }
  
  console.log(`✓ Server upload successful: ${file.name}`);
  return data.blobs[0];
}

/**
 * Upload directly to Cloudinary (no size limit!)
 */
async function uploadDirectToCloudinary(
  file: File,
  userId: string,
  displayId: string,
  type: string,
  onProgress?: (fileName: string, progress: number) => void
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');
  
  console.log(`🚀 Direct upload to Cloudinary: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  
  // Step 1: Get signature from API
  const signatureResponse = await fetch(
    `/api/media/upload?userId=${userId}&displayId=${displayId}&type=${type}&isVideo=${isVideo}`
  );
  
  if (!signatureResponse.ok) {
    throw new Error('Failed to get upload signature');
  }
  
  const { signature, timestamp, folder, cloudName, apiKey } = await signatureResponse.json();
  
  // Step 2: Upload directly to Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', folder);
  formData.append('api_key', apiKey);
  
  if (isVideo) {
    formData.append('resource_type', 'video');
  }
  
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;
  
  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(file.name, percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        console.log(`✓ Direct upload successful: ${file.name}`);
        
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          userId,
          displayId,
          type,
          resourceType: result.resource_type,
          fileType: isVideo ? 'video' : 'image',
          duration: result.duration,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });
    
    xhr.open('POST', cloudinaryUrl);
    xhr.send(formData);
  });
}

/**
 * Helper to determine if file should use direct upload
 * (You can also use this to skip server upload entirely for large files)
 */
export function shouldUseDirectUpload(file: File): boolean {
  const tenMB = 10 * 1024 * 1024;
  return file.size > tenMB;
}

/**
 * Optimized upload function that skips server for large files
 */
export async function uploadMediaSmart(
  files: File[],
  userId: string,
  displayId: string,
  type: string = 'default',
  onProgress?: (fileName: string, progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const file of files) {
    try {
      // Check file size first - skip server for large files
      if (shouldUseDirectUpload(file)) {
        console.log(`📦 File ${file.name} is large, using direct upload`);
        const result = await uploadDirectToCloudinary(file, userId, displayId, type, onProgress);
        results.push(result);
      } else {
        console.log(`📦 File ${file.name} is small, using server upload`);
        // Try server upload for small files
        try {
          const result = await uploadViaServer(file, userId, displayId, type, onProgress);
          results.push(result);
        } catch (error) {
          // Fallback to direct upload if server fails
          console.warn(`Server upload failed, falling back to direct upload`);
          const result = await uploadDirectToCloudinary(file, userId, displayId, type, onProgress);
          results.push(result);
        }
      }
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      throw error;
    }
  }
  
  return results;
}