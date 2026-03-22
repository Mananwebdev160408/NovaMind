/**
 * IndexedDB Storage Layer for NovaMind
 * Handles all local data persistence using IndexedDB
 */

import type {
  Note,
  WritingDocument,
  ResearchDocument,
  Meeting,
  LanguagePractice,
  VocabularyWord,
  CodeAnalysis,
  FlashCard,
  DocumentQA,
  KnowledgeNode,
  KnowledgeEdge,
} from '../types';

const DB_NAME = 'NovaMindDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  NOTES: 'notes',
  WRITING: 'writing',
  DOCUMENTS: 'documents',
  MEETINGS: 'meetings',
  LANGUAGE: 'language',
  VOCABULARY: 'vocabulary',
  CODE: 'code',
  FLASHCARDS: 'flashcards',
  DOCUMENT_QA: 'document_qa',
  KNOWLEDGE_NODES: 'knowledge_nodes',
  KNOWLEDGE_EDGES: 'knowledge_edges',
  SETTINGS: 'settings',
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB with all required object stores
 */
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Notes store
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
        notesStore.createIndex('createdAt', 'createdAt');
        notesStore.createIndex('category', 'category');
        notesStore.createIndex('tags', 'tags', { multiEntry: true });
        notesStore.createIndex('isPinned', 'isPinned');
      }

      // Writing documents store
      if (!db.objectStoreNames.contains(STORES.WRITING)) {
        const writingStore = db.createObjectStore(STORES.WRITING, { keyPath: 'id' });
        writingStore.createIndex('createdAt', 'createdAt');
        writingStore.createIndex('mode', 'mode');
      }

      // Research documents store
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const docsStore = db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
        docsStore.createIndex('uploadedAt', 'uploadedAt');
        docsStore.createIndex('type', 'type');
      }

      // Meetings store
      if (!db.objectStoreNames.contains(STORES.MEETINGS)) {
        const meetingsStore = db.createObjectStore(STORES.MEETINGS, { keyPath: 'id' });
        meetingsStore.createIndex('startTime', 'startTime');
        meetingsStore.createIndex('status', 'status');
      }

      // Language practice store
      if (!db.objectStoreNames.contains(STORES.LANGUAGE)) {
        const langStore = db.createObjectStore(STORES.LANGUAGE, { keyPath: 'id' });
        langStore.createIndex('timestamp', 'timestamp');
        langStore.createIndex('language', 'language');
        langStore.createIndex('type', 'type');
      }

      // Vocabulary store
      if (!db.objectStoreNames.contains(STORES.VOCABULARY)) {
        const vocabStore = db.createObjectStore(STORES.VOCABULARY, { keyPath: 'id' });
        vocabStore.createIndex('language', 'language');
        vocabStore.createIndex('nextReview', 'nextReview');
      }

      // Code analysis store
      if (!db.objectStoreNames.contains(STORES.CODE)) {
        const codeStore = db.createObjectStore(STORES.CODE, { keyPath: 'id' });
        codeStore.createIndex('timestamp', 'timestamp');
        codeStore.createIndex('language', 'language');
        codeStore.createIndex('type', 'type');
      }

      // Flashcards store
      if (!db.objectStoreNames.contains(STORES.FLASHCARDS)) {
        const flashcardsStore = db.createObjectStore(STORES.FLASHCARDS, { keyPath: 'id' });
        flashcardsStore.createIndex('noteId', 'noteId');
        flashcardsStore.createIndex('nextReview', 'nextReview');
      }

      // Document Q&A store
      if (!db.objectStoreNames.contains(STORES.DOCUMENT_QA)) {
        const qaStore = db.createObjectStore(STORES.DOCUMENT_QA, { keyPath: 'id' });
        qaStore.createIndex('timestamp', 'timestamp');
        qaStore.createIndex('documentIds', 'documentIds', { multiEntry: true });
      }

      // Knowledge graph nodes store
      if (!db.objectStoreNames.contains(STORES.KNOWLEDGE_NODES)) {
        const nodesStore = db.createObjectStore(STORES.KNOWLEDGE_NODES, { keyPath: 'id' });
        nodesStore.createIndex('type', 'type');
      }

      // Knowledge graph edges store
      if (!db.objectStoreNames.contains(STORES.KNOWLEDGE_EDGES)) {
        const edgesStore = db.createObjectStore(STORES.KNOWLEDGE_EDGES, { keyPath: 'id' });
        edgesStore.createIndex('source', 'source');
        edgesStore.createIndex('target', 'target');
        edgesStore.createIndex('type', 'type');
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

// ========== Generic CRUD Operations ==========

export async function create<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function read<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function update<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function count(storeName: string): Promise<number> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clear(storeName: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ========== Specialized queries ==========

export async function searchNotes(query: string): Promise<Note[]> {
  const allNotes = await getAll<Note>(STORES.NOTES);
  const lowerQuery = query.toLowerCase();

  return allNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export async function getPinnedNotes(): Promise<Note[]> {
  return getAllByIndex<Note>(STORES.NOTES, 'isPinned', true);
}

export async function getNotesByCategory(category: string): Promise<Note[]> {
  return getAllByIndex<Note>(STORES.NOTES, 'category', category);
}

export async function getRecentMeetings(limit: number = 10): Promise<Meeting[]> {
  const allMeetings = await getAll<Meeting>(STORES.MEETINGS);
  return allMeetings
    .sort((a, b) => b.startTime - a.startTime)
    .slice(0, limit);
}

export async function getVocabularyDueForReview(): Promise<VocabularyWord[]> {
  const allVocab = await getAll<VocabularyWord>(STORES.VOCABULARY);
  const now = Date.now();
  return allVocab.filter((word) => word.nextReview <= now);
}

export async function getStorageStats() {
  const [
    notesCount,
    writingCount,
    documentsCount,
    meetingsCount,
  ] = await Promise.all([
    count(STORES.NOTES),
    count(STORES.WRITING),
    count(STORES.DOCUMENTS),
    count(STORES.MEETINGS),
  ]);

  return {
    notesCount,
    writingCount,
    documentsCount,
    meetingsCount,
    totalItems: notesCount + writingCount + documentsCount + meetingsCount,
  };
}

// ========== Settings ==========

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error);
  });
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.put({ key, value });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ========== Export/Import ==========

export async function exportAllData(): Promise<string> {
  const data: any = {};

  for (const storeName of Object.values(STORES)) {
    data[storeName] = await getAll(storeName);
  }

  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);

  for (const storeName of Object.values(STORES)) {
    if (data[storeName] && Array.isArray(data[storeName])) {
      await clear(storeName);
      for (const item of data[storeName]) {
        await create(storeName, item);
      }
    }
  }
}

export async function clearAllData(): Promise<void> {
  for (const storeName of Object.values(STORES)) {
    await clear(storeName);
  }
}
