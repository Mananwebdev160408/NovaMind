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
  
  const { state: modelState, ensure: ensureModel } = useModelLoader(ModelCategory.Language);

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
      } else {
        const newDraft = await api.post('/writing', data);
        setActiveDraft(newDraft);
      }
      loadDrafts();
    } catch (err) {
      console.error('Save failed:', err);
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
    } catch (err) {
      console.error('AI action failed:', err);
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
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', height: '100%', background: 'var(--bg-app)' }}>
      {/* List Sidebar */}
      <aside style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>Documents</h3>
            <button onClick={handleNewDocument} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>+ New</button>
          </div>
          <div style={{ fontSize: '11px', color: modelState === 'ready' ? 'var(--success)' : 'var(--warning)', marginBottom: '16px', fontWeight: 600 }}>
             AI Status: {modelState === 'ready' ? 'Online' : 'Loading...'}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }}>
          {drafts.map(draft => (
            <div 
              key={draft._id}
              onClick={() => handleSelectDraft(draft)}
              className="card card-interactive"
              style={{ 
                padding: '16px', 
                marginBottom: '8px',
                background: activeDraft?._id === draft._id ? 'var(--bg-hover)' : 'transparent',
                borderColor: activeDraft?._id === draft._id ? 'var(--accent)' : 'var(--border)'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{draft.title || 'Untitled'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {draft.wordCount || 0} words • {draft.mode}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Editor Area */}
      <main style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <header style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, marginRight: '24px' }}>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title..."
              style={{ background: 'none', border: 'none', fontSize: '24px', fontWeight: 600, padding: '0', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button onClick={handleSave} className="btn btn-primary">Save Document</button>
          </div>
        </header>

        <div style={{ padding: '16px 40px', background: 'var(--bg-light)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Format</span>
              <select 
                value={selectedMode} 
                onChange={(e) => setSelectedMode(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px' }}
              >
                {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Tone</span>
              <select 
                value={selectedTone} 
                onChange={(e) => setSelectedTone(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px' }}
              >
                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
           </div>
        </div>

        <div style={{ flex: 1, padding: '40px', position: 'relative' }}>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            style={{ width: '100%', height: '100%', background: 'none', border: 'none', fontSize: '16px', lineHeight: '1.8', resize: 'none' }}
          />

          {streamingText && (
            <div className="card animate-in" style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'var(--bg' }}>
               <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>AI IS THINKING...</div>
               <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{streamingText}</div>
            </div>
          )}
        </div>

        <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
           <button onClick={() => handleAIAction('improve')} className="btn btn-secondary" disabled={isGenerating || !content}>Improve Clarity</button>
           <button onClick={() => handleAIAction('transform-tone')} className="btn btn-secondary" disabled={isGenerating || !content}>Shift Tone</button>
           <button onClick={() => handleAIAction('continue')} className="btn btn-ghost" disabled={isGenerating || !content}>Continue Text</button>
        </footer>
      </main>

      {/* Metrics Sidebar */}
      <aside style={{ borderLeft: '1px solid var(--border)', padding: '24px', background: 'var(--bg-app)' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' }}>Analysis</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{words}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Words</div>
          </div>

          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: readability >= 60 ? 'var(--success)' : 'var(--warning)' }}>{readability}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Readability</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{readability >= 60 ? 'Clear & simple' : 'Professional'}</div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
             <h4 style={{ fontSize: '12px', marginBottom: '12px' }}>AI Actions</h4>
             <button onClick={() => handleAIAction('summarize')} className="btn btn-secondary" style={{ width: '100%', marginBottom: '8px', fontSize: '12px' }} disabled={isGenerating || !content}>Summarize</button>
             <button onClick={() => handleAIAction('expand')} className="btn btn-secondary" style={{ width: '100%', marginBottom: '8px', fontSize: '12px' }} disabled={isGenerating || !content}>Expand</button>
             <button 
                onClick={() => { navigator.clipboard.writeText(content); }} 
                className="btn btn-ghost" 
                style={{ width: '100%', fontSize: '12px' }}
                disabled={!content}
             >Copy to Clipboard</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
