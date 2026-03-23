import React, { useState, useEffect, useCallback } from 'react';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelCategory } from '@runanywhere/web';
import { 
  generateStreamingText, 
  calculateReadabilityScore, 
  countWords,
  detectPassiveVoice,
  detectFillerWords,
} from '../lib/ai-utils';
import { api } from '../lib/api';
import { Button, Input, TextArea, Select, Badge, Toast, Card } from '../components/UI';

interface Draft {
  _id: string;
  title: string;
  content: string;
  mode: string;
  tone?: string;
  wordCount?: number;
  metrics?: any;
}

const TONES = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'concise', label: 'Concise' },
  { value: 'executive', label: 'Executive' },
];

const MODES = [
  { value: 'document', label: 'Document' },
  { value: 'email', label: 'Email' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'creative', label: 'Creative Writing' },
];

export function WritingAssistant() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraft, setActiveDraft] = useState<Draft | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [selectedMode, setSelectedMode] = useState('document');
  const [selectedTone, setSelectedTone] = useState('formal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const { state: modelState, ensure: ensureModel } = useModelLoader(ModelCategory.Language);

  // Metrics
  const words = countWords(content);
  const readability = Math.round(calculateReadabilityScore(content));
  const passiveCount = detectPassiveVoice(content).length;
  const fillerWords = detectFillerWords(content);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const data = await api.get('/writing');
      setDrafts(data);
      if (data.length > 0 && !activeDraft) {
        const first = data[0];
        setActiveDraft(first);
        setContent(first.content || '');
        setTitle(first.title || 'Untitled Document');
        setSelectedMode(first.mode || 'document');
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
      setToast({ message: 'Failed to load documents', type: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        title,
        content,
        mode: selectedMode,
        tone: selectedTone,
        metrics: { wordCount: words, readabilityScore: readability, passiveVoiceCount: passiveCount },
      };

      if (activeDraft?._id) {
        await api.put(`/writing/${activeDraft._id}`, data);
        setToast({ message: 'Document saved successfully', type: 'success' });
      } else {
        const newDraft = await api.post('/writing', data);
        setActiveDraft(newDraft);
        setToast({ message: 'Document created successfully', type: 'success' });
      }
      loadDrafts();
    } catch (err) {
      console.error('Save failed:', err);
      setToast({ message: 'Failed to save document', type: 'error' });
    }
  };

  const handleAIAction = async (action: string) => {
    if (isGenerating || !content) return;
    
    setIsGenerating(true);
    setStreamingText('');
    
    try {
      await ensureModel();
      
      let prompt = '';
      let systemPrompt = '';

      switch (action) {
        case 'transform-tone':
          systemPrompt = `You are a professional writing assistant. Transform the following text to have a ${selectedTone} tone while preserving the core message.`;
          prompt = content;
          break;
        case 'summarize':
          systemPrompt = 'You are a professional writing assistant. Create a concise summary (2-3 sentences) of the following text.';
          prompt = content;
          break;
        case 'expand':
          systemPrompt = 'You are a professional writing assistant. Expand the following text with more details, examples, and explanations while maintaining the same tone.';
          prompt = content;
          break;
        case 'improve':
          systemPrompt = 'You are a professional writing assistant. Improve the following text by fixing grammar, enhancing clarity, and strengthening the language.';
          prompt = content;
          break;
        case 'continue':
          systemPrompt = `You are a professional ${selectedMode} writer. Continue writing from where the text ends, maintaining the same style and tone.`;
          prompt = content;
          break;
      }

      const result = await generateStreamingText(
        prompt,
        { systemPrompt, temperature: 0.7, maxTokens: 500 },
        (token) => {
          setStreamingText(prev => prev + token);
        }
      );

      if (action === 'continue') {
        setContent(content + '\n\n' + result.text);
      } else {
        setContent(result.text);
      }
      
      setToast({ message: 'AI generation complete', type: 'success' });
    } catch (err) {
      console.error('AI action failed:', err);
      setToast({ message: 'AI generation failed. Make sure models are loaded.', type: 'error' });
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  };

  const handleNewDocument = () => {
    setActiveDraft(null);
    setContent('');
    setTitle('Untitled Document');
    setSelectedMode('document');
  };

  const handleSelectDraft = (draft: Draft) => {
    setActiveDraft(draft);
    setContent(draft.content || '');
    setTitle(draft.title || 'Untitled Document');
    setSelectedMode(draft.mode || 'document');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 320px', height: 'calc(100vh - 72px)', background: 'var(--bg-midnight)' }}>
      {/* Sidebar */}
      <aside style={{ borderRight: '1px solid var(--border-ghost)', padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>WRITING_MODULE</span>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '8px' }}>Cognitive Drafting</h3>
          <Badge variant={modelState === 'ready' ? 'success' : 'warning'} style={{ marginTop: '12px' }}>
            AI: {modelState.toUpperCase()}
          </Badge>
        </div>

        <Button variant="primary" size="md" style={{ width: '100%', marginBottom: '24px' }} onClick={handleNewDocument}>
          + New Document
        </Button>

        <div>
          <span className="mono" style={{ fontSize: '9px', opacity: 0.4, display: 'block', marginBottom: '12px' }}>
            YOUR_DOCUMENTS
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {drafts.map(draft => (
              <Card
                key={draft._id}
                hoverable
                onClick={() => handleSelectDraft(draft)}
                style={{
                  padding: '12px 16px',
                  background: activeDraft?._id === draft._id ? 'var(--accent-glow)' : 'var(--bg-surface)',
                  border: activeDraft?._id === draft._id ? '1px solid var(--accent-indigo)' : '1px solid var(--border-ghost)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  {draft.title}
                </div>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                  {draft.wordCount || 0} words • {draft.mode}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Editor */}
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title..."
            style={{ fontSize: '24px', fontWeight: 600, border: 'none', background: 'transparent', padding: '0 0 16px 0', marginBottom: '24px' }}
          />

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <Select
              label="MODE"
              options={MODES}
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            />
            <Select
              label="TONE"
              options={TONES}
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
            />
          </div>

          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your masterpiece..."
            style={{ 
              minHeight: '400px', 
              fontSize: '16px', 
              lineHeight: '1.8',
              border: '1px solid var(--border-ghost)',
              background: 'var(--bg-deep)',
            }}
          />

          {streamingText && (
            <div style={{ 
              marginTop: '16px', 
              padding: '16px', 
              background: 'var(--accent-glow)', 
              border: '1px solid var(--accent-indigo)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              <div className="mono" style={{ fontSize: '10px', marginBottom: '8px', color: 'var(--accent-indigo)' }}>
                AI_GENERATING...
              </div>
              {streamingText}
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={handleSave} disabled={isGenerating}>
              Save Document
            </Button>
            <Button variant="secondary" onClick={() => handleAIAction('improve')} disabled={isGenerating || !content} loading={isGenerating}>
              Improve Writing
            </Button>
            <Button variant="secondary" onClick={() => handleAIAction('transform-tone')} disabled={isGenerating || !content} loading={isGenerating}>
              Transform Tone
            </Button>
            <Button variant="ghost" onClick={() => handleAIAction('continue')} disabled={isGenerating || !content} loading={isGenerating}>
              Continue Writing
            </Button>
          </div>
        </div>
      </main>

      {/* Right Panel: Metrics & Actions */}
      <aside style={{ borderLeft: '1px solid var(--border-ghost)', padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '16px' }}>
            METRICS
          </span>
          
          <Card style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-indigo)' }}>{words}</div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>WORD_COUNT</div>
          </Card>

          <Card style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: readability >= 60 ? '#22c55e' : readability >= 40 ? '#fb923c' : '#ef4444' }}>
              {readability}
            </div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>READABILITY_SCORE</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {readability >= 60 ? 'Easy to read' : readability >= 40 ? 'Moderate' : 'Difficult'}
            </div>
          </Card>

          <Card style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: passiveCount === 0 ? '#22c55e' : passiveCount < 3 ? '#fb923c' : '#ef4444' }}>
              {passiveCount}
            </div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>PASSIVE_VOICE</div>
          </Card>

          {fillerWords.length > 0 && (
            <Card>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                FILLER_WORDS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {fillerWords.slice(0, 5).map(fw => (
                  <Badge key={fw.word} variant="warning">
                    {fw.word}: {fw.count}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '16px' }}>
            AI_ACTIONS
          </span>
          
          <Button 
            variant="secondary" 
            size="sm" 
            style={{ width: '100%', marginBottom: '8px' }}
            onClick={() => handleAIAction('summarize')}
            disabled={isGenerating || !content}
            loading={isGenerating}
          >
            Summarize
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            style={{ width: '100%', marginBottom: '8px' }}
            onClick={() => handleAIAction('expand')}
            disabled={isGenerating || !content}
            loading={isGenerating}
          >
            Expand Text
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            style={{ width: '100%' }}
            onClick={() => {
              navigator.clipboard.writeText(content);
              setToast({ message: 'Copied to clipboard', type: 'success' });
            }}
            disabled={!content}
          >
            Copy to Clipboard
          </Button>
        </div>
      </aside>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
