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
    <div className="module-container">
      <div className="module-header">
        <h2>🔒 Privacy Dashboard</h2>
        <p>100% on-device AI • Zero cloud • Full transparency</p>
      </div>

      <div className="module-content">
        <div className="module-card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Network Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isOnline ? 'var(--green)' : 'var(--red)' }} />
            <span>{isOnline ? 'Online' : 'Offline (Air-Gap Mode)'}</span>
          </div>
          {!isOnline && (
            <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              All features work offline. No data leaves your device.
            </p>
          )}
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{stats.notesCount}</div>
            <div className="metric-label">Notes</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.documentsCount}</div>
            <div className="metric-label">Documents</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.meetingsCount}</div>
            <div className="metric-label">Meetings</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.totalItems}</div>
            <div className="metric-label">Total Items</div>
          </div>
        </div>

        <div className="module-card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Downloaded AI Models</h3>
          {models.filter((m) => m.status === 'downloaded' || m.status === 'loaded').map((m) => (
            <div key={m.id} style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {m.category} • {m.status}
              </div>
            </div>
          ))}
        </div>

        <div className="module-card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Data Management</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn" onClick={handleExport}>
              📤 Export All Data
            </button>
            <label className="btn">
              📥 Import Data
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <button className="btn" onClick={handleClearAll} style={{ color: 'var(--red)' }}>
              🗑️ Clear All Data
            </button>
          </div>
        </div>

        <div className="module-card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Privacy Guarantees</h3>
          <ul style={{ fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>All AI runs locally in your browser via WebAssembly</li>
            <li>No data is ever sent to external servers</li>
            <li>Models and data stored in browser's sandboxed OPFS</li>
            <li>Works 100% offline after initial model download</li>
            <li>No analytics, no tracking, no telemetry</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
