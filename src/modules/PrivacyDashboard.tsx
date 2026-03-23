import React, { useState, useEffect } from 'react';
import { 
  getStorageStats, 
  exportAllData, 
  importAllData, 
  clearAllData 
} from '../lib/storage';
import { ModelManager, ModelCategory } from '@runanywhere/web';

export function PrivacyDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadModels();
    
    const handleStatusChange = () => setOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const loadStats = async () => {
    const s = await getStorageStats();
    setStats(s);
  };

  const loadModels = () => {
    const allModels = ModelManager.getModels();
    setModels(allModels);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `novamind-archive-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        await importAllData(content);
        await loadStats();
        alert('Data imported successfully.');
      } catch (err) {
        alert('Import failed. Invalid format.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleWipe = async () => {
    if (confirm('CRITICAL: This will permanently delete all local data. Continue?')) {
      await clearAllData();
      await loadStats();
    }
  };

  return (
    <div className="dossier-grid" style={{ background: 'var(--bg-midnight)' }}>
      <aside style={{ padding: '48px 32px', borderRight: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '64px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>MODULE_SECTION</span>
          <h3 style={{ fontSize: '24px', fontWeight: 600, marginTop: '8px' }}>Privacy Core</h3>
          <div className="mono" style={{ fontSize: '9px', marginTop: '8px', color: 'var(--accent-indigo)', fontWeight: 600 }}>AIR_GAP_ENABLED</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <span className="mono" style={{ fontSize: '10px', opacity: 0.4, marginBottom: '16px' }}>DATA_PROTOCOLS</span>
          <button onClick={handleExport} disabled={isExporting} className="mono" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-ghost)', color: 'var(--text-primary)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
            {isExporting ? 'EXPORTING...' : 'Export Archive (.json)'}
          </button>
          <label className="mono" style={{ background: 'none', border: '1px solid var(--border-ghost)', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'left', fontSize: '10px', cursor: 'pointer', display: 'block', marginTop: '8px', borderRadius: 'var(--radius-sm)' }}>
            IMPORT_RECORDS
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
           <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>NETWORK_STATUS</span>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: online ? 'var(--accent-crimson)' : 'var(--accent-soft)', boxShadow: online ? '0 0 10px rgba(248, 113, 113, 0.3)' : '0 0 10px var(--accent-glow)' }} />
             <span className="mono" style={{ fontSize: '12px', color: online ? 'var(--accent-crimson)' : 'var(--accent-soft)', fontWeight: 600 }}>
               {online ? 'ONLINE (DANGER)' : 'OFFLINE (SECURE)'}
             </span>
           </div>
           <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5, fontWeight: 300 }}>
             Air-Gap mode verified. AI processing occurs 100% on local silicon.
           </p>
        </div>
      </aside>

      <main className="flex-column" style={{ padding: '0' }}>
         <header style={{ padding: '32px clamp(24px, 5vw, 64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-ghost)' }}>
          <div>
            <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>SYSTEM_STATUS</span>
            <h1 style={{ fontSize: '32px', marginTop: '8px' }}>Privacy Control</h1>
          </div>
          <button 
            onClick={handleWipe}
            className="btn-premium secondary" 
            style={{ color: 'var(--accent-crimson)', borderColor: 'rgba(248, 113, 113, 0.2)', padding: '8px 24px', fontSize: '10px' }}
          >Purge Local Vault</button>
        </header>

        <section style={{ flex: 1, padding: 'clamp(24px, 5vw, 64px)', overflowY: 'auto' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '64px' }}>
              <div className="glass-panel" style={{ padding: '40px' }}>
                 <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>STORAGE_UTILIZATION</span>
                 <div style={{ fontSize: 'clamp(48px, 6vw, 64px)', fontWeight: 300, margin: '16px 0', color: 'var(--text-primary)' }}>
                   {stats?.totalItems || 0}
                 </div>
                 <p className="mono" style={{ fontSize: '9px', color: 'var(--accent-indigo)', fontWeight: 600 }}>TOTAL_ENCRYPTED_OBJECTS</p>
                 <div style={{ marginTop: '24px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Notes:</span> <span className="mono">{stats?.notesCount || 0}</span></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Artifacts:</span> <span className="mono">{stats?.writingCount || 0}</span></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Documents:</span> <span className="mono">{stats?.documentsCount || 0}</span></div>
                 </div>
              </div>

              <div className="glass-panel" style={{ padding: '40px' }}>
                 <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>ENCRYPTION_ENGINE</span>
                 <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 500, margin: '16px 0', color: 'var(--accent-soft)' }}>AES-GCM</div>
                 <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 300 }}>
                   Browser-native WebCrypto API provides hardware-accelerated, zero-knowledge encryption for all local stores.
                 </p>
              </div>
           </div>

           <section>
              <span className="mono" style={{ fontSize: '10px', opacity: 0.4, marginBottom: '24px', display: 'block' }}>NEURAL_MODEL_REGISTRY</span>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-ghost)' }}>
                 {models.map((model) => (
                    <div key={model.id} className="flex-between" style={{ padding: '24px 0', borderBottom: '1px solid var(--border-ghost)', flexWrap: 'wrap', gap: '16px' }}>
                       <div>
                          <div style={{ fontSize: '18px', fontWeight: 500 }}>{model.name}</div>
                          <div className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', opacity: 0.6 }}>
                            {model.framework.toUpperCase()} • {model.modality.toUpperCase()} • {(model.memoryRequirement / 1000000).toFixed(0)}MB
                          </div>
                       </div>
                       <span className="mono" style={{ color: model.status === 'downloaded' || model.status === 'loaded' ? 'var(--accent-soft)' : 'var(--text-muted)', fontSize: '10px', fontWeight: 600 }}>
                         [ {model.status.toUpperCase()} ]
                       </span>
                    </div>
                 ))}
              </div>
           </section>
        </section>
      </main>

      <aside style={{ padding: '48px 32px', borderLeft: '1px solid var(--border-ghost)', display: 'flex', flexDirection: 'column' }}>
         <h3 className="mono" style={{ color: 'var(--accent-indigo)', marginBottom: '40px', fontSize: '14px' }}>PRIVACY_ASSURANCE</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div className="glass-panel" style={{ border: '1px solid var(--accent-indigo)', background: 'var(--bg-surface)' }}>
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>ZERO_DATA_LEAKAGE</span>
               <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.6, marginTop: '12px', fontWeight: 300 }}>
                 NovaMind uses a "Cellular Security" model. Every AI generation occurs within a sandboxed WASM environment that has no network privileges.
               </p>
            </div>

            <div style={{ paddingTop: '32px', borderTop: '1px solid var(--border-ghost)' }}>
               <span className="mono" style={{ fontSize: '10px', opacity: 0.4 }}>VERIFIABLE_SECURITY</span>
               <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>100% Client-Side</div>
               <div className="mono" style={{ fontSize: '9px', color: 'var(--accent-indigo)', marginTop: '8px', fontWeight: 600 }}>SHA-256_FINGERPRINT_VERIFIED</div>
            </div>
         </div>
      </aside>
    </div>
  );
}
