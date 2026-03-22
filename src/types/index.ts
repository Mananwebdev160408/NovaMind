/**
 * Shared TypeScript types for NovaMind application
 */

// ========== Module 1: Writing Assistant ==========
export interface WritingDocument {
  id: string;
  title: string;
  content: string;
  mode: WritingMode;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  readabilityScore?: number;
  versions: WritingVersion[];
}

export type WritingMode = 'email' | 'document' | 'blog' | 'creative';

export type ToneType = 'formal' | 'casual' | 'persuasive' | 'empathetic' | 'concise' | 'executive';

export interface WritingVersion {
  id: string;
  content: string;
  timestamp: number;
  changeDescription?: string;
}

export interface WritingTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
}

// ========== Module 2: Notes ==========
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: NoteCategory;
  createdAt: number;
  updatedAt: number;
  summary?: string;
  linkedNotes: string[]; // Note IDs
  isPinned: boolean;
  isFavorite: boolean;
}

export type NoteCategory = 'meeting' | 'idea' | 'research' | 'task' | 'personal' | 'other';

export interface FlashCard {
  id: string;
  noteId: string;
  question: string;
  answer: string;
  nextReview: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

// ========== Module 3: Language Learning ==========
export interface LanguagePractice {
  id: string;
  language: string;
  type: 'pronunciation' | 'conversation' | 'grammar' | 'vocabulary';
  content: string;
  userResponse?: string;
  aiResponse?: string;
  score?: number;
  feedback?: string;
  timestamp: number;
}

export interface VocabularyWord {
  id: string;
  word: string;
  language: string;
  translation: string;
  exampleSentence: string;
  difficulty: number;
  nextReview: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

// ========== Module 4: Document Research ==========
export interface ResearchDocument {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  size: number;
  uploadedAt: number;
  content: string;
  chunks: DocumentChunk[];
  entities: ExtractedEntity[];
  summary?: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  page?: number;
  section?: string;
  embedding?: number[];
}

export interface ExtractedEntity {
  type: 'person' | 'organization' | 'date' | 'location' | 'other';
  value: string;
  context: string;
}

export interface DocumentQA {
  id: string;
  documentIds: string[];
  question: string;
  answer: string;
  citations: Citation[];
  timestamp: number;
}

export interface Citation {
  documentId: string;
  page?: number;
  section?: string;
  excerpt: string;
}

// ========== Module 5: Code Engine ==========
export interface CodeAnalysis {
  id: string;
  code: string;
  language: string;
  type: 'explain' | 'document' | 'review' | 'test' | 'translate';
  result: string;
  complexity?: number;
  issues?: CodeIssue[];
  timestamp: number;
}

export interface CodeIssue {
  type: 'complexity' | 'smell' | 'security' | 'performance';
  line?: number;
  description: string;
  suggestion?: string;
}

// ========== Module 6: Meeting Transcription ==========
export interface Meeting {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  transcript: TranscriptSegment[];
  actionItems: ActionItem[];
  decisions: Decision[];
  summary?: string;
  status: 'recording' | 'completed';
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: number;
  confidence?: number;
}

export interface ActionItem {
  id: string;
  description: string;
  owner?: string;
  deadline?: string;
  completed: boolean;
}

export interface Decision {
  id: string;
  description: string;
  timestamp: number;
  context?: string;
}

// ========== Module 7: Knowledge Graph ==========
export interface KnowledgeNode {
  id: string;
  type: 'note' | 'document' | 'meeting' | 'concept';
  label: string;
  data: any;
  x?: number;
  y?: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'reference' | 'related' | 'derived' | 'contains';
  weight: number;
}

// ========== Privacy & Storage ==========
export interface StorageStats {
  totalSize: number;
  notesCount: number;
  documentsCount: number;
  meetingsCount: number;
  modelsDownloaded: string[];
  lastBackup?: number;
}

export interface PrivacySettings {
  encryptionEnabled: boolean;
  passphrase?: string;
  autoLock: boolean;
  lockTimeout: number; // minutes
}

// ========== AI Generation ==========
export interface GenerationMetrics {
  tokensUsed: number;
  tokensPerSecond: number;
  latencyMs: number;
  modelUsed: string;
}

export interface StreamingState {
  isStreaming: boolean;
  currentText: string;
  metrics?: GenerationMetrics;
}
