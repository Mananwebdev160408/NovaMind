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
    <div className="writing-v2-container">
      {/* Left Navigation Sidebar */}
      <aside className="writing-nav-sidebar">
        <div className="spectral-brand">
          <div className="spectral-logo">🧠</div>
          <div className="spectral-info">
            <h3>Spectral Engine</h3>
            <span>V4.2 ACTIVE</span>
          </div>
        </div>

        <button className="btn-new-draft" onClick={newDocument}>
          + New Draft
        </button>

        <nav className="writing-nav-items">
          <div className="nav-item-v2 active">
            <span>✍️</span> Writer
          </div>
          <div className="nav-item-v2" onClick={() => setShowInsights(!showInsights)}>
            <span>📊</span> Neural Insights
          </div>
        </nav>

        <div className="writing-nav-footer">
          <a href="#" className="nav-footer-link">
            <span className="nav-footer-icon">?</span> Support
          </a>
          <a href="#" className="nav-footer-link">
            <span className="nav-footer-icon code">{'<>'}</span> API
          </a>
        </div>
      </aside>

      {/* Main Editor Section */}
      <main className="writing-editor-main">
        <div className="writing-top-bar">
          <div className="writing-title-area">
            <h2>Writing Assistant</h2>
            <span className="gpu-badge">WEBGPU ENABLED</span>
          </div>
          <div className="writing-top-actions">
            <button className="btn btn-sm btn-primary" onClick={saveDocument} disabled={isGenerating || !content}>
              💾 Save
            </button>
            <button className="btn btn-sm btn-outline" onClick={expandText} disabled={isGenerating || !isModelReady}>
              ➕ Expand
            </button>
            <button className="btn btn-sm btn-outline" onClick={compressText} disabled={isGenerating || !isModelReady}>
              ➖ Compress
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => setShowToneMenu(!showToneMenu)}>
              🎭 Transform Tone ▾
            </button>
            <div className="toggle-group">
              <span>Show Insights</span>
              <input 
                type="checkbox" 
                checked={showInsights} 
                onChange={() => setShowInsights(!showInsights)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        <div className="editor-surface">
          <div className="editor-container-v2">
            <div className="editor-breadcrumb">
              DRAFTING • {currentDoc?.title || 'MY NEW PROJECT'}
            </div>
            <input
              className="editor-heading-v2"
              placeholder="The Neural Interface Revolution"
              value={currentDoc?.title || ''}
              onChange={(e) => {
                if (currentDoc) {
                  setCurrentDoc({ ...currentDoc, title: e.target.value });
                }
              }}
            />
            <textarea
              ref={textareaRef}
              className="editor-body-v2"
              placeholder="Start writing your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Floating Prompt Bar */}
          <div className="writing-v2-prompt-bar">
            <div className="prompt-input-row">
              <span className="prompt-icon">✨</span>
              <input
                className="prompt-input-v2"
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
                className="btn-generate-v2"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input.value.trim()) {
                    generateText(input.value);
                    input.value = '';
                  }
                }}
                disabled={isGenerating || !isModelReady}
              >
                {isGenerating ? '⏳' : 'Generate >'}
              </button>
            </div>
            <div className="prompt-footer-v2">
              <div className="prompt-info-tag">⚡ Ultra Low Latency</div>
              <div className="prompt-info-tag">🔒 Privacy Focused</div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Insights Sidebar */}
      {showInsights && (
        <aside className="writing-insights-sidebar">
          <div className="insights-section">
            <span className="insights-label">INTELLIGENCE METRICS</span>
            <div className="metric-v2">
              <div className="metric-v2-header">
                <span>Clarity</span>
                <span>{readabilityScore.toFixed(0)}%</span>
              </div>
              <div className="metric-v2-bar">
                <div 
                  className="metric-v2-fill" 
                  style={{ width: `${Math.min(readabilityScore, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="metric-v2">
              <div className="metric-v2-header">
                <span>Sentiment</span>
                <span style={{ color: 'var(--primary)' }}>Analytic</span>
              </div>
              <div className="metric-v2-bar">
                <div className="metric-v2-fill" style={{ width: '70%', background: 'var(--primary)' }}></div>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <div className="metric-cards-row">
              <div className="metric-card-v2">
                <div className="metric-card-label">Words</div>
                <div className="metric-card-value">{wordCount.toLocaleString()}</div>
              </div>
              <div className="metric-card-v2">
                <div className="metric-card-label">Read Time</div>
                <div className="metric-card-value">{Math.ceil(wordCount / 200)}m</div>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <span className="insights-label">AI SUGGESTIONS</span>
            <div className="ai-suggestion-card">
              <div className="suggestion-type">✨ Better Flow</div>
              <div className="suggestion-text-v2">
                Consider merging the first two paragraphs to maintain a stronger narrative momentum.
              </div>
            </div>
            <div className="vocab-card">
              <div className="suggestion-type">📖 Vocabulary</div>
              <div className="suggestion-text-v2">
                "Paradigm shift" is used frequently. Try "Fundamental reconfiguration".
              </div>
            </div>
          </div>

          <div className="engine-load-visual">
            <div className="engine-load-label">
              <span>Engine Load</span>
              <span style={{ color: 'var(--green)' }}>Minimal</span>
            </div>
            <div className="metric-v2-bar">
              <div className="metric-v2-fill" style={{ width: '15%', background: 'var(--green)' }}></div>
            </div>
          </div>
        </aside>
      )}
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
