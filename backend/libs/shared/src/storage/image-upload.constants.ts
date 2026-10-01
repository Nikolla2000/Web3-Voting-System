import { randomUUID } from 'node:crypto';

export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Single source of truth for which image types an upload may be, and the
// file extension each maps to when building the object key. Shared by
// avatars and poll cover images — same constraints, different key prefixes.
export const IMAGE_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function buildObjectKey(prefix: string, contentType: string): string {
  const extension = IMAGE_CONTENT_TYPES[contentType];
  return `${prefix}/${randomUUID()}.${extension}`;
}
