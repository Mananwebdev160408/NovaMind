/**
 * Module 4: Private Document Research Assistant
 */

import { useState, useEffect } from 'react';
import { generateText, ensureLLMLoaded, chunkText, generateId } from '../lib/ai-utils';
import { create, update, getAll, deleteItem, STORES } from '../lib/storage';
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
    setDocuments(docs.sort((a, b) => b.uploadedAt - a.uploadedAt));
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
      alert('Error uploading document');
    } finally {
      setIsUploading(false);
    }
  }

  async function askQuestion() {
    if (!question.trim() || selectedDocs.size === 0) {
      alert('Please select documents and enter a question');
      return;
    }

    setIsProcessing(true);
    try {
      const selectedDocuments = documents.filter((d) => selectedDocs.has(d.id));
      const combinedContent = selectedDocuments.map((d) => `Document: ${d.name}\n\n${d.content}`).join('\n\n---\n\n');
      const context = combinedContent.slice(0, 3000); // Limit context size

      const prompt = `Based on the following documents, answer this question:\n\nQuestion: ${question}\n\nDocuments:\n${context}\n\nProvide a detailed answer with references to specific documents.`;
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
      alert('Error generating answer');
    } finally {
      setIsProcessing(false);
    }
  }

  async function summarizeDocument(doc: ResearchDocument) {
    setIsProcessing(true);
    try {
      const result = await generateText(
        `Summarize this document in 5-7 sentences covering the key points:\n\n${doc.content.slice(0, 2000)}`,
        { maxTokens: 300, temperature: 0.5 }
      );
      await create(STORES.DOCUMENTS, { ...doc, summary: result.text });
      loadDocuments();
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>📄 Document Research</h2>
        <p>Private document analysis with Q&A - files never leave your browser</p>
      </div>

      <div className="module-toolbar">
        <label className="btn">
          📤 Upload Documents
          <input type="file" multiple accept=".pdf,.txt,.doc,.docx,.md" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {documents.length} documents • {selectedDocs.size} selected
        </span>
      </div>

      <div className="module-content" style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Documents</h3>
          {documents.length === 0 ? (
            <div className="module-empty"><p>No documents yet</p></div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="module-card" style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedDocs.has(doc.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedDocs);
                      e.target.checked ? newSet.add(doc.id) : newSet.delete(doc.id);
                      setSelectedDocs(newSet);
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </label>
                {doc.summary && (
                  <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-muted)' }}>
                    {doc.summary.slice(0, 100)}...
                  </div>
                )}
                {!doc.summary && (
                  <button className="btn btn-sm" style={{ marginTop: '4px' }} onClick={() => summarizeDocument(doc)}>
                    📝 Summarize
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 2 }}>
          <div className="module-card">
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Ask a Question</h3>
            <input
              className="input"
              type="text"
              placeholder="What would you like to know about these documents?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              disabled={isProcessing}
            />
            <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={askQuestion} disabled={isProcessing || selectedDocs.size === 0}>
              {isProcessing ? '⏳ Processing...' : '🔍 Ask Question'}
            </button>
          </div>

          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Q&A History</h3>
            {qaHistory.map((qa) => (
              <div key={qa.id} className="module-card" style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Q: {qa.question}</div>
                <div style={{ fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>A: {qa.answer}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {new Date(qa.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
