import { useState, useEffect } from 'react';
import { ensureLLMLoaded, chunkText, generateId, generateText } from '../lib/ai-utils';
import { create, getAll, STORES } from '../lib/storage';
import { extractTextFromDocument, isValidDocumentType, formatFileSize } from '../lib/document-utils';
import type { ResearchDocument, DocumentQA } from '../types';

export function DocumentResearch() {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [qaHistory, setQAHistory] = useState<DocumentQA[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadQAHistory();
    ensureLLMLoaded().catch(console.error);
  }, []);

  async function loadDocuments() {
    const docs = await getAll<ResearchDocument>(STORES.DOCUMENTS);
    
    // Sanity check: Filter out or repair corrupted documents (likely from the previous infinite loop bug)
    const sanitizedDocs = docs.map(doc => {
      // If a document has an absurd number of chunks (e.g., > 2000 for a typical file), truncate it
      if (doc.chunks && doc.chunks.length > 2000) {
        console.warn(`Repairing corrupted document: ${doc.name}`);
        return { ...doc, chunks: doc.chunks.slice(0, 500) };
      }
      return doc;
    });

    setDocuments(sanitizedDocs.sort((a, b) => b.uploadedAt - a.uploadedAt));
  }

  async function loadQAHistory() {
    const history = await getAll<DocumentQA>(STORES.DOCUMENT_QA);
    setQAHistory(history.sort((a, b) => b.timestamp - a.timestamp));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!isValidDocumentType(file)) {
          alert(`Unsupported file type: ${file.name}`);
          continue;
        }

        const content = await extractTextFromDocument(file);
        const chunks = chunkText(content, 500, 50);

        const doc: ResearchDocument = {
          id: generateId(),
          name: file.name,
          type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
          size: file.size,
          uploadedAt: Date.now(),
          content,
          chunks: chunks.map((c, i) => ({ id: `chunk-${i}`, content: c })),
          entities: [],
        };

        await create(STORES.DOCUMENTS, doc);
      }
      loadDocuments();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }

  async function askQuestion() {
    if (!question.trim() || selectedDocs.size === 0) return;

    setIsProcessing(true);
    try {
      const selectedDocuments = documents.filter((d) => selectedDocs.has(d.id));
      const combinedContent = selectedDocuments.map((d) => `Document: ${d.name}\n\n${d.content}`).join('\n\n---\n\n');
      const context = combinedContent.slice(0, 3000);

      const prompt = `Based on the following documents, answer this question:\n\nQuestion: ${question}\n\nDocuments:\n${context}\n\nProvide a detailed answer.`;
      const result = await generateText(prompt, { maxTokens: 600, temperature: 0.3 });

      const qa: DocumentQA = {
        id: generateId(),
        documentIds: Array.from(selectedDocs),
        question,
        answer: result.text,
        citations: [],
        timestamp: Date.now(),
      };

      await create(STORES.DOCUMENT_QA, qa);
      setQAHistory([qa, ...qaHistory]);
      setQuestion('');
    } catch (error) {
      console.error('Q&A error:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="notes-v2-container">
      {/* Pane 1: Left Navigation Sidebar */}
      <aside className="writing-nav-sidebar" style={{ position: 'relative', height: '100%', width: '260px', minWidth: '260px' }}>
        <div className="spectral-branding">
          <div className="spectral-logo">🧠</div>
          <div className="spectral-info">
            <h3>SPECTRAL ENGINE</h3>
            <span className="ai-status-badge"><span style={{ color: '#ff5500' }}>●</span> AI Processing Active</span>
          </div>
        </div>

        <label className="btn-new-draft" style={{ marginTop: '24px', cursor: 'pointer', textAlign: 'center', display: 'block' }}>
          {isUploading ? 'Uploading...' : '+ Upload Documents'}
          <input 
            type="file" 
            multiple 
            accept=".pdf,.txt,.doc,.docx,.md" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            disabled={isUploading}
          />
        </label>

        <nav className="writing-nav-items">
          <div className="nav-item-v2">
            <span>✍️</span> Writer
          </div>
          <div className="nav-item-v2">
            <span>📒</span> Notes
          </div>
          <div className="nav-item-v2 active">
            <span>📄</span> Research
          </div>
          <div className="nav-item-v2">
            <span>📁</span> Archives
          </div>
          <div className="nav-item-v2">
            <span>🗑️</span> Trash
          </div>
        </nav>

        <div className="writing-nav-footer">
          <a href="#" className="nav-footer-link" onClick={(e) => e.preventDefault()}>
            <span className="nav-footer-icon">⏳</span> Sync Status
          </a>
          <a href="#" className="nav-footer-link" onClick={(e) => e.preventDefault()}>
            <span className="nav-footer-icon">❓</span> Help Center
          </a>
        </div>
      </aside>

      {/* Pane 2: Middle Library Pane */}
      <section className="notes-library-pane">
        <div className="library-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2>Documents</h2>
            <span className="node-count-badge">{documents.length} FILES</span>
          </div>
        </div>

        <div className="library-search">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search documents..." 
          />
        </div>

        <div className="note-list-v2">
          {documents.length === 0 ? (
            <div className="module-empty" style={{ opacity: 0.5 }}>No documents yet</div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className={`note-card-v2 ${selectedDocs.has(doc.id) ? 'active' : ''}`} onClick={() => {
                const newSet = new Set(selectedDocs);
                selectedDocs.has(doc.id) ? newSet.delete(doc.id) : newSet.add(doc.id);
                setSelectedDocs(newSet);
              }}>
                <div className="note-card-header">
                  <h4 style={{ fontSize: '14px' }}>{doc.name}</h4>
                  <input type="checkbox" checked={selectedDocs.has(doc.id)} readOnly />
                </div>
                <div className="note-card-snippet">
                  {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Pane 3: Right Content Pane */}
      <main className="notes-editor-pane">
        <header className="research-header-v2" style={{ padding: 0, border: 'none', background: 'none' }}>
          <h2 style={{ fontSize: '32px' }}>Document Research</h2>
          <p>Private document analysis with Q&A - files never leave your browser</p>
        </header>

        <div className="ask-question-card-v2" style={{ marginTop: '20px' }}>
          <h3 style={{ textTransform: 'none', color: 'white', marginBottom: '20px', letterSpacing: 'normal' }}>Ask a Question</h3>
          <div className="input-group-v2">
            <input 
                type="text" 
                placeholder="What would you like to know about these documents?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                disabled={isProcessing}
            />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={askQuestion} 
            disabled={isProcessing || selectedDocs.size === 0}
            style={{ padding: '12px 32px' }}
          >
            <span>🔍</span> {isProcessing ? 'Processing...' : 'Ask Question'}
          </button>
        </div>

        <div className="qa-history-section-v2">
          <h3 style={{ color: '#64748b' }}>Q&A History</h3>
          <div className="qa-history-v2" style={{ marginTop: '20px' }}>
            {qaHistory.length === 0 ? (
              <div className="module-empty" style={{ opacity: 0.5 }}>No history yet</div>
            ) : (
              qaHistory.map((qa) => (
                <div key={qa.id} className="qa-item-v2">
                  <div className="qa-question-v2" style={{ fontSize: '15px' }}>
                    <span style={{ color: '#ff5500' }}>Q:</span> {qa.question}
                  </div>
                  <div className="qa-answer-v2" style={{ fontSize: '15px' }}>
                    {qa.answer}
                  </div>
                  <div className="qa-time-v2">
                    {new Date(qa.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
