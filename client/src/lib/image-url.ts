/**
 * Converts an Unsplash photo page URL to a direct CDN image URL.
 * Input:  https://unsplash.com/photos/some-slug-PHOTOID
 * Output: https://images.unsplash.com/photo-PHOTOID?auto=format&fit=crop&w=1200&q=80
 *
 * If the URL is already a direct image URL (or not Unsplash at all) it is
 * returned unchanged.
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Unsplash photo page  →  direct CDN URL
    if (
      parsed.hostname === 'unsplash.com' &&
      parsed.pathname.startsWith('/photos/')
    ) {
      // pathname is like /photos/some-title-words-PHOTOID
      const slug = parsed.pathname.replace('/photos/', '');
      // The photo ID is the last hyphen-delimited segment
      const parts = slug.split('-');
      const photoId = parts[parts.length - 1];
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;
    }
  } catch {
    // not a valid URL — fall through
  }

  return url;
}
