/**
 * Document Utilities
 * Functions for handling document uploads and text extraction
 */

/**
 * Read file as text
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Read file as array buffer
 */
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Simple PDF text extraction
 * Note: This is a basic implementation. For production, consider using pdf.js
 */
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5 MB safety limit for regex processing

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const uint8Array = new Uint8Array(arrayBuffer);

    // Safety: reject files too large for in-browser regex processing
    if (uint8Array.length > MAX_PDF_SIZE) {
      return `PDF is too large for browser-based extraction (${(uint8Array.length / 1024 / 1024).toFixed(1)} MB). Max supported: 5 MB. Please use a smaller file or a plain-text export.`;
    }

    // Use TextDecoder instead of byte-by-byte string concatenation (avoids stack overflow)
    const decoder = new TextDecoder('latin1');
    const text = decoder.decode(uint8Array);

    // Extract text between parentheses (PDF text objects)
    const textMatches = text.match(/\(([^)]+)\)/g);
    
    if (!textMatches) {
      // Fallback: extract printable ASCII characters only
      // Process in chunks to avoid regex stack overflow on large binary data
      let asciiText = '';
      const CHUNK = 50000;
      for (let i = 0; i < text.length; i += CHUNK) {
        const slice = text.slice(i, i + CHUNK);
        asciiText += slice.replace(/[^\x20-\x7E\n]/g, '');
      }
      return asciiText.replace(/\s+/g, ' ').trim() || 'Unable to extract text from PDF. The PDF might be image-based or encrypted.';
    }

    const extractedText = textMatches
      .map(match => match.slice(1, -1)) // Remove parentheses
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return extractedText || 'Unable to extract text from PDF. The PDF might be image-based or encrypted.';
  } catch (error) {
    console.error('PDF extraction error:', error);
    return 'Error extracting text from PDF. Please try a different file.';
  }
}

/**
 * Extract text from DOCX (basic implementation)
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const text = await readFileAsText(file);

    // Safety: limit the size we run regex on
    const safeText = text.length > MAX_PDF_SIZE ? text.slice(0, MAX_PDF_SIZE) : text;

    // Remove XML tags — process in chunks to prevent regex stack overflow
    let cleanText = '';
    const CHUNK = 50000;
    for (let i = 0; i < safeText.length; i += CHUNK) {
      const slice = safeText.slice(i, i + CHUNK);
      cleanText += slice.replace(/<[^>]*>/g, ' ');
    }
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    return cleanText || 'Unable to extract text from DOCX file.';
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return 'Error extracting text from DOCX. Please try a different file.';
  }
}

/**
 * Extract text from any supported document type
 */
export async function extractTextFromDocument(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
    case 'md':
      return readFileAsText(file);
    case 'pdf':
      return extractTextFromPDF(file);
    case 'docx':
    case 'doc':
      return extractTextFromDOCX(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Validate file type
 */
export function isValidDocumentType(file: File): boolean {
  const validTypes = ['txt', 'md', 'pdf', 'doc', 'docx'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  return validTypes.includes(extension || '');
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
