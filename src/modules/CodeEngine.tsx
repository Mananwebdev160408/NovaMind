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
    <div className="module-container">
      <div className="module-header">
        <h2>💻 Code Documentation Engine</h2>
        <p>Explain, document, and review code with AI</p>
      </div>

      <div className="module-toolbar">
        <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <select className="select" value={analysisType} onChange={(e) => setAnalysisType(e.target.value as any)}>
          <option value="explain">Explain</option>
          <option value="document">Document</option>
          <option value="review">Review</option>
          <option value="test">Test Cases</option>
        </select>
        <button className="btn btn-primary" onClick={analyzeCode} disabled={isProcessing || !code}>
          {isProcessing ? '⏳ Analyzing...' : '🔍 Analyze'}
        </button>
      </div>

      <div className="module-content" style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <textarea
            className="editor"
            style={{ minHeight: '400px', fontFamily: 'monospace' }}
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div style={{ flex: 1 }}>
          {result ? (
            <div className="module-card" style={{ height: '400px', overflow: 'auto' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Result</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.5' }}>{result}</pre>
            </div>
          ) : (
            <div className="module-empty"><p>Analysis result will appear here</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
