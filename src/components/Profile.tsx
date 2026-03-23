import React from 'react';

interface ProfileProps {
  user: any;
}

export function Profile({ user }: ProfileProps) {
  const stats = [
     { label: 'Neural Uptime', val: '99.99%', mono: true },
     { label: 'Hardware ID', val: 'ARCH-X-9942', mono: true },
     { label: 'Archive Size', val: '1.24 GB', mono: true },
     { label: 'Sync Status', val: 'ENCRYPTED', mono: true }
  ];

  return (
    <div style={{ padding: 'clamp(32px, 8vw, 64px)', background: 'var(--bg-midnight)', minHeight: 'calc(100vh - 72px)' }}>
       <section className="container-premium">
          <header style={{ marginBottom: '80px', borderBottom: '1px solid var(--border-ghost)', paddingBottom: '40px' }}>
             <span className="mono" style={{ color: 'var(--accent-indigo)' }}>OPERATOR_DOSSIER</span>
             <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', lineHeight: 0.9, marginTop: '16px' }}>
                {user?.email?.split('@')[0]} <span style={{ color: 'var(--accent-soft)', fontStyle: 'italic' }}>_identity</span>
             </h1>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px' }}>
             {/* Identity Details */}
             <div>
                <span className="mono" style={{ opacity: 0.4 }}>CORE_METADATA</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
                   {stats.map(s => (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-ghost)', paddingBottom: '16px' }}>
                         <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: 300 }}>{s.label}</span>
                         <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-indigo)' }}>{s.val}</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Security Actions */}
             <div className="glass-panel" style={{ padding: '48px', position: 'relative' }}>
                <span className="mono" style={{ opacity: 0.4 }}>SECURITY_PROTOCOLS</span>
                <h3 style={{ fontSize: '28px', marginTop: '16px', marginBottom: '24px' }}>Hardware Keys</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px', fontWeight: 300 }}>
                   User keys are managed locally via WebCrypto hardware isolation. Your biometric 
                   hash is not stored on this node.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <button className="btn-premium" style={{ width: '100%' }}>Rotate Encryption Keys</button>
                   <button className="btn-premium secondary" style={{ width: '100%' }}>Invalidate Sessions</button>
                </div>
             </div>
          </div>

          <section style={{ marginTop: '100px' }}>
             <span className="mono" style={{ opacity: 0.4 }}>ACTIVITY_TRACE</span>
             <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column' }}>
                {[
                  { time: 'T-1h', act: 'Neural Pruning v4.2 calibrated via Local Node' },
                  { time: 'T-4h', act: 'Authentication protocol established: Operator verified' },
                  { time: 'T-12h', act: 'Dossier "System_Manifesto" synced to Archive' }
                ].map((a, i) => (
                   <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 0', borderBottom: '1px solid var(--border-ghost)', alignItems: 'center' }}>
                      <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{a.time}</span>
                      <span style={{ fontSize: '18px', fontWeight: 300 }}>{a.act}</span>
                   </div>
                ))}
             </div>
          </section>
       </section>
    </div>
  );
}
