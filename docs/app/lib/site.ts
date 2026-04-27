// Centralized site metadata so canonical/OG URLs stay in sync.
export const SITE_URL = 'https://sone.seanghay.com';
export const SITE_NAME = 'Sone';
export const SITE_LOCALE = 'en_US';

// OG image is rendered by Sone at density=2 → 2400×1260 actual pixels.
export const OG_IMAGE_WIDTH = 2400;
export const OG_IMAGE_HEIGHT = 1260;
export const OG_IMAGE_TYPE = 'image/jpeg';

export function ogImagePath(slugs: string[]): string {
  const path = slugs.length ? slugs.join('/') : 'index';
  return `/og/docs/${path}.jpg`;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
