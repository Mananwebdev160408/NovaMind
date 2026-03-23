import React, { useState } from 'react';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelCategory } from '@runanywhere/web';
import { generateStreamingText } from '../lib/ai-utils';

export function CodeEngine() {
  const [code, setCode] = useState(`// Paste code here for analysis\nfunction example() {\n  console.log("Hello NovaMind");\n}`);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState('Initiate diagnostic to receive architectural insight.');
  const { state: modelState, ensure: ensureModel } = useModelLoader(ModelCategory.Language);

  const runDiagnostic = async () => {
    if (isAnalyzing) return;
    
    const ok = await ensureModel();
    if (!ok) return;

    setIsAnalyzing(true);
    setInsight('');
    
    const prompt = `Perform a high-level architectural and security review of this code. identify potential vulnerabilities or optimizations:\n\n${code}`;

    try {
      await generateStreamingText(prompt, { temperature: 0.3 }, (token) => {
        setInsight(prev => prev + token);
      });
    } catch (err) {
      console.error('Analysis failed:', err);
      setInsight('Analysis failed. Ensure local models are loaded.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dossier-grid" style={{ background: 'var(--bg-midnight)' }}>
      <aside style={{ padding: '48px 32px', borderRight: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '64px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>MODULE_SECTION</span>
          <h3 style={{ fontSize: '24px', fontWeight: 600, marginTop: '8px' }}>Architecture Scan</h3>
          <div className="mono" style={{ fontSize: '9px', marginTop: '8px', color: modelState === 'ready' ? 'var(--accent-indigo)' : 'var(--text-muted)' }}>
            KERNEL_AST: {modelState.toUpperCase()}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span className="mono" style={{ fontSize: '10px', opacity: 0.4, marginBottom: '16px' }}>ANALYSIS_PRESETS</span>
          {['Security Audit', 'Performance Trace', 'Logic Review'].map(preset => (
            <button key={preset} className="mono" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', cursor: 'pointer', transition: '0.2s', borderRadius: 'var(--radius-sm)' }}>
              {preset}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
           <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>SYSTEM_INTEGRITY</span>
           <div className="mono" style={{ marginTop: '16px', fontSize: '10px', color: 'var(--accent-indigo)', fontWeight: 600 }}>[ SHIELD_ACTIVE ]</div>
        </div>
      </aside>

      <main className="flex-column" style={{ padding: '0' }}>
         <header style={{ padding: '32px clamp(24px, 5vw, 64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-ghost)' }}>
          <div>
            <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>ACTIVE_SOURCE</span>
            <h1 style={{ fontSize: '32px', marginTop: '8px' }}>Scratchpad.cc</h1>
          </div>
          <button 
            onClick={runDiagnostic} 
            disabled={isAnalyzing}
            className="btn-premium" 
            style={{ padding: '6px 16px', fontSize: '10px' }}
          >
            {isAnalyzing ? 'SCANNING...' : 'Run Diagnostic'}
          </button>
        </header>

        <section style={{ flex: 1, padding: '0', background: '#050505', position: 'relative' }}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isAnalyzing}
            spellCheck={false}
            style={{
              width: '100%',
              height: '100%',
              background: 'none',
              border: 'none',
              padding: '32px',
              color: 'var(--accent-indigo)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              lineHeight: 1.6,
              outline: 'none',
              resize: 'none'
            }}
          />
        </section>

        <div className="glass-panel" style={{ margin: 'clamp(16px, 3vw, 32px)', padding: '24px', maxHeight: '200px', overflowY: 'auto' }}>
           <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>AI_INSIGHT</span>
           <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginTop: '12px', fontWeight: 300 }}>
             {insight}
           </p>
        </div>
      </main>

      <aside style={{ padding: '48px 32px', borderLeft: '1px solid var(--border-ghost)' }}>
         <h3 className="mono" style={{ color: 'var(--accent-indigo)', marginBottom: '40px', fontSize: '14px' }}>SYSTEM_CORE</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div className="glass-panel" style={{ borderLeft: '2px solid var(--accent-indigo)' }}>
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>VULNERABILITY_INDEX</span>
               <div style={{ fontSize: '48px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                 {isAnalyzing ? '--' : '0.0'}
               </div>
               <div className="mono" style={{ fontSize: '9px', color: 'var(--accent-indigo)', marginTop: '8px', fontWeight: 700 }}>ARCHITECTURAL_PARITY: VERIFIED</div>
            </div>

            <div style={{ paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>DEPENDENCY_MAP</span>
               <div className="glass-panel" style={{ marginTop: '16px', padding: '24px' }}>
                  <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>[ ARCH_VIS_STABLE ]</div>
                  </div>
               </div>
            </div>
         </div>
      </aside>
    </div>
  );
}
