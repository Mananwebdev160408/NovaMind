import React, { useState } from 'react';

export function MeetingTranscription() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="dossier-grid" style={{ background: 'var(--bg-midnight)' }}>
      {/* Sidebar: Archive Management */}
      <aside style={{ padding: '48px 32px', borderRight: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '64px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>MODULE_SECTION</span>
          <h3 style={{ fontSize: '24px', fontWeight: 600, marginTop: '8px' }}>Neural Audio</h3>
          <div className="mono" style={{ fontSize: '9px', marginTop: '8px', color: 'var(--accent-indigo)', fontWeight: 600 }}>MIC_READY</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <span className="mono" style={{ fontSize: '10px', opacity: 0.4, marginBottom: '16px' }}>SESSIONS</span>
          <button className="mono" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', color: 'var(--text-primary)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', borderRadius: 'var(--radius-sm)' }}>
            Current_Session
          </button>
          <button className="mono" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', cursor: 'pointer' }}>
            Weekly_Sync_Archive
          </button>
          <button className="mono" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', cursor: 'pointer' }}>
            Core_Directives
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
           <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>DECRYPTOR_CORE</span>
           <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--accent-indigo)', marginTop: '12px' }}>
              <span className="mono" style={{ fontSize: '9px', color: 'var(--accent-indigo)', fontWeight: 700 }}>[ ACTIVE_TUNNEL_OK ]</span>
           </div>
        </div>
      </aside>

      {/* Main Transcript Arena */}
      <main className="flex-column" style={{ padding: '0' }}>
         <header style={{ padding: '32px clamp(24px, 5vw, 64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', borderBottom: '1px solid var(--border-ghost)' }}>
          <div>
            <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>ACTIVE_SESSION</span>
            <h1 style={{ fontSize: '32px', marginTop: '8px' }}>Active Session</h1>
          </div>
          <button 
             className="btn-premium" 
             style={{ 
               padding: '12px 32px', 
               background: isRecording ? 'var(--accent-indigo)' : 'transparent', 
               color: isRecording ? 'var(--bg-midnight)' : 'var(--text-primary)',
               borderColor: isRecording ? 'var(--accent-indigo)' : 'var(--border-ghost)',
               fontSize: '10px'
             }}
             onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? 'Halt Session' : 'Initiate Session'}
          </button>
        </header>

        <section style={{ flex: 1, padding: 'clamp(32px, 8vw, 64px)', display: 'flex', flexDirection: 'column', gap: '48px', overflowY: 'auto' }}>
           <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border-ghost)', paddingBottom: '16px', flexWrap: 'wrap' }}>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-indigo)', fontWeight: 600 }}>LIVE: WEEKLY_SYNC.WAV</span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱ 14:32</span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-soft)', fontWeight: 600 }}>99.8% ACCURACY</span>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ borderLeft: '3px solid var(--accent-indigo)', paddingLeft: 'clamp(20px, 4vw, 32px)' }}>
                 <span className="mono" style={{ color: 'var(--accent-indigo)', fontSize: '10px', marginBottom: '12px', display: 'block', fontWeight: 600 }}>SPEAKER_A [CORE]</span>
                 <p style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: 1.6, color: 'var(--text-primary)', fontWeight: 300 }}>
                   Welcome to the NovaMind core updates. We're looking at the <span style={{ textDecoration: 'underline', textUnderlineOffset: '8px', color: 'var(--accent-soft)', fontWeight: 500 }}>WebGPU acceleration</span> for the transcription layer.
                 </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--border-ghost)', paddingLeft: 'clamp(20px, 4vw, 32px)' }}>
                 <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '12px', display: 'block', opacity: 0.5 }}>SPEAKER_B [ENGINE]</span>
                 <p style={{ fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: 1.6, color: 'var(--text-muted)', fontWeight: 300 }}>
                   That's impressive. Are we maintaining the 99.8% accuracy threshold with the new neural pruning?
                 </p>
              </div>
           </div>
        </section>
      </main>

      {/* Semantic Intel Sidebar */}
      <aside style={{ padding: '48px 32px', borderLeft: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
         <h3 className="mono" style={{ color: 'var(--accent-indigo)', marginBottom: '40px', fontSize: '14px' }}>SEMANTIC_INTEL</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>ACTION_ITEM</span>
               <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.5, marginTop: '12px', fontWeight: 300 }}>Migrate neural layers to Metal backend by EOD.</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px' }}>
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>KEY_CONCEPT</span>
               <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.5, marginTop: '12px', fontWeight: 300 }}>Neural pruning as a validation strategy for on-device inference.</p>
            </div>
         </div>

         <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
            <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>SENTIMENT_TRACK</span>
            <div style={{ display: 'flex', gap: '6px', height: '40px', alignItems: 'flex-end', marginTop: '24px' }}>
               {[40, 70, 45, 90, 65, 80, 50, 85, 40, 95].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: 'var(--bg-surface)', height: `${h}%`, position: 'relative', borderRadius: '1px', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', top: 0, left: 0, background: h > 60 ? 'var(--accent-indigo)' : 'var(--border-ghost)', height: '100%', width: '100%', opacity: 0.3 }}></div>
                     <div style={{ position: 'absolute', top: 0, left: 0, background: h > 60 ? 'var(--accent-indigo)' : 'var(--text-muted)', height: '2px', width: '100%' }}></div>
                  </div>
               ))}
            </div>
         </div>
      </aside>
    </div>
  );
}
