import React from 'react';

type Module =
  | 'home'
  | 'writing'
  | 'notes'
  | 'research'
  | 'meeting'
  | 'code'
  | 'language'
  | 'knowledge'
  | 'privacy';

interface NavbarProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeModule, setActiveModule }) => {
  const navItems: { id: Module; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'writing', label: 'Write' },
    { id: 'notes', label: 'Notes' },
    { id: 'research', label: 'Research' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'code', label: 'Code' },
    { id: 'language', label: 'Language' },
    { id: 'knowledge', label: 'Graph' },
    { id: 'privacy', label: 'Privacy' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo" onClick={() => setActiveModule('home')}>
          <img src="/favicon.png" alt="Logo" className="navbar-icon" />
          NovaMind
        </div>
        <div className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(3, 7, 18, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 16px 0;
        }
        .navbar-content {
          display: flex;
          align-items: center;
          position: relative;
          padding: 0 40px;
          width: 100%;
        }
        .navbar-logo {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          cursor: pointer;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .navbar-icon {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }
        .navbar-logo:hover {
          opacity: 0.8;
        }
        .navbar-links {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }
        .nav-link {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-link.active {
          color: var(--primary);
          background: rgba(255, 85, 0, 0.1);
        }
        @media (max-width: 900px) {
          .navbar-links {
            display: none; /* In a real app we'd add a mobile menu */
          }
        }
      `}</style>
    </nav>
  );
};
