import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const COMPRESSION_PREFIX = '__gz__';

/**
 * Compresses a string using gzip and returns a base64 encoded string with a prefix.
 * @param {string} text - The text to compress.
 * @returns {Promise<string>} - The compressed base64 string.
 */
export async function compressText(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Only compress if text is reasonably large to avoid overhead
  if (text.length < 100) return text;

  try {
    const buffer = await gzip(text);
    return COMPRESSION_PREFIX + buffer.toString('base64');
  } catch (error) {
    console.error('Compression error:', error);
    return text; // Fallback to original text
  }
}

/**
 * Decompresses a string if it has the compression prefix.
 * @param {string} text - The text to decompress.
 * @returns {Promise<string>} - The decompressed string.
 */
export async function decompressText(text) {
  if (!text || typeof text !== 'string' || !text.startsWith(COMPRESSION_PREFIX)) {
    return text;
  }

  try {
    const base64Data = text.slice(COMPRESSION_PREFIX.length);
    const buffer = Buffer.from(base64Data, 'base64');
    const decompressed = await gunzip(buffer);
    return decompressed.toString();
  } catch (error) {
    console.error('Decompression error:', error);
    return text; // Return as is if decompression fails
  }
}
