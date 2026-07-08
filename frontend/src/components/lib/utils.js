import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

export function getOptimizedImage(url, width, height) {
  if (!url) return '';
  
  const cloudName = 'dixtztdtm'; // From .env
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image`;

  // If it's already a Cloudinary URL from our account
  if (url.includes('res.cloudinary.com')) {
    // Add auto optimization and optional resizing
    const transform = `f_auto,q_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},c_limit`;
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  // For remote URLs (Wix, Base44, etc.), use Cloudinary Fetch API
  const transform = `f_auto,q_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},c_limit`;
  return `${baseUrl}/fetch/${transform}/${encodeURIComponent(url)}`;
}
