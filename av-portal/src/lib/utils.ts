import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * HEIC to JPEG conversion utility
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  // Only convert if it's an HEIC/HEIF file
  if (!file.name.toLowerCase().endsWith('.heic') && !file.name.toLowerCase().endsWith('.heif') && file.type !== 'image/heic') {
    return file;
  }

  try {
    const heic2any = (await import('heic2any')).default;
    const blob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8,
    });

    const resultBlob = Array.isArray(blob) ? blob[0] : blob;
    return new File([resultBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    return file; // Fallback to original
  }
}
