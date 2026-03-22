/**
 * AI Utility Functions
 * Helper functions for working with RunAnywhere SDK
 */

import { TextGeneration } from '@runanywhere/web-llamacpp';
import { ModelManager, ModelCategory } from '@runanywhere/web';

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

/**
 * Generate text with the loaded LLM
 */
export async function generateText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<{ text: string; metrics: any }> {
  const result = await TextGeneration.generate(prompt, {
    maxTokens: options.maxTokens || 500,
    temperature: options.temperature || 0.7,
    systemPrompt: options.systemPrompt,
    stopSequences: options.stopSequences,
  });

  return {
    text: result.text,
    metrics: {
      tokensUsed: result.tokensUsed,
      tokensPerSecond: result.tokensPerSecond,
      latencyMs: result.latencyMs,
      modelUsed: result.modelUsed,
    },
  };
}

/**
 * Generate text with streaming
 */
export async function generateStreamingText(
  prompt: string,
  options: GenerateOptions = {},
  onToken: (token: string) => void
): Promise<{ text: string; metrics: any }> {
  const { stream, result } = await TextGeneration.generateStream(prompt, {
    maxTokens: options.maxTokens || 500,
    temperature: options.temperature || 0.7,
    systemPrompt: options.systemPrompt,
    stopSequences: options.stopSequences,
  });

  let fullText = '';
  for await (const token of stream) {
    fullText += token;
    onToken(token);
  }

  const metrics = await result;

  return {
    text: fullText,
    metrics: {
      tokensUsed: metrics.tokensUsed,
      tokensPerSecond: metrics.tokensPerSecond,
      latencyMs: metrics.latencyMs,
      modelUsed: metrics.modelUsed,
    },
  };
}

/**
 * Ensure an LLM model is loaded
 */
export async function ensureLLMLoaded(): Promise<void> {
  const models = ModelManager.getModels().filter((m) => m.modality === ModelCategory.Language);

  if (models.length === 0) {
    throw new Error('No LLM models registered');
  }

  const loadedModel = ModelManager.getLoadedModel(ModelCategory.Language);

  if (!loadedModel) {
    // Load the first available model
    const model = models[0];

    if (model.status !== 'downloaded') {
      await ModelManager.downloadModel(model.id);
    }

    await ModelManager.loadModel(model.id);
  }
}

/**
 * Calculate readability score (Flesch Reading Ease)
 */
export function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  return Math.max(0, Math.min(100, score));
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Detect passive voice in text
 */
export function detectPassiveVoice(text: string): string[] {
  const passivePatterns = [
    /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/gi,
    /\b(am|is|are|was|were|be|been|being)\s+\w+en\b/gi,
  ];

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const passiveSentences: string[] = [];

  for (const sentence of sentences) {
    for (const pattern of passivePatterns) {
      if (pattern.test(sentence)) {
        passiveSentences.push(sentence.trim());
        break;
      }
    }
  }

  return passiveSentences;
}

/**
 * Detect filler words
 */
export function detectFillerWords(text: string): Array<{ word: string; count: number }> {
  const fillerWords = ['very', 'really', 'just', 'quite', 'rather', 'somewhat', 'actually'];
  const results: Array<{ word: string; count: number }> = [];

  const words = text.toLowerCase().split(/\s+/);

  for (const filler of fillerWords) {
    const count = words.filter((w) => w === filler).length;
    if (count > 0) {
      results.push({ word: filler, count });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}

/**
 * Extract keywords from text using simple frequency analysis
 */
export function extractKeywords(text: string, limit: number = 5): string[] {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'should',
    'could',
    'may',
    'might',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'what',
    'which',
    'who',
    'when',
    'where',
    'why',
    'how',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const frequency: { [key: string]: number } = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'Just now';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Chunk text into smaller pieces for processing
 */
export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);

  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(' '));
    start = end - overlap;
    if (start >= words.length) break;
  }

  return chunks;
}

/**
 * Calculate similarity between two texts (simple Jaccard similarity)
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
