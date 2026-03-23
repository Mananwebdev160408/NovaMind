import React, { useState, useEffect } from 'react';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelCategory } from '@runanywhere/web';
import { generateStreamingText } from '../lib/ai-utils';
import { api } from '../lib/api';
import { ResearchDocument } from '../types';

export function DocumentResearch() {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<ResearchDocument | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { state: modelState, ensure: ensureModel } = useModelLoader(ModelCategory.Language);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await api.get('/documents');
      // Map _id to id for frontend
      const mappedDocs = docs.map((d: any) => ({ ...d, id: d._id }));
      setDocuments(mappedDocs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const docData: any = {
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
        size: file.size,
        content: content,
        chunks: [],
        entities: []
      };

      try {
        const savedDoc = await api.post('/documents', docData);
        loadDocuments();
        setActiveDoc({ ...savedDoc, id: savedDoc._id });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleAsk = async () => {
    if (!activeDoc || !question.trim() || isAnalyzing) return;

    const ok = await ensureModel();
    if (!ok) return;

    setIsAnalyzing(true);
    setAnswer('');
    
    const prompt = `Based on the following document content, answer the question accurately:\n\nDOCUMENT:\n${activeDoc.content}\n\nQUESTION: ${question}`;

    try {
      await generateStreamingText(prompt, { temperature: 0.2 }, (token) => {
        setAnswer(prev => prev + token);
      });
    } catch (err) {
      console.error('Q&A failed:', err);
      setAnswer('I encountered an error analyzing this document.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectDoc = async (id: string) => {
    try {
      const fullDoc = await api.get(`/documents/${id}`);
      setActiveDoc({ ...fullDoc, id: fullDoc._id });
      setAnswer('');
    } catch (err) {
      console.error('Failed to load document content:', err);
    }
  };

  return (
    <div className="dossier-grid" style={{ background: 'var(--bg-midnight)' }}>
      <aside style={{ padding: '48px 32px', borderRight: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '64px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>MODULE_SECTION</span>
          <h3 style={{ fontSize: '24px', fontWeight: 600, marginTop: '8px' }}>Research Core</h3>
          <div className="mono" style={{ fontSize: '9px', marginTop: '8px', color: modelState === 'ready' ? 'var(--accent-indigo)' : 'var(--text-muted)' }}>
            INDEXER: {modelState.toUpperCase()}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="mono" style={{ fontSize: '10px', opacity: 0.4, marginBottom: '16px' }}>KNOWLEDGE_BASE</span>
          {documents.map(doc => (
            <button 
              key={doc.id}
              onClick={() => handleSelectDoc(doc.id)}
              className="mono" 
              style={{ 
                background: activeDoc?.id === doc.id ? 'var(--bg-surface)' : 'none', 
                border: `1px solid ${activeDoc?.id === doc.id ? 'var(--accent-indigo)' : 'var(--border-ghost)'}`, 
                color: activeDoc?.id === doc.id ? 'var(--text-primary)' : 'var(--text-muted)', 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontSize: '10px',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {doc.name}
            </button>
          ))}
          {documents.length === 0 && <div className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)', padding: '0 16px', opacity: 0.4 }}>No documents stored.</div>}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
           <label className="btn-premium" style={{ width: '100%', cursor: 'pointer', display: 'block', textAlign: 'center' }}>
             + Upload Protocol
             <input type="file" accept=".txt,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
           </label>
        </div>
      </aside>

      <main className="flex-column" style={{ padding: '0' }}>
         <header style={{ padding: '32px clamp(24px, 5vw, 64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-ghost)' }}>
          <div>
            <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>ACTIVE_ANALYSIS</span>
            <h1 style={{ fontSize: '32px', marginTop: '8px' }}>{activeDoc?.name || 'Knowledge Analysis'}</h1>
          </div>
          <button className="btn-premium secondary" style={{ padding: '6px 20px', fontSize: '10px' }}>Global Scan</button>
        </header>

        <section style={{ flex: 1, padding: 'clamp(24px, 5vw, 64px)', overflowY: 'auto' }}>
           {activeDoc ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(32px, 5vw, 64px)' }}>
                <div style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-primary)', maxHeight: '600px', overflowY: 'auto', fontWeight: 300 }}>
                  "{activeDoc.content.slice(0, 1000)}..."
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                   <div className="glass-panel" style={{ padding: '32px' }}>
                      <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>NEURAL_QUERY</span>
                      <textarea 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Interrogate document..."
                        style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--border-ghost)', color: 'var(--text-primary)', marginTop: '24px', fontSize: '15px', outline: 'none', resize: 'none', paddingBottom: '12px' }}
                      />
                      <button 
                        onClick={handleAsk}
                        disabled={isAnalyzing || !question.trim()}
                        className="mono" 
                        style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', marginTop: '24px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}
                      >
                        [ {isAnalyzing ? 'THINKING...' : 'EXECUTE_QUERY'} ]
                      </button>
                   </div>
                   {answer && (
                     <div className="glass-panel fade-up" style={{ padding: '32px', borderLeft: '3px solid var(--accent-indigo)' }}>
                        <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>AI_RESPONSE</span>
                        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '16px', fontWeight: 300 }}>{answer}</p>
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <div style={{ opacity: 0.2, textAlign: 'center', marginTop: '100px' }}>
               <div style={{ fontSize: '80px', marginBottom: '32px' }}>📄</div>
               <p style={{ fontSize: '20px', fontWeight: 300 }}>Ingest a document fragment to begin interrogation.</p>
             </div>
           )}
        </section>
      </main>

      <aside style={{ padding: '48px 32px', borderLeft: '1px solid var(--border-ghost)' }}>
         <h3 className="mono" style={{ color: 'var(--accent-indigo)', marginBottom: '40px', fontSize: '14px' }}>GLOBAL_INTEL</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass-panel" style={{ borderBottom: '1px solid var(--border-ghost)' }}>
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>INDEX_STATS</span>
               <div style={{ fontSize: '32px', fontWeight: 600, marginTop: '12px' }}>{activeDoc ? Math.ceil(activeDoc.content.length / 4) : 0} <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOKENS</span></div>
               <div style={{ height: '3px', background: 'var(--bg-midnight)', marginTop: '24px', position: 'relative', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: activeDoc ? '100%' : '0%', height: '100%', background: 'var(--accent-indigo)', transition: '1s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
               </div>
            </div>

            <div className="glass-panel" style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-indigo)' }}>
               <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)', fontWeight: 600 }}>AI_STATUS</span>
               <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.5, fontWeight: 300 }}>
                 Local LLM is ready for contextual retrieval from {documents.length} ingested sources. Logic map is synced.
               </p>
            </div>
         </div>
      </aside>
    </div>
  );
}
