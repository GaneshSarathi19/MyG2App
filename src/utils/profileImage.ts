const DATA_URI_PREFIX = 'data:image/jpeg;base64,';

/**
 * Normalizes a profile picture value from the API into a usable image URI.
 *
 * - null / empty → null
 * - already a data URI or http URL → returned as-is
 * - raw base64 string → prepends `data:image/jpeg;base64,`
 */
export const getProfileImageUri = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:') || trimmed.startsWith('http')) {
    return trimmed;
  }

  return `${DATA_URI_PREFIX}${trimmed}`;
};
