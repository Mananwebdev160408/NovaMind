/**
 * Module 5: Code Documentation & Explanation Engine
 */

import { useState, useEffect } from 'react';
import { generateText, ensureLLMLoaded, generateId } from '../lib/ai-utils';
import { create, getAll, STORES } from '../lib/storage';
import type { CodeAnalysis } from '../types';

export function CodeEngine() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysisType, setAnalysisType] = useState<'explain' | 'document' | 'review' | 'test'>('explain');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<CodeAnalysis[]>([]);

  useEffect(() => {
    loadHistory();
    ensureLLMLoaded().catch(console.error);
  }, []);

  async function loadHistory() {
    const all = await getAll<CodeAnalysis>(STORES.CODE);
    setHistory(all.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
  }

  async function analyzeCode() {
    if (!code.trim()) return;
    setIsProcessing(true);
    setResult('');
    try {
      let prompt = '';
      switch (analysisType) {
        case 'explain':
          prompt = `Explain this ${language} code in simple terms:\n\n${code}`;
          break;
        case 'document':
          prompt = `Generate documentation with JSDoc/docstrings for this ${language} code:\n\n${code}`;
          break;
        case 'review':
          prompt = `Review this ${language} code for issues, complexity, and suggest improvements:\n\n${code}`;
          break;
        case 'test':
          prompt = `Suggest unit test cases for this ${language} code:\n\n${code}`;
          break;
      }

      const response = await generateText(prompt, { maxTokens: 600, temperature: 0.3 });
      setResult(response.text);

      const analysis: CodeAnalysis = {
        id: generateId(),
        code,
        language,
        type: analysisType,
        result: response.text,
        timestamp: Date.now(),
      };
      await create(STORES.CODE, analysis);
      loadHistory();
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="code-v2-container">
      {/* Pane 1: Global Nav Sidebar */}
      <aside className="writing-nav-sidebar" style={{ width: '260px', minWidth: '260px' }}>
        <div className="spectral-branding">
          <div className="spectral-logo">🧠</div>
          <div className="spectral-info">
            <h3 style={{ fontSize: '13px', fontWeight: 800 }}>NovaMind</h3>
            <span className="ai-status-badge">SPECTRAL ENGINE V2.4</span>
          </div>
        </div>

        <nav className="writing-nav-items" style={{ marginTop: '40px' }}>
          <div className="nav-item-v2">
            <span>🏠</span> Dashboard
          </div>
          <div className="nav-item-v2">
            <span>📚</span> Learning
          </div>
          <div className="nav-item-v2">
            <span>🛡️</span> Security
          </div>
          <div className="nav-item-v2">
            <span>⚙️</span> Settings
          </div>
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px' }}>
             <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '14px' }}>New Analysis</button>
        </div>

        <div className="writing-nav-footer">
          <a href="#" className="nav-footer-link">
            <span className="nav-footer-icon">?</span> Support
          </a>
          <a href="#" className="nav-footer-link">
            <span className="nav-footer-icon">🚪</span> Logout
          </a>
        </div>
      </aside>

      {/* Pane 2: Primary Editor Pane */}
      <main className="code-main-pane">
        <div className="meetings-title" style={{ marginBottom: '40px' }}>
          <h1>Code Documentation Engine</h1>
          <p>Real-time neural analysis and documentation generation via local WebGPU clusters.</p>
        </div>

        <div className="lang-controls-row">
           <div className="lang-control-card">
              <div className="lang-control-label">💻 Language</div>
              <select className="select-v2" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
           </div>
           <div className="lang-control-card">
              <div className="lang-control-label">🔍 Analysis Mode</div>
              <select className="select-v2" value={analysisType} onChange={(e) => setAnalysisType(e.target.value as any)}>
                <option value="explain">Explain Logic</option>
                <option value="document">Generate JSDoc</option>
                <option value="review">Code Review</option>
                <option value="test">Unit Test Cases</option>
              </select>
           </div>
           <div className="lang-control-card" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', borderRadius: '12px' }} 
                onClick={analyzeCode} 
                disabled={isProcessing || !code}
              >
                {isProcessing ? '⏳ Analyzing...' : '🔍 Neural Analysis'}
              </button>
           </div>
        </div>

        <div className="code-editor-v2">
          <textarea
            className="notes-body-editor"
            style={{ minHeight: '500px', fontFamily: '"JetBrains Mono", monospace', fontSize: '14px' }}
            placeholder="// Paste or type your code here for spectral analysis..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isProcessing}
          />
        </div>
      </main>

      {/* Pane 3: Intelligence Sidebar */}
      <aside className="code-intel-pane">
        <div className="privacy-card-title">ANALYSIS RESULT</div>
        
        {result ? (
           <div className="ai-summary-card-v2" style={{ border: '1px solid #ff550033' }}>
              <div className="neural-header">
                <div className="neural-icon">⚡</div>
                <div>
                   <h4>Neural Output</h4>
                   <span>SPECTRAL CLUSTER 7B</span>
                </div>
              </div>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '13px', 
                lineHeight: '1.6', 
                color: '#e2e8f0',
                fontFamily: '"Inter", sans-serif'
              }}>
                {result}
              </pre>
           </div>
        ) : (
           <div className="module-empty">
              <p style={{ fontSize: '12px', opacity: 0.5 }}>Neural output will appear here after analysis.</p>
           </div>
        )}

        <div className="privacy-card-title" style={{ marginTop: '40px' }}>ANALYSIS HISTORY</div>
        <div className="pulse-metric-row">
           {history.length === 0 && <p style={{ fontSize: '12px', opacity: 0.3, textAlign: 'center' }}>No recent history</p>}
           {history.map((h) => (
              <div key={h.id} className="pulse-metric-item" style={{ cursor: 'pointer' }} onClick={() => { setCode(h.code); setResult(h.result); }}>
                 <div className="pulse-metric-info">
                    <span className="pulse-metric-icon">📑</span>
                    <div className="pulse-metric-label">
                       <h4 style={{ fontSize: '12px' }}>{h.type.toUpperCase()}</h4>
                       <p>{h.language}</p>
                    </div>
                 </div>
                 <div className="pulse-metric-value" style={{ fontSize: '10px', opacity: 0.5 }}>
                   {new Date(h.timestamp).toLocaleDateString()}
                 </div>
              </div>
           ))}
        </div>
      </aside>
    </div>
  );
}
