import { randomUUID } from 'node:crypto';

export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Single source of truth for which image types an avatar upload may be,
// and the file extension each maps to when building the object key.
export const AVATAR_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function buildAvatarKey(userId: string, contentType: string): string {
  const extension = AVATAR_CONTENT_TYPES[contentType];
  return `avatars/${userId}/${randomUUID()}.${extension}`;
}
