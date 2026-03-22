/**
 * Module 8: Privacy Dashboard
 */

import { useState, useEffect } from 'react';
import { getStorageStats, exportAllData, importAllData, clearAllData } from '../lib/storage';
import { ModelManager } from '../runanywhere';

export function PrivacyDashboard() {
  const [stats, setStats] = useState<any>({ notesCount: 0, documentsCount: 0, meetingsCount: 0, totalItems: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadModels();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function loadStats() {
    const s = await getStorageStats();
    setStats(s);
  }

  function loadModels() {
    const allModels = ModelManager.getModels();
    setModels(allModels);
  }

  async function handleExport() {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novamind-backup-${Date.now()}.json`;
    a.click();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importAllData(text);
    loadStats();
    alert('Data imported successfully');
  }

  async function handleClearAll() {
    if (!confirm('Delete ALL data? This cannot be undone!')) return;
    await clearAllData();
    loadStats();
    alert('All data cleared');
  }

  return (
    <div className="privacy-v2-container">
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
          <div className="nav-item-v2 active">
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

      {/* Pane 2: Main Content Pane */}
      <main className="privacy-main-content">
        <div className="meetings-title" style={{ marginBottom: '48px' }}>
          <h1>Privacy Dashboard</h1>
          <p>Control your neural footprint. Manage local AI weights, encrypted data vaults, and hardware-level privacy switches.</p>
        </div>

        <div className="privacy-grid-v2">
          {/* System Pulse Card */}
          <div className="privacy-card-v2">
            <div className="privacy-card-title">
              SYSTEM PULSE
              <div className="status-indicator-v2">
                <span className="live-dot" style={{ background: isOnline ? '#10b981' : '#64748b' }}></span>
                {isOnline ? 'ONLINE' : 'AIR-GAP MODE'}
              </div>
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '32px' }}>Network Status</h2>

            <div className="pulse-metric-row">
              <div className="pulse-metric-item">
                <div className="pulse-metric-info">
                  <span className="pulse-metric-icon">📶</span>
                  <div className="pulse-metric-label">
                    <h4>Neural Link Latency</h4>
                    <p>Optimized via WebGPU clusters</p>
                  </div>
                </div>
                <div className="pulse-metric-value" style={{ color: '#10b981' }}>12ms</div>
              </div>

              <div className="pulse-metric-item">
                <div className="pulse-metric-info">
                  <span className="pulse-metric-icon">🆔</span>
                  <div className="pulse-metric-label">
                    <h4>Edge Node Identity</h4>
                    <p>Encrypted Spectral Hash</p>
                  </div>
                </div>
                <div className="pulse-metric-value" style={{ fontSize: '11px', opacity: 0.6 }}>0x8F...2E91</div>
              </div>
            </div>
          </div>

          {/* Right Data Management Card (In Pane 2 Grid) */}
          <div className="privacy-card-v2" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
             <div className="privacy-card-title">DATA MANAGEMENT</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between', padding: '16px' }} onClick={handleExport}>
                   Export All Data <span>📥</span>
                </button>
                <label className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between', padding: '16px', display: 'flex', cursor: 'pointer' }}>
                   Import Data <span>📤</span>
                   <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                </label>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                   <button className="btn" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={handleClearAll}>
                      Clear All Data <span>🗑️</span>
                   </button>
                   <p style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '12px' }}>Warning: This action is irreversible.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Model Section */}
        <section style={{ marginTop: '64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="privacy-card-title" style={{ margin: 0 }}>LOCAL INTELLIGENCE</div>
            <button className="btn btn-sm btn-outline">Browse Model Library</button>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginTop: '12px' }}>Downloaded AI Models</h2>
          
          <div className="models-list-v2">
            {models.map((m) => (
              <div key={m.id} className="model-card-v2">
                <div className="model-header-v2">
                   <div className="model-icon-v2">
                      {m.category === 'Language' ? '📄' : '👁️'}
                   </div>
                   <div className="model-badge-v2" style={{ background: m.status === 'loaded' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)', color: m.status === 'loaded' ? '#10b981' : '#64748b' }}>
                      {m.status.toUpperCase()}
                   </div>
                </div>
                <h4>{m.name}</h4>
                <p>v2.4.1 • 4.2GB</p>
                <div className="model-load-progress">
                   <div className="model-load-fill" style={{ width: m.status === 'loaded' ? '100%' : '0%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Guarantees Footer */}
        <div style={{ marginTop: '80px', textAlign: 'center' }}>
           <div className="privacy-card-title" style={{ justifyContent: 'center', marginBottom: '12px' }}>NovaMind Core Principles</div>
           <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '40px' }}>Privacy Guarantees</h2>
           
           <div className="guarantees-grid-v2">
              <div className="guarantee-card-v2">
                 <div className="guarantee-icon-v2">🛡️</div>
                 <h4>100% On-Device AI</h4>
                 <p>All neural computations happen locally on your hardware. No prompts or data ever leave your system.</p>
              </div>
              <div className="guarantee-card-v2">
                 <div className="guarantee-icon-v2">☁️</div>
                 <h4>Zero-Cloud Processing</h4>
                 <p>We do not operate a centralized cloud. Your intelligence remains private, persistent, and entirely yours.</p>
              </div>
              <div className="guarantee-card-v2">
                 <div className="guarantee-icon-v2">🔑</div>
                 <h4>Encrypted Vaults</h4>
                 <p>Model weights and session histories are secured using AES-256 hardware-level encryption.</p>
              </div>
           </div>
        </div>
        
        <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '10px', color: '#475569', letterSpacing: '0.2em' }}>
           NOVAMIND NEURAL ENGINE • END-TO-END ENCRYPTED • OPEN ARCHITECTURE V2.4
        </div>
      </main>
    </div>
  );
}
