import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  isLoggedIn: boolean;
  onAuth: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isSidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
  activeModule?: string | null;
  onNavigate?: () => void;
}

export function Navbar({ 
  isLoggedIn, onAuth, onLogout, 
  theme, toggleTheme, isSidebarExpanded, onToggleSidebar,
  activeModule, onNavigate
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const handleAuthRedirect = () => {
    onAuth();
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Capabilities', to: '/#features' },
    { label: 'Privacy', to: '/#privacy' },
    { label: 'About', to: '/#about' }
  ];

  return (
    <header className="shell-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0' }}>
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {isLoggedIn && (
            <button 
              onClick={onToggleSidebar} 
              className="btn btn-ghost"
              style={{ width: '40px', height: '40px', padding: '0' }}
            >
              <span style={{ transform: isSidebarExpanded ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.4s', fontSize: '18px' }}>←</span>
            </button>
          )}
          
          <Link to={isLoggedIn ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px' }} />
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>NovaMind</span>
          </Link>
        </div>

        {/* Middle: Desktop Nav */}
        {!isLoggedIn && (
          <nav className="desktop-only" style={{ display: 'flex', gap: '32px' }}>
            {navLinks.map(item => (
              <Link key={item.to} to={item.to} style={{ textDecoration: 'none', color: 'var(--text-dim)', fontSize: '14px', fontWeight: 500 }}>{item.label}</Link>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ fontSize: '18px', padding: '8px' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {!isLoggedIn ? (
            <button className="btn btn-primary" onClick={handleAuthRedirect}>Sign In</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                onClick={() => navigate('/dashboard/profile')} 
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: 'var(--accent-soft)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                }}
              >
                <span style={{ fontSize: '14px' }}>👤</span>
              </div>
              <button className="btn btn-ghost" onClick={() => { onLogout(); navigate('/'); }} style={{ color: 'var(--danger)', fontSize: '13px' }}>Sign Out</button>
            </div>
          )}
          
          {!isLoggedIn && (
            <button 
              className="mobile-only btn btn-ghost" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ fontSize: '20px' }}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {!isLoggedIn && isMobileMenuOpen && (
        <div style={{ position: 'fixed', top: '64px', left: 0, width: '100%', height: 'calc(100vh - 64px)', background: 'var(--bg-app)', padding: '32px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {navLinks.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '24px', fontWeight: 600 }}>{item.label}</Link>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
             <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={handleAuthRedirect}>Sign In</button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
        @media (max-width: 768px) { .desktop-only { display: none !important; } }
      `}</style>
    </header>
  );
}
