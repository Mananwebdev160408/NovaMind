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
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string
    let text = '';
    for (let i = 0; i < uint8Array.length; i++) {
      text += String.fromCharCode(uint8Array[i]);
    }

    // Extract text between BT and ET tags (PDF text objects)
    const textMatches = text.match(/\(([^)]+)\)/g);
    
    if (!textMatches) {
      // Fallback: try to extract any ASCII text
      const asciiText = text.replace(/[^\x20-\x7E\n]/g, '');
      return asciiText.replace(/\s+/g, ' ').trim();
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
    // Remove XML tags
    const cleanText = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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
