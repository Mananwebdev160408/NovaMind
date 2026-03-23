import React from 'react';

export function KnowledgeGraph() {
  return (
    <div className="dossier-grid" style={{ background: 'var(--bg-midnight)' }}>
      {/* Main Analysis Deck */}
      <main className="flex-column" style={{ padding: '0', gridColumn: 'span 2' }}>
         <header style={{ padding: '48px clamp(24px, 5vw, 64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '32px', borderBottom: '1px solid var(--border-ghost)' }}>
          <div>
            <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>MODULE_SECTION</span>
            <h1 style={{ fontSize: 'clamp(32px, 8vw, 72px)', lineHeight: 0.9, marginTop: '16px' }}>Spectral <span style={{ color: 'var(--accent-soft)', fontStyle: 'italic' }}>Knowledge</span> Graph</h1>
            <p className="mono" style={{ color: 'var(--accent-indigo)', marginTop: '24px', fontSize: '10px', fontWeight: 600 }}>MULTI-DIMENSIONAL RELATIONSHIP MAPPING</p>
          </div>
          <button className="btn-premium" style={{ padding: '12px 32px' }}>Manual Reindex</button>
        </header>

        <section style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 50%, var(--accent-glow) 0%, transparent 80%)', padding: '40px' }}>
           {/* Abstract Visualization */}
           <div style={{ position: 'absolute', inset: '5%', opacity: 0.2, pointerEvents: 'none' }}>
              {Array.from({ length: 15 }).map((_, i) => (
                 <div key={i} style={{ 
                    position: 'absolute', 
                    top: `${Math.random() * 100}%`, 
                    left: `${Math.random() * 100}%`, 
                    width: '1px', 
                    height: '120px', 
                    background: 'var(--accent-indigo)', 
                    transform: `rotate(${Math.random() * 360}deg)`,
                    boxShadow: '0 0 10px var(--accent-glow)'
                 }} />
              ))}
           </div>

           <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '600px' }}>
              <div style={{ fontSize: 'clamp(60px, 10vw, 100px)', marginBottom: '32px', filter: 'drop-shadow(0 0 20px var(--accent-glow))' }}>🌀</div>
              <h2 style={{ fontSize: 'clamp(28px, 6vw, 48px)', color: 'var(--text-primary)', fontWeight: 600 }}>Module <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>Calibrating</span></h2>
              <p className="mono" style={{ color: 'var(--text-muted)', marginTop: '24px', fontSize: 'clamp(10px, 1.5vw, 12px)', lineHeight: 1.8, opacity: 0.6 }}>
                SYNAPTIC WEIGHTS ARE BEING PINNED TO LOCAL HARDWARE. EXPECT FULL VISUALIZATION IN V2.5.0
              </p>
              <div style={{ marginTop: '48px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                 <div className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)', background: 'var(--bg-surface)', padding: '6px 16px', border: '1px solid var(--accent-indigo)', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>[ 88% SYNC_COMPLETED ]</div>
                 <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '6px 16px', border: '1px solid var(--border-ghost)', borderRadius: 'var(--radius-sm)' }}>[ NODES_DETECTED: 1,424 ]</div>
              </div>
           </div>

           {/* UI Trace Labels */}
           <div className="mono desktop-only" style={{ position: 'absolute', bottom: '32px', left: '64px', fontSize: '9px', color: 'var(--text-muted)', lineHeight: 2, opacity: 0.4 }}>
              LOG: INITIATING_SPECTRAL_SWEEP_PROTOCOL... <br/>
              LOG: LOCKING_COORDINATES_TO_SECURE_VAULT...
           </div>
        </section>
      </main>

      {/* Node Intel Sidebar */}
      <aside style={{ padding: '48px 32px', borderLeft: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
         <h3 className="mono" style={{ color: 'var(--accent-indigo)', marginBottom: '48px', fontSize: '14px' }}>NODE_INTEL</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass-panel">
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>CLUSTER_FOUND</span>
               <h4 style={{ fontSize: '20px', marginTop: '12px' }}>Legal_Docs_2025</h4>
               <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5, fontWeight: 300 }}>CONTAINS 12 REFERENCES TO 'LIABILITY' ENFORCED BY CORE POLICY.</p>
            </div>

            <div className="glass-panel" style={{ borderLeft: '3px solid var(--accent-indigo)' }}>
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>CROSS_CORE_LINK</span>
               <h4 style={{ fontSize: '20px', marginTop: '12px' }}>System_Manifesto</h4>
               <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 300 }}>LINKED TO 4 DOCUMENTS IN PROJECTS ARCHIVE.</p>
            </div>
         </div>

         <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
            <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>ENCRYPTION_STATUS</span>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)', marginTop: '8px', fontWeight: 600 }}>[ ARCHIVE_VERIFIED ]</div>
         </div>
      </aside>
    </div>
  );
}
