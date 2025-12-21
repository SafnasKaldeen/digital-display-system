/**
 * Cloudinary Video URL Optimizer
 * 
 * Usage:
 * import { optimizeCloudinaryVideo, optimizeAllVideos } from './cloudinaryOptimizer';
 * 
 * const optimizedUrl = optimizeCloudinaryVideo(originalUrl, 'balanced');
 */

// Quality presets for different use cases
const QUALITY_PRESETS = {
  // High quality for main lobby displays
  high: {
    params: 'q_auto:best,f_auto,w_1920,h_1080,br_5m,sp_full_hd,vc_auto',
    description: 'Best quality - Main lobby/entrance displays',
    estimatedSize: '5-8 MB per minute'
  },
  
  // Balanced quality for general use (RECOMMENDED)
  balanced: {
    params: 'q_auto:good,f_auto,w_1920,h_1080,br_3m,sp_hd,vc_auto',
    description: 'Good quality - Most waiting rooms',
    estimatedSize: '3-5 MB per minute'
  },
  
  // Efficient for multiple displays or slower networks
  efficient: {
    params: 'q_auto:eco,f_auto,w_1280,h_720,br_2m,sp_hd,vc_auto',
    description: 'Efficient - Multiple displays/slower networks',
    estimatedSize: '2-3 MB per minute'
  },
  
  // Ultra efficient for very slow networks
  minimal: {
    params: 'q_auto:low,f_auto,w_1280,h_720,br_1m,sp_hd,vc_auto',
    description: 'Minimal - Slow networks only',
    estimatedSize: '1-2 MB per minute'
  }
};

/**
 * Optimize a single Cloudinary video URL
 * @param {string} url - Original Cloudinary URL
 * @param {string} quality - Quality preset: 'high', 'balanced', 'efficient', 'minimal'
 * @returns {string} - Optimized URL
 */
export function optimizeCloudinaryVideo(url, quality = 'balanced') {
  if (!url || typeof url !== 'string') {
    console.warn('Invalid URL provided to optimizeCloudinaryVideo');
    return url;
  }

  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    console.warn('Not a Cloudinary URL, returning original:', url);
    return url;
  }

  // Check if already optimized
  if (url.includes('q_auto') || url.includes('f_auto')) {
    console.info('URL already appears optimized:', url);
    return url;
  }

  try {
    // Split URL at /upload/
    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      console.warn('Unexpected Cloudinary URL format:', url);
      return url;
    }

    const [baseUrl, resourcePath] = parts;
    const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS.balanced;

    // Construct optimized URL
    const optimizedUrl = `${baseUrl}/upload/${preset.params}/${resourcePath}`;
    
    console.log(`✅ Optimized video (${quality}):`, {
      original: url,
      optimized: optimizedUrl,
      preset: preset.description
    });

    return optimizedUrl;
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
    return url; // Return original on error
  }
}

/**
 * Optimize all video URLs in an advertisements array
 * @param {Array} advertisements - Array of ad objects with videoUrl property
 * @param {string} quality - Quality preset
 * @returns {Array} - Array with optimized URLs
 */
export function optimizeAllVideos(advertisements, quality = 'balanced') {
  if (!Array.isArray(advertisements)) {
    console.warn('Expected array of advertisements');
    return advertisements;
  }

  return advertisements.map(ad => {
    if (ad.mediaType === 'video' && ad.videoUrl) {
      return {
        ...ad,
        videoUrl: optimizeCloudinaryVideo(ad.videoUrl, quality)
      };
    }
    return ad;
  });
}

/**
 * Optimize image URLs (for image ads)
 * @param {string} url - Original Cloudinary image URL
 * @param {string} quality - Quality preset
 * @returns {string} - Optimized URL
 */
export function optimizeCloudinaryImage(url, quality = 'balanced') {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return url;
  }

  if (url.includes('q_auto') || url.includes('f_auto')) {
    return url;
  }

  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const [baseUrl, resourcePath] = parts;
    
    // Image optimization parameters
    const imageParams = quality === 'high' 
      ? 'q_auto:best,f_auto,w_1920,h_1080'
      : 'q_auto:good,f_auto,w_1920,h_1080';

    return `${baseUrl}/upload/${imageParams}/${resourcePath}`;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url;
  }
}

/**
 * Get video thumbnail from Cloudinary
 * @param {string} videoUrl - Cloudinary video URL
 * @returns {string} - Thumbnail URL
 */
export function getVideoThumbnail(videoUrl) {
  if (!videoUrl || !videoUrl.includes('cloudinary.com')) {
    return '';
  }

  try {
    const parts = videoUrl.split('/upload/');
    if (parts.length !== 2) return '';

    const [baseUrl, resourcePath] = parts;
    
    // Extract thumbnail at 0 seconds, duration 1 frame, as JPG
    const thumbnailParams = 'so_0,du_1,f_jpg,q_auto:good,w_640,h_360';
    
    return `${baseUrl}/upload/${thumbnailParams}/${resourcePath.replace(/\.[^.]+$/, '.jpg')}`;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return '';
  }
}

/**
 * Preload next video for smoother transitions
 * @param {string} videoUrl - Next video URL to preload
 */
export function preloadVideo(videoUrl) {
  if (!videoUrl) return;

  try {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = videoUrl;
    link.type = 'video/mp4';
    document.head.appendChild(link);
    
    console.log('🔄 Preloading video:', videoUrl);
  } catch (error) {
    console.error('Error preloading video:', error);
  }
}

/**
 * Detect network quality and suggest optimal preset
 * @returns {string} - Recommended quality preset
 */
export function detectOptimalQuality() {
  // Check for Network Information API
  const connection = navigator.connection || 
                     navigator.mozConnection || 
                     navigator.webkitConnection;

  if (!connection) {
    console.info('Network API not available, defaulting to balanced');
    return 'balanced';
  }

  const effectiveType = connection.effectiveType;
  const downlink = connection.downlink; // Mbps

  console.log('📶 Network detected:', { effectiveType, downlink });

  // Map network type to quality
  if (effectiveType === '4g' && downlink > 5) return 'high';
  if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 2)) return 'balanced';
  if (effectiveType === '3g') return 'efficient';
  return 'minimal';
}

// Export presets for documentation/reference
export { QUALITY_PRESETS };

// Example usage (for documentation)
export const USAGE_EXAMPLES = {
  single: `
    // Optimize a single video URL
    const optimizedUrl = optimizeCloudinaryVideo(
      "https://res.cloudinary.com/demo/video/upload/v123/promo.mp4",
      "balanced"
    );
  `,
  
  batch: `
    // Optimize all videos in your config
    const advertisements = [...]; // your ads array
    const optimizedAds = optimizeAllVideos(advertisements, "balanced");
  `,
  
  adaptive: `
    // Auto-detect best quality for network
    const quality = detectOptimalQuality();
    const url = optimizeCloudinaryVideo(originalUrl, quality);
  `,
  
  preload: `
    // Preload next video while current is playing
    useEffect(() => {
      if (nextVideoUrl) {
        preloadVideo(nextVideoUrl);
      }
    }, [nextVideoUrl]);
  `
};