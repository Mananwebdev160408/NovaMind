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
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', height: '100%', background: 'var(--bg-app)' }}>
      {/* Sidebar: Document List */}
      <aside style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>Analysis</h3>
            <label className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}>
               + Upload
               <input type="file" accept=".txt,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ fontSize: '11px', color: modelState === 'ready' ? 'var(--success)' : 'var(--warning)', marginBottom: '16px', fontWeight: 600 }}>
             AI Status: {modelState === 'ready' ? 'Online' : 'Loading...'}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }}>
          {documents.map(doc => (
            <div 
              key={doc.id}
              onClick={() => handleSelectDoc(doc.id)}
              className="card card-interactive"
              style={{ 
                padding: '16px', 
                marginBottom: '8px',
                background: activeDoc?.id === doc.id ? 'var(--bg-hover)' : 'transparent',
                borderColor: activeDoc?.id === doc.id ? 'var(--accent)' : 'var(--border)'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{doc.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {Math.ceil(doc.content.length / 1024)} KB • {doc.type.toUpperCase()}
              </div>
            </div>
          ))}
          {documents.length === 0 && <div style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '40px' }}>No documents uploaded.</div>}
        </div>
      </aside>

      {/* Main Analysis Area */}
      <main style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <header style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px' }}>{activeDoc?.name || 'Document Analysis'}</h2>
          <button className="btn btn-secondary">Global Search</button>
        </header>

        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
           {activeDoc ? (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px' }}>
                <div style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-main)', background: 'var(--bg-light)', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  "{activeDoc.content.slice(0, 2000)}..."
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                   <div className="card" style={{ padding: '24px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '16px' }}>Ask a Question</h4>
                      <textarea 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. What is the main conclusion?"
                        style={{ width: '100%', height: '100px', background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '12px', borderRadius: '4px', fontSize: '14px', resize: 'none' }}
                      />
                      <button 
                        onClick={handleAsk}
                        disabled={isAnalyzing || !question.trim()}
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '16px' }}
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Ask AI'}
                      </button>
                   </div>
                   {answer && (
                     <div className="card animate-in" style={{ padding: '24px', background: 'var(--accent-soft)', borderColor: 'var(--accent)' }}>
                        <h4 style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '12px' }}>AI Answer</h4>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{answer}</p>
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                 <p>Upload or select a document to analyze.</p>
               </div>
             </div>
           )}
        </div>
      </main>

      {/* Stats Sidebar */}
      <aside style={{ borderLeft: '1px solid var(--border)', padding: '24px', background: 'var(--bg-app)' }}>
         <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' }}>Document Info</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Tokens Indexed</div>
               <div style={{ fontSize: '24px', fontWeight: 700 }}>{activeDoc ? Math.ceil(activeDoc.content.length / 4).toLocaleString() : 0}</div>
            </div>

            <div className="card" style={{ padding: '16px' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Storage</div>
               <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                 This document is stored securely in your private vault and encrypted at rest.
               </p>
            </div>
         </div>
      </aside>
    </div>
  );
}
