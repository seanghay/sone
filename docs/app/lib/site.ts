// Centralized site metadata so canonical/OG URLs stay in sync.
export const SITE_URL = 'https://sone.seanghay.com';

export function ogImagePath(slugs: string[]): string {
  const path = slugs.length ? slugs.join('/') : 'index';
  return `/og/docs/${path}.jpg`;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
