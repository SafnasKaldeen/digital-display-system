// ==============================================
// FILE: hooks/useMangaImage.ts
// ==============================================
import { useEffect, useState } from 'react';

const CACHE_KEY_PREFIX = 'manga_img_';
const CACHE_EXPIRY_DAYS = 7;

interface CachedImage {
  dataUrl: string;
  contentType: string;
  timestamp: number;
}

interface UseMangaImageOptions {
  enabled?: boolean;
  skipCache?: boolean;
}

interface UseMangaImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function getCacheKey(mangaSlug: string, chapter: number, panel: number): string {
  return `${CACHE_KEY_PREFIX}${mangaSlug}_${chapter}_${panel}`;
}

function isCacheExpired(timestamp: number): boolean {
  const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp > expiryMs;
}

function getCachedImage(key: string): string | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedImage = JSON.parse(cached);
    
    if (isCacheExpired(parsed.timestamp)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.dataUrl;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

function setCachedImage(key: string, dataUrl: string, contentType: string): void {
  try {
    const cacheData: CachedImage = {
      dataUrl,
      contentType,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching image:', error);
    // Handle quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCache();
      // Retry once
      try {
        localStorage.setItem(key, JSON.stringify({
          dataUrl,
          contentType,
          timestamp: Date.now(),
        }));
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError);
      }
    }
  }
}

function clearOldCache(): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key)!);
          if (isCacheExpired(cached.timestamp)) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} expired cache entries`);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export function useMangaImage(
  mangaSlug: string,
  chapter: number,
  panel: number,
  options: UseMangaImageOptions = {}
): UseMangaImageReturn {
  const { enabled = true, skipCache = false } = options;
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const cacheKey = getCacheKey(mangaSlug, chapter, panel);

    // Check cache first
    if (!skipCache) {
      const cached = getCachedImage(cacheKey);
      if (cached) {
        setImageUrl(cached);
        setIsLoading(false);
        setError(null);
        return;
      }
    }

    // Fetch from API
    const fetchImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          manga: mangaSlug,
          chapter: chapter.toString(),
          panel: panel.toString(),
        });

        const response = await fetch(`/api/manga/image?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        // Cache the data URL
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        setCachedImage(cacheKey, dataUrl, contentType);

        setImageUrl(dataUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching manga image:', err);
        setError(err instanceof Error ? err.message : 'Failed to load image');
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [mangaSlug, chapter, panel, enabled, skipCache, refetchTrigger]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return { imageUrl, isLoading, error, refetch };
}

