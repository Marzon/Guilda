import { supabase } from "@/integrations/supabase/client";

/**
 * Extract file path from a Supabase storage public URL
 */
export function extractFilePath(publicUrl: string): string | null {
  // Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/chat-files\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Generate a signed URL for a chat file
 * Returns the original URL if signing fails (fallback)
 */
export async function getSignedUrl(publicUrl: string, expiresIn = 3600): Promise<string> {
  const filePath = extractFilePath(publicUrl);
  
  if (!filePath) {
    console.warn('Could not extract file path from URL:', publicUrl);
    return publicUrl;
  }
  
  try {
    const { data, error } = await supabase.storage
      .from('chat-files')
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return publicUrl;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    return publicUrl;
  }
}

/**
 * Hook-friendly version that caches signed URLs
 */
const signedUrlCache = new Map<string, { url: string; expires: number }>();

export async function getCachedSignedUrl(publicUrl: string): Promise<string> {
  const cached = signedUrlCache.get(publicUrl);
  const now = Date.now();
  
  // Return cached URL if still valid (with 5 min buffer)
  if (cached && cached.expires > now + 300000) {
    return cached.url;
  }
  
  const signedUrl = await getSignedUrl(publicUrl);
  
  // Cache for 55 minutes (signed URL valid for 1 hour)
  signedUrlCache.set(publicUrl, {
    url: signedUrl,
    expires: now + 3300000
  });
  
  return signedUrl;
}
