import React from 'react';

interface ProfileProps {
  user: any;
}

export function Profile({ user }: ProfileProps) {
  const stats = [
     { label: 'Cloud Sync', val: 'Active' },
     { label: 'Account Type', val: 'Standard' },
     { label: 'Storage Used', val: '1.24 GB' },
     { label: 'Member Since', val: 'March 2024' }
  ];

  return (
    <div style={{ padding: '64px 40px', background: 'var(--bg-app)', minHeight: '100vh' }}>
       <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <header style={{ marginBottom: '64px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
             <h1 style={{ fontSize: '48px', fontWeight: 600 }}>
                {user?.email?.split('@')[0]} <span style={{ color: 'var(--text-dim)', fontWeight: 300 }}>/ Profile</span>
             </h1>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '64px' }}>
             {/* Left Column: Details & Activity */}
             <div>
                <section style={{ marginBottom: '64px' }}>
                   <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '24px' }}>Details</h3>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {stats.map(s => (
                         <div key={s.label} className="card" style={{ padding: '20px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>{s.val}</div>
                         </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '24px' }}>Recent Activity</h3>
                   <div className="card" style={{ overflow: 'hidden' }}>
                      {[
                        { time: '1 hour ago', act: 'Document "Project Brief" updated' },
                        { time: '4 hours ago', act: 'New vault sync successful' },
                        { time: '1 day ago', act: 'Password changed successfully' }
                      ].map((a, i) => (
                         <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: i === 2 ? 'none' : '1px solid var(--border)', alignItems: 'center' }}>
                            <span style={{ fontSize: '15px' }}>{a.act}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{a.time}</span>
                         </div>
                      ))}
                   </div>
                </section>
             </div>

             {/* Right Column: Security */}
             <aside>
                <div className="card" style={{ padding: '32px' }}>
                   <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Account Security</h3>
                   <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
                      Manage your encryption keys and session access. Your data is protected using end-to-end local encryption.
                   </p>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button className="btn btn-primary" style={{ width: '100%' }}>Rotate Keys</button>
                      <button className="btn btn-secondary" style={{ width: '100%' }}>Sign Out All Devices</button>
                   </div>
                </div>

                <div className="card" style={{ padding: '24px', marginTop: '32px', background: 'var(--bg-light)', borderColor: 'var(--border)' }}>
                   <h4 style={{ fontSize: '13px', marginBottom: '12px' }}>Email Address</h4>
                   <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>{user?.email}</p>
                   <button className="btn btn-ghost" style={{ marginTop: '16px', padding: '0', fontSize: '12px' }}>Change Email</button>
                </div>
             </aside>
          </div>
       </div>
    </div>
  );
}
