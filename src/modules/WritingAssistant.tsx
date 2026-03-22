/**
 * Module 1: Smart Writing Assistant
 * Features: Multi-mode generation, tone transformer, autocomplete, expand/compress
 */

import { useState, useEffect, useRef } from 'react';
import { generateStreamingText, calculateReadabilityScore, countWords, detectPassiveVoice, detectFillerWords, generateId } from '../lib/ai-utils';
import { create, update, getAll, STORES } from '../lib/storage';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelCategory } from '../runanywhere';
import type { WritingDocument, WritingMode, ToneType } from '../types';

export function WritingAssistant() {
  const [documents, setDocuments] = useState<WritingDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<WritingDocument | null>(null);
  const [mode, setMode] = useState<WritingMode>('document');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [passiveVoice, setPassiveVoice] = useState<string[]>([]);
  const [fillerWords, setFillerWords] = useState<Array<{ word: string; count: number }>>([]);
  const [showInsights, setShowInsights] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use the model loader hook
  const { state: modelState, ensure: ensureModel } = useModelLoader(ModelCategory.Language);
  const isModelReady = modelState === 'ready';

  useEffect(() => {
    loadDocuments();
    ensureModel(); // Load model on mount
  }, [ensureModel]);

  useEffect(() => {
    // Calculate writing metrics
    if (content) {
      setReadabilityScore(calculateReadabilityScore(content));
      setWordCount(countWords(content));
      setPassiveVoice(detectPassiveVoice(content));
      setFillerWords(detectFillerWords(content));
    } else {
      setReadabilityScore(0);
      setWordCount(0);
      setPassiveVoice([]);
      setFillerWords([]);
    }
  }, [content]);

  async function loadDocuments() {
    const docs = await getAll<WritingDocument>(STORES.WRITING);
    setDocuments(docs.sort((a, b) => b.updatedAt - a.updatedAt));
  }

  async function saveDocument() {
    if (!content.trim()) return;

    const doc: WritingDocument = currentDoc
      ? {
          ...currentDoc,
          content,
          updatedAt: Date.now(),
          wordCount: countWords(content),
          readabilityScore: calculateReadabilityScore(content),
        }
      : {
          id: generateId(),
          title: content.slice(0, 50).trim() || 'Untitled Document',
          content,
          mode,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          wordCount: countWords(content),
          readabilityScore: calculateReadabilityScore(content),
          versions: [],
        };

    if (currentDoc) {
      await update(STORES.WRITING, doc);
    } else {
      await create(STORES.WRITING, doc);
    }

    setCurrentDoc(doc);
    loadDocuments();
  }

  function newDocument() {
    setCurrentDoc(null);
    setContent('');
  }

  async function generateText(prompt: string) {
    setIsGenerating(true);
    try {
      const systemPrompt = getModeSystemPrompt(mode);
      await generateStreamingText(
        prompt,
        { maxTokens: 500, temperature: 0.7, systemPrompt },
        (token) => {
          setContent((prev) => prev + token);
        }
      );
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating text. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function transformTone(tone: ToneType) {
    if (!content.trim()) return;

    setIsGenerating(true);
    setShowToneMenu(false);

    try {
      const prompt = `Rewrite the following text in a ${tone} tone. Keep the meaning the same but adjust the style:\n\n${content}`;
      const systemPrompt = `You are an expert writing assistant specializing in tone transformation. Output ONLY the rewritten text, no explanations.`;

      let newContent = '';
      await generateStreamingText(
        prompt,
        { maxTokens: 800, temperature: 0.7, systemPrompt },
        (token) => {
          newContent += token;
        }
      );

      setContent(newContent);
    } catch (error) {
      console.error('Tone transformation error:', error);
      alert('Error transforming tone. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function expandText() {
    const selection = getSelectedText();
    if (!selection) {
      alert('Please select text to expand');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Expand the following text into a more detailed version with additional context and examples. Keep the core meaning:\n\n${selection}`;
      const systemPrompt = 'You are a writing assistant. Expand the text naturally and thoroughly.';

      let expanded = '';
      await generateStreamingText(
        prompt,
        { maxTokens: 600, temperature: 0.7, systemPrompt },
        (token) => {
          expanded += token;
        }
      );

      replaceSelection(expanded);
    } catch (error) {
      console.error('Expand error:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  async function compressText() {
    const selection = getSelectedText();
    if (!selection) {
      alert('Please select text to compress');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Compress the following text into a single concise sentence while keeping the key point:\n\n${selection}`;
      const systemPrompt = 'You are a writing assistant. Be extremely concise.';

      let compressed = '';
      await generateStreamingText(
        prompt,
        { maxTokens: 100, temperature: 0.5, systemPrompt },
        (token) => {
          compressed += token;
        }
      );

      replaceSelection(compressed);
    } catch (error) {
      console.error('Compress error:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  function getSelectedText(): string {
    if (!textareaRef.current) return '';
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    return content.substring(start, end);
  }

  function replaceSelection(newText: string) {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    setContent(before + newText + after);
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>✍️ Writing Assistant</h2>
        <p>AI-powered writing with tone transformation, expansion, and readability analysis</p>
      </div>

      <div className="module-toolbar">
        <select
          className="select"
          value={mode}
          onChange={(e) => setMode(e.target.value as WritingMode)}
          disabled={isGenerating}
        >
          <option value="document">Document</option>
          <option value="email">Email</option>
          <option value="blog">Blog Post</option>
          <option value="creative">Creative Writing</option>
        </select>

        <button className="btn btn-sm" onClick={() => setShowToneMenu(!showToneMenu)} disabled={isGenerating || !content || !isModelReady}>
          🎭 Transform Tone
        </button>

        <button className="btn btn-sm" onClick={expandText} disabled={isGenerating || !isModelReady}>
          ➕ Expand
        </button>

        <button className="btn btn-sm" onClick={compressText} disabled={isGenerating || !isModelReady}>
          ➖ Compress
        </button>

        <button className="btn btn-sm" onClick={() => setShowInsights(!showInsights)}>
          📊 {showInsights ? 'Hide' : 'Show'} Insights
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={newDocument} disabled={isGenerating}>
            📄 New
          </button>
          <button className="btn btn-sm btn-primary" onClick={saveDocument} disabled={isGenerating || !content}>
            💾 Save
          </button>
        </div>
      </div>

      {showToneMenu && (
        <div className="module-toolbar" style={{ background: 'var(--bg-card)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Select tone:</span>
          {(['formal', 'casual', 'persuasive', 'empathetic', 'concise', 'executive'] as ToneType[]).map((tone) => (
            <button key={tone} className="btn btn-sm" onClick={() => transformTone(tone)} disabled={isGenerating}>
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </button>
          ))}
        </div>
      )}

      {showInsights && content && (
        <div className="module-toolbar" style={{ background: 'var(--bg-card)', flexWrap: 'wrap' }}>
          <div className="metric-inline">
            <strong>{wordCount}</strong> words
          </div>
          <div className="metric-inline">
            <strong>{readabilityScore.toFixed(0)}</strong> readability
          </div>
          {passiveVoice.length > 0 && (
            <div className="metric-inline" style={{ color: 'var(--primary)' }}>
              {passiveVoice.length} passive voice
            </div>
          )}
          {fillerWords.length > 0 && (
            <div className="metric-inline" style={{ color: 'var(--primary)' }}>
              {fillerWords.reduce((sum, f) => sum + f.count, 0)} filler words
            </div>
          )}
        </div>
      )}

      <div className="module-content" style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 2 }}>
          <textarea
            ref={textareaRef}
            className="editor"
            style={{ width: '100%', minHeight: '400px', flex: 1 }}
            placeholder={`Start writing your ${mode}... or use the AI to generate content.`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isGenerating}
          />

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              className="input"
              type="text"
              placeholder="Describe what you want to write..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  generateText(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              disabled={isGenerating || !isModelReady}
            />
            <button
              className="btn btn-primary"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input.value.trim()) {
                  generateText(input.value);
                  input.value = '';
                }
              }}
              disabled={isGenerating || !isModelReady}
            >
              {!isModelReady ? '⏳ Loading Model...' : isGenerating ? '⏳ Generating...' : '✨ Generate'}
            </button>
          </div>
        </div>

        {documents.length > 0 && (
          <div style={{ flex: 1, maxWidth: '250px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Recent Documents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.slice(0, 10).map((doc) => (
                <button
                  key={doc.id}
                  className="module-card"
                  style={{ cursor: 'pointer', padding: '10px', textAlign: 'left' }}
                  onClick={() => {
                    setCurrentDoc(doc);
                    setContent(doc.content);
                    setMode(doc.mode);
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{doc.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {doc.wordCount} words • {new Date(doc.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getModeSystemPrompt(mode: WritingMode): string {
  switch (mode) {
    case 'email':
      return 'You are a professional email writing assistant. Write clear, concise, and appropriate emails.';
    case 'blog':
      return 'You are a blog writing assistant. Write engaging, informative blog posts with good structure.';
    case 'creative':
      return 'You are a creative writing assistant. Write imaginative, vivid, and compelling prose.';
    case 'document':
    default:
      return 'You are a professional document writing assistant. Write clear, well-structured documents.';
  }
}
