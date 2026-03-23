import React from 'react';

interface LandingPageProps {
  onAuth: () => void;
}

export function LandingPage({ onAuth }: LandingPageProps) {
  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)' }}>
      {/* Hero Section */}
      <section className="container animate-in" style={{ padding: '120px 0 80px' }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.1, marginBottom: '24px' }}>
            A private space for your <span style={{ color: 'var(--accent)' }}>thoughts and research.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-dim)', marginBottom: '40px', maxWidth: '600px' }}>
            NovaMind is a minimalist personal assistant. Organise your notes, draft documents, 
            and interrogate your knowledge base—all in one secure, private environment.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onAuth} className="btn btn-primary" style={{ padding: '12px 32px' }}>Get Started</button>
            <button className="btn btn-secondary" style={{ padding: '12px 32px' }}>Learn More</button>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {[
              { title: 'Intelligence Core', desc: 'Secure research synthesis powered by local AI.', icon: '🧠' },
              { title: 'Atomic Vault', desc: 'A clean, minimalist archive for your thoughts.', icon: '🗄️' },
              { title: 'Neural Audio', desc: 'Hardware-isolated transcription and language practice.', icon: '🎙️' },
              { title: 'Architecture Scan', desc: 'Deep code inspection and structural logic analysis.', icon: '🏗️' }
            ].map((feature, i) => (
              <div key={i} className="card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: '32px', marginBottom: '24px' }}>{feature.icon}</div>
                <h3 style={{ marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 0 40px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '40px' }}>
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>NovaMind</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 NovaMind Core. All rights reserved.</p>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '13px' }}>Terms</a>
              <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '13px' }}>Privacy</a>
              <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '13px' }}>Github</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
