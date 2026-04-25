import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Image processing utility (HEIC conversion and compression)
 */
export async function processImage(file: File): Promise<File> {
  let blob: Blob = file;

  // 1. Convert HEIC if needed
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic') {
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8,
      });
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      // continue with original file if conversion fails
    }
  }

  // 2. Compress using canvas to prevent Vercel 4.5MB limit
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 1200; // Max width or height

        if (width > height && width > max_size) {
          height *= max_size / width;
          width = max_size;
        } else if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blb) => {
          if (blb) {
            resolve(new File([blb], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          } else {
            resolve(file); // fallback
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = () => resolve(file); // fallback
    };
    reader.onerror = () => resolve(file); // fallback
  });
}

/**
 * Converts a Google Drive URL or ID to a secure local proxy URL
 */
export function getProxyUrl(urlOrId: string | undefined): string {
  if (!urlOrId) return '';
  
  // If it's already a proxy URL, return it
  if (urlOrId.startsWith('/api/image-proxy')) return urlOrId;

  // Extract ID from various Google Drive URL formats
  let id = urlOrId;
  const idMatch = urlOrId.match(/(?:id=|\/d\/|d\/)([a-zA-Z0-9_-]{25,})/);
  if (idMatch) {
    id = idMatch[1];
  }

  return `/api/image-proxy?id=${id}`;
}
