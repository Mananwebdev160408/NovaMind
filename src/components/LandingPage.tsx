import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-content">
          <div className="badge animate-float">
            <span>⚡</span> POWERED BY WEBGPU
          </div>
          <h1 className="hero-title">
            Your Offline AI Assistant <br />
            <span className="text-primary-gradient">Powered by WebGPU</span>
          </h1>
          <p className="hero-subtitle">
            Experience lightning-fast tone transformation, expansion, and
            readability analysis directly in your browser. No server latency, just pure
            intelligence.
          </p>
        </div>

        {/* Visual Section */}
        <div className="hero-visual">
          <div className="visual-window">
            <div className="window-header">
              <div className="window-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="window-address">novamind.ai/editor/project-neural-core</div>
            </div>
            <div className="window-content">
              <div className="visual-sidebar">
                <div className="sidebar-group">
                  <div className="sidebar-label">WRITING TONE</div>
                  <div className="sidebar-item active">Professional <span>✓</span></div>
                  <div className="sidebar-item">Persuasive</div>
                  <div className="sidebar-item">Academic</div>
                </div>
                <div className="sidebar-group">
                  <div className="sidebar-label">INTELLIGENCE METRICS</div>
                  <div className="metric">
                    <div className="metric-header">Clarity <span>98%</span></div>
                    <div className="metric-bar"><div style={{ width: '98%' }}></div></div>
                  </div>
                  <div className="metric">
                    <div className="metric-header">Sentiment <span style={{ color: 'var(--primary)' }}>Positive</span></div>
                    <div className="metric-bar primary"><div style={{ width: '80%' }}></div></div>
                  </div>
                </div>
              </div>
              <div className="visual-main">
                <h2>The Future of Local AI Processing</h2>
                <p>
                  With NovaMind, we are pushing the boundaries of what is possible within a web browser.
                  By leveraging the <span style={{ textDecoration: 'underline' }}>raw power of WebGPU</span>, we eliminate the need for costly API roundtrips.
                </p>
                <div className="quote-box">
                  Every keystroke is processed locally on your hardware. This doesn't just mean privacy; it means
                  unprecedented speed and responsiveness that feels like a natural extension of your own
                  thought process.
                </div>
                <p>
                  Our neural engine analyzes tone, readability, and structural flow in real-time, providing feedback that is
                  both context-aware and technically precise.
                </p>
                <div className="suggestion-box">
                  <div className="suggestion-icon">🧠</div>
                  <div className="suggestion-text">
                    <div className="suggestion-label">AI SUGGESTION</div>
                    Change "pushing the boundaries" to "pioneering frontier architecture" for a more technical tone.
                  </div>
                  <button className="suggestion-btn">Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">NovaMind</div>
            <p>Engineered for performance. Built for writers.</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Status</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-copy">
            © 2024 NovaMind AI. Powered by WebGPU.
          </div>
        </div>
      </footer>

      <style>{`
        .landing-page {
          padding-top: 60px;
        }
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 48px;
          margin-bottom: 120px;
        }
        .hero-content {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .hero-title {
          font-size: 72px;
          line-height: 1.1;
          margin: 10px 0;
        }
        .hero-subtitle {
          font-size: 20px;
          color: var(--text-muted);
          max-width: 600px;
          line-height: 1.6;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          margin-top: 10px;
        }
        
        /* Visual Window Mockup */
        .hero-visual {
          width: 100%;
          max-width: 1000px;
          perspective: 1000px;
          margin-top: 40px;
        }
        .visual-window {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
          transform: rotateX(10deg) rotateY(-5deg) rotateZ(1deg);
          transition: transform 0.5s ease;
        }
        .visual-window:hover {
          transform: rotateX(5deg) rotateY(-2deg) rotateZ(0deg);
        }
        .window-header {
          background: rgba(255, 255, 255, 0.03);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .window-dots {
          display: flex;
          gap: 6px;
        }
        .window-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
        }
        .window-address {
          flex: 1;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          padding: 4px 12px;
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
        }
        .window-content {
          display: flex;
          min-height: 400px;
        }
        .visual-sidebar {
          width: 240px;
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          text-align: left;
        }
        .sidebar-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }
        .sidebar-item {
          font-size: 13px;
          color: var(--text-muted);
          padding: 8px 0;
          display: flex;
          justify-content: space-between;
        }
        .sidebar-item.active {
          color: white;
        }
        .metric {
          margin-bottom: 16px;
        }
        .metric-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 6px;
        }
        .metric-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .metric-bar div {
          height: 100%;
          background: var(--secondary);
          border-radius: 2px;
        }
        .metric-bar.primary div {
          background: var(--primary);
        }
        .visual-main {
          flex: 1;
          padding: 40px;
          text-align: left;
        }
        .visual-main h2 {
          font-size: 24px;
          margin-bottom: 24px;
        }
        .visual-main p {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .quote-box {
          border-left: 2px solid var(--primary);
          padding-left: 20px;
          margin: 30px 0;
          font-size: 15px;
          font-style: italic;
          color: var(--text);
          line-height: 1.6;
        }
        .suggestion-box {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 40px;
        }
        .suggestion-icon {
          width: 32px;
          height: 32px;
          background: var(--secondary);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .suggestion-text {
          flex: 1;
          font-size: 13px;
        }
        .suggestion-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .suggestion-btn {
          background: white;
          color: black;
          border: none;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Footer */
        .footer {
          border-top: 1px solid var(--border);
          padding: 60px 24px;
          margin-top: 80px;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 40px;
          align-items: center;
        }
        .footer-logo {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 8px;
        }
        .footer-brand p {
          font-size: 13px;
          color: var(--text-muted);
        }
        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: var(--text);
        }
        .footer-copy {
          grid-column: 1 / -1;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .hero-title { font-size: 48px; }
          .footer-content { grid-template-columns: 1fr; text-align: center; }
          .footer-links { justify-content: center; }
          .visual-window { transform: none; }
          .visual-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
};
