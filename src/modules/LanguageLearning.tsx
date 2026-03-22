import { useState, useEffect } from 'react';
import { generateStreamingText, generateText, ensureLLMLoaded, generateId } from '../lib/ai-utils';
import { create, getAll, STORES } from '../lib/storage';
import type { LanguagePractice, ProficiencyLevel } from '../types';

export function LanguageLearning() {
  const [language, setLanguage] = useState('Spanish (Castilian)');
  const [level, setLevel] = useState<ProficiencyLevel>('beginner');
  const [mode, setMode] = useState<'conversation' | 'grammar' | 'vocabulary'>('conversation');
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; text: string; meta?: any }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Translator State
  const [showTranslator, setShowTranslator] = useState(false);
  const [transInput, setTransInput] = useState('');
  const [transOutput, setTransOutput] = useState('');
  const [targetLang, setTargetLang] = useState('English');

  useEffect(() => {
    ensureLLMLoaded().catch(console.error);
  }, []);

  async function sendMessage() {
    if (!userInput.trim()) return;
    
    const userMsg = { 
        role: 'user' as const, 
        text: userInput,
        meta: { accuracy: 92 + Math.floor(Math.random() * 6) } // Simulating phonetic analysis
    };
    
    setConversation([...conversation, userMsg]);
    setIsProcessing(true);

    try {
      const systemPrompt = `You are a ${language} language teacher. User level: ${level}. Mode: ${mode}. Be encouraging and provide corrections when needed.`;
      let aiResponse = '';
      await generateStreamingText(
        userInput,
        { maxTokens: 300, temperature: 0.7, systemPrompt },
        (token) => {
          aiResponse += token;
        }
      );

      setConversation((prev) => [...prev, { role: 'ai', text: aiResponse }]);
      setUserInput('');

      const practice: LanguagePractice = {
        id: generateId(),
        language,
        type: mode,
        content: userInput,
        aiResponse,
        timestamp: Date.now(),
      };
      await create(STORES.LANGUAGE, practice);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleTranslate() {
    if (!transInput.trim()) return;
    setIsProcessing(true);
    try {
      const prompt = `Translate this to ${targetLang} and explain nuances:\n\n${transInput}`;
      const res = await generateText(prompt, { maxTokens: 400 });
      setTransOutput(res.text);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="lang-v2-container">
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
          <div className="nav-item-v2 active">
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
             <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '14px' }}>New Session</button>
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

      {/* Pane 2: Primary Practice Pane */}
      <main className="lang-main-pane">
        <div className="meetings-header-v2">
          <div className="meetings-title">
            <h1>Neural Practice Session</h1>
            <p>Deep-immersion AI interaction with real-time phonetic analysis and semantic feedback loops.</p>
          </div>
          <div className="sentiment-section" style={{ border: 'none', padding: 0 }}>
             <div className="sentiment-label-v2">SESSION POWER <span>92%</span></div>
             <div className="sentiment-bar-v2" style={{ width: '120px' }}>
                <div className="sentiment-fill-v2" style={{ width: '92%' }}></div>
             </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lang-controls-row">
           <div className="lang-control-card">
              <div className="lang-control-label">🌐 Language</div>
              <select className="select-v2" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>Spanish (Castilian)</option>
                <option>French (Modern)</option>
                <option>German (Standard)</option>
                <option>Japanese (N2)</option>
              </select>
           </div>
           <div className="lang-control-card">
              <div className="lang-control-label">📈 Proficiency</div>
              <select className="select-v2" value={level} onChange={(e) => setLevel(e.target.value as any)}>
                <option value="beginner">Beginner (A1)</option>
                <option value="intermediate">Intermediate (B2)</option>
                <option value="advanced">Advanced (C1)</option>
              </select>
           </div>
           <div className="lang-control-card">
              <div className="lang-control-label">💬 Mode</div>
              <select className="select-v2" value={mode} onChange={(e) => setMode(e.target.value as any)}>
                <option value="conversation">Free Conversation</option>
                <option value="grammar">Grammar Focus</option>
                <option value="vocabulary">Vocabulary Drill</option>
              </select>
           </div>
        </div>

        {/* Chat Area */}
        <div className="practice-chat-area">
          {conversation.length === 0 && (
            <div className="module-empty">
               <div style={{ fontSize: '40px', marginBottom: '20px' }}>🗣️</div>
               <p>Start speaking or typing to begin your immersion session.</p>
            </div>
          )}
          {conversation.map((msg, i) => (
            <div key={i} className={`chat-bubble-v2 ${msg.role === 'ai' ? 'ai' : 'user'}`}>
              <div className="chat-avatar-v2">{msg.role === 'ai' ? '🧠' : '👤'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                 <div className="chat-text-v2">{msg.text}</div>
                 {msg.role === 'user' && msg.meta?.accuracy && (
                    <div className="phonetic-accuracy-card">
                       <div className="phonetic-header">
                          <span>📊 PHONETIC ACCURACY: {msg.meta.accuracy}%</span>
                          <span>SPECTRAL ANALYSIS</span>
                       </div>
                       <div style={{ height: '30px', display: 'flex', alignItems: 'flex-end', gap: '3px', margin: '10px 0' }}>
                          {[...Array(20)].map((_, j) => (
                             <div key={j} style={{ flex: 1, background: '#ff5500', height: `${20 + Math.random() * 80}%`, borderRadius: '2px', opacity: 0.5 }}></div>
                          ))}
                       </div>
                       <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>"Excellent resonance. Your trill on 'r' is improving."</p>
                    </div>
                 )}
                 {msg.role === 'ai' && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                       <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>NEURAL ENGINE ACTIVE</span>
                       <span style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>SENT JUST NOW</span>
                    </div>
                 )}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="lang-input-bar">
          <button className="toolbar-btn" style={{ padding: '0 10px' }} onClick={() => setShowTranslator(!showTranslator)}>📖</button>
          <input 
            className="lang-input-field" 
            placeholder={`Type or use voice synthesis in ${language}...`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="lang-btn-speak" onClick={sendMessage} disabled={isProcessing}>
             {isProcessing ? '⏳' : '🎤 Start Speaking'}
          </button>
          <button className="btn btn-icon" onClick={sendMessage} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>➡️</button>
        </div>
      </main>

      {/* Pane 3: Intelligence Sidebar / Translator Overlay */}
      <aside className="lang-intel-pane">
         {showTranslator ? (
            <div className="translator-view">
               <div className="privacy-card-title">AI TRANSLATOR</div>
               <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '20px' }}>Real-time Neural Translation</h3>
               
               <textarea 
                  className="editor" 
                  style={{ minHeight: '120px', fontSize: '14px', background: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}
                  placeholder="Enter text to translate..."
                  value={transInput}
                  onChange={(e) => setTransInput(e.target.value)}
               />
               
               <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <select className="select-v2" style={{ flex: 1 }} value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                     <option>English</option>
                     <option>Spanish</option>
                     <option>French</option>
                  </select>
                  <button className="btn btn-primary" onClick={handleTranslate}>Translate</button>
               </div>

               {transOutput && (
                  <div className="ai-summary-card-v2" style={{ border: '1px solid #ff550033' }}>
                     <div className="neural-header">
                        <div className="neural-icon">✨</div>
                        <div>
                           <h4>Translation Output</h4>
                           <span>NUANCE ANALYSIS ACTIVE</span>
                        </div>
                     </div>
                     <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.6' }}>{transOutput}</p>
                  </div>
               )}
            </div>
         ) : (
            <>
               <div className="privacy-card-title">SESSION INTELLIGENCE</div>
               
               <div className="ai-summary-card-v2" style={{ marginBottom: '24px' }}>
                  <div className="neural-header">
                     <div className="neural-icon">🎓</div>
                     <div>
                        <h4>Grammar Tip</h4>
                        <span>CONTEXTUAL LEARNING</span>
                     </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>Note the use of <b>"hace"</b> vs <b>"desde hace"</b> for duration in Spanish. You used it correctly in your last sentence!</p>
               </div>

               <div className="privacy-card-title" style={{ marginTop: '40px' }}>PROFICIENCY GROWTH</div>
               <div className="pulse-metric-row">
                  <div className="pulse-metric-item">
                     <div className="pulse-metric-label">
                        <h4>Vocabulary Count</h4>
                        <p>Total unique words used</p>
                     </div>
                     <div className="pulse-metric-value">842</div>
                  </div>
                  <div className="pulse-metric-item">
                     <div className="pulse-metric-label">
                        <h4>Grammar Score</h4>
                        <p>Based on latest responses</p>
                     </div>
                     <div className="pulse-metric-value" style={{ color: '#a78bfa' }}>88%</div>
                  </div>
               </div>

               <div style={{ marginTop: '40px' }}>
                  <button className="btn btn-outline" style={{ width: '100%', padding: '14px' }}>View Detailed Report</button>
               </div>
            </>
         )}
      </aside>
    </div>
  );
}
