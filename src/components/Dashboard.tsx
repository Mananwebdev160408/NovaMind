import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Profile } from './Profile';

interface DashboardProps {
  user: any;
  modules: Record<string, { name: string; component: React.ReactNode; desc: string }>;
  isSidebarExpanded: boolean;
}

export function Dashboard({ user, modules, isSidebarExpanded }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeModule = location.pathname.split('/').pop() || null;

  const sidebarItems = [
    { id: 'research', label: 'Research', icon: '🧠' },
    { id: 'writing', label: 'Writing', icon: '✍️' },
    { id: 'code', label: 'Code Analysis', icon: '🏗️' },
    { id: 'notes', label: 'Notes', icon: '🗄️' },
    { id: 'language', label: 'Language', icon: '🎙️' },
    { id: 'meetings', label: 'Meetings', icon: '🎧' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'graph', label: 'Knowledge Graph', icon: '🌀' },
  ];

  const handleNavigate = (id: string) => {
    navigate(`/dashboard/${id}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Sidebar */}
      <aside 
        className="shell-sidebar animate-in" 
        style={{ width: isSidebarExpanded ? '240px' : '72px', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {sidebarItems.map(item => (
            <div 
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`nav-link ${activeModule === item.id ? 'active' : ''}`}
              style={{ 
                justifyContent: isSidebarExpanded ? 'flex-start' : 'center',
                padding: isSidebarExpanded ? '10px 12px' : '10px 0',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
              {isSidebarExpanded && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div 
            onClick={() => navigate('/dashboard/profile')}
            className={`nav-link ${activeModule === 'profile' ? 'active' : ''}`}
            style={{ 
              justifyContent: isSidebarExpanded ? 'flex-start' : 'center',
              padding: isSidebarExpanded ? '10px 12px' : '10px 0',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>👤</span>
            {isSidebarExpanded && <span>Profile Settings</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, minWidth: 0, padding: '40px' }} className="animate-in">
        <Routes>
          <Route index element={
            <div style={{ maxWidth: '1000px' }}>
              <div style={{ marginBottom: '48px' }}>
                <h1 style={{ marginBottom: '16px' }}>Welcome back, {user?.profile?.name || 'User'}</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>
                  Your personal workspace is secure and synchronized. Select a tool to begin.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                <div 
                  className="card card-interactive" 
                  onClick={() => handleNavigate('writing')}
                  style={{ gridColumn: 'span 2' }}
                >
                  <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase' }}>Continue Writing</div>
                  <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Recent Documents</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '24px' }}>Resume your work on the last draft. All changes are saved to your private vault.</p>
                  <button className="btn btn-primary">Open Writing Assistant</button>
                </div>

                <div className="card card-interactive" onClick={() => handleNavigate('graph')}>
                   <h3 style={{ marginBottom: '12px' }}>Knowledge Graph</h3>
                   <div style={{ height: '120px', background: 'var(--bg-hover)', borderRadius: 'var(--radius)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ opacity: 0.2, fontSize: '40px' }}>🌀</span>
                   </div>
                   <button className="btn btn-secondary" style={{ width: '100%' }}>View Map</button>
                </div>

                <div className="card card-interactive" onClick={() => handleNavigate('privacy')}>
                   <h3 style={{ marginBottom: '8px' }}>Privacy Status</h3>
                   <p style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>Active Isolation</p>
                   <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '12px' }}>Your data is isolated and encrypted locally.</p>
                </div>
              </div>
            </div>
          } />
          <Route path="profile" element={<Profile user={user} />} />
          {Object.keys(modules).map(key => (
            <Route key={key} path={key} element={modules[key].component} />
          ))}
        </Routes>
      </main>

      <style>{`
        @media (max-width: 768px) {
           .shell-sidebar { display: none !important; }
           main { padding: 24px !important; }
        }
      `}</style>
    </div>
  );
}
