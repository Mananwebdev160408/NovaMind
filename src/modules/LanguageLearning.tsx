import React from 'react';

export function LanguageLearning() {
  return (
    <div className="dossier-grid" style={{ background: 'var(--bg-midnight)' }}>
      {/* Sidebar: Practica Context */}
      <aside style={{ padding: '48px 32px', borderRight: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '64px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>MODULE_SECTION</span>
          <h3 style={{ fontSize: '24px', fontWeight: 600, marginTop: '8px' }}>Language Arena</h3>
          <div className="mono" style={{ fontSize: '9px', marginTop: '8px', color: 'var(--accent-indigo)', fontWeight: 600 }}>VOCAL_SYNC_ACTIVE</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <span className="mono" style={{ fontSize: '10px', opacity: 0.4, marginBottom: '16px' }}>TRACKS</span>
          <button className="mono" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', color: 'var(--text-primary)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', borderRadius: 'var(--radius-sm)' }}>
            Spanish Core
          </button>
          <button className="mono" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', cursor: 'pointer' }}>
            German Advanced
          </button>
          <button className="mono" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', cursor: 'pointer' }}>
            Mandarin Flux
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
           <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>DAILY_CONSISTENCY</span>
           <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                 <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < 5 ? 'var(--accent-indigo)' : 'var(--bg-surface)', border: `1px solid ${i < 5 ? 'var(--accent-indigo)' : 'var(--border-ghost)'}` }}></div>
              ))}
           </div>
        </div>
      </aside>

      {/* Main Conversation Arena */}
      <main className="flex-column" style={{ padding: '0' }}>
        <header style={{ padding: '32px clamp(24px, 5vw, 64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-ghost)' }}>
          <div>
            <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>ACTIVE_SESSION</span>
            <h1 style={{ fontSize: '32px', marginTop: '8px' }}>Spanish Arena</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button className="btn-premium secondary" style={{ padding: '6px 12px', fontSize: '10px' }}>Voice Input</button>
             <button className="btn-premium secondary" style={{ padding: '6px 12px', fontSize: '10px' }}>Hide Translation</button>
          </div>
        </header>

        <section style={{ flex: 1, padding: 'clamp(32px, 8vw, 64px)', display: 'flex', flexDirection: 'column', gap: '48px', overflowY: 'auto' }}>
           <div style={{ maxWidth: 'min(500px, 85%)', alignSelf: 'flex-start' }}>
              <span className="mono" style={{ color: 'var(--accent-indigo)', fontSize: '10px', marginBottom: '12px', display: 'block', fontWeight: 600 }}>NEURAL_AI</span>
              <div style={{ fontSize: 'clamp(20px, 4vw, 26px)', lineHeight: 1.4, color: 'var(--text-primary)', fontWeight: 300 }}>
                ¿Cómo puedo ayudarte con tu <span style={{ textDecoration: 'underline', textUnderlineOffset: '8px', color: 'var(--accent-soft)', fontWeight: 500 }}>práctica</span> de hoy?
              </div>
              <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', opacity: 0.5 }}>[ How can I help you with your practice today? ]</div>
           </div>

           <div style={{ maxWidth: 'min(500px, 85%)', alignSelf: 'flex-end', textAlign: 'right' }}>
              <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '12px', display: 'block', opacity: 0.4 }}>USER_NODE</span>
              <div className="glass-panel" style={{ fontSize: 'clamp(14px, 2.5vw, 20px)', lineHeight: 1.4, color: 'var(--text-primary)', padding: '24px', border: '1px solid var(--accent-indigo)', background: 'var(--bg-surface)', textAlign: 'left', fontWeight: 300 }}>
                Quiero hablar sobre mis planes para el fin de semana.
              </div>
           </div>
        </section>

        <div style={{ padding: '24px clamp(24px, 5vw, 64px)', borderTop: '1px solid var(--border-ghost)' }}>
           <input
              type="text"
              placeholder="Initiate vocalization sequence..."
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 'clamp(14px, 2vw, 18px)',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                letterSpacing: '0.05em'
              }}
           />
        </div>
      </main>

      {/* Grammar Intel Sidebar */}
      <aside style={{ padding: '48px 32px', borderLeft: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
         <h3 className="mono" style={{ color: 'var(--accent-indigo)', marginBottom: '40px', fontSize: '14px' }}>GRAMMAR_INTEL</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ borderLeft: '3px solid var(--accent-indigo)', padding: '24px' }}>
               <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)', fontWeight: 600 }}>CORRECTION</span>
               <h4 style={{ fontSize: '20px', marginTop: '12px' }}>Mis planes</h4>
               <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5, fontWeight: 300 }}>Gender agreement confirmed. Correct possessive adjective usage.</p>
            </div>

            <div className="glass-panel" style={{ borderLeft: '3px solid var(--accent-soft)', padding: '24px' }}>
               <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-soft)', fontWeight: 600 }}>VOCAB_UPGRADE</span>
               <h4 style={{ fontSize: '20px', marginTop: '12px' }}>Proyectos</h4>
               <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 300 }}>Consider 'proyectos' for formal professional contexts.</p>
            </div>
         </div>

         <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
            <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>FLUENCY_STATUS</span>
            <div style={{ fontSize: '32px', fontWeight: 600, marginTop: '8px' }}>88% <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACCURACY</span></div>
         </div>
      </aside>
    </div>
  );
}
