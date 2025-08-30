/**
 * Hostinger utilities for media URL handling
 */

/**
 * Build a full media URL for files hosted on Hostinger
 * @param {"audio"|"video"|"book"|"thumbnail"|string} contentType
 * @param {string} dialect
 * @param {string} filename
 * @param {{ baseUrl?: string, mediaUrl: string, apiUrl?: string }} hostinger
 * @returns {string}
 */
export function getHostingerMediaUrl(contentType, dialect, filename, hostinger) {
  if (!hostinger || !hostinger.mediaUrl) {
    throw new Error("Missing Hostinger mediaUrl in configuration");
  }
  const safeDialect = encodeURIComponent(String(dialect || "generic"));
  const safeType = encodeURIComponent(String(contentType || "thumbnails"));
  const safeFilename = encodeURIComponent(String(filename || "file"));
  return `${hostinger.mediaUrl.replace(/\/$/, "")}/${safeType}/${safeDialect}/${safeFilename}`;
}

/**
 * Convert a Supabase storage-like path to a full Hostinger media URL
 * Accepts either a full URL or a relative path; full URLs are returned as-is.
 * @param {string} supabasePath
 * @param {{ baseUrl?: string, mediaUrl: string, apiUrl?: string }} hostinger
 * @returns {string}
 */
export function convertSupabaseToHostinger(supabasePath, hostinger) {
  if (!supabasePath) return "";
  if (supabasePath.startsWith("http://") || supabasePath.startsWith("https://")) {
    return supabasePath;
  }
  // Strip common Supabase public prefixes if present
  let clean = supabasePath
    .replace(/^\/?storage\/v1\/object\/public\//, "")
    .replace(/^\/?public\//, "")
    .replace(/^\/+/, "");

  // If path already looks like type/dialect/file, just append to mediaUrl
  return `${hostinger.mediaUrl.replace(/\/$/, "")}/${clean}`;
}
