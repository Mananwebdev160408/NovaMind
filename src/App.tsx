import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { CommandPalette } from './components/CommandPalette';
import { WritingAssistant } from './modules/WritingAssistant';
import { CodeEngine } from './modules/CodeEngine';
import { DocumentResearch } from './modules/DocumentResearch';
import { LanguageLearning } from './modules/LanguageLearning';
import { MeetingTranscription } from './modules/MeetingTranscription';
import { PrivacyDashboard } from './modules/PrivacyDashboard';
import { KnowledgeGraph } from './modules/KnowledgeGraph';
import { NotesModule } from './modules/NotesModule';
import './styles/index.css';

// Protected Route Component
const ProtectedRoute = ({ user, children }: { user: any; children: React.ReactNode }) => {
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }

    const load = async () => {
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Command Palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleSidebar = () => setIsSidebarExpanded(prev => !prev);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', background: 'var(--bg-midnight)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--accent-indigo)', borderRadius: '8px', animation: 'loadRotate 2s infinite cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 0 30px var(--accent-glow)' }} />
        <h2 style={{ marginTop: '48px', letterSpacing: '0.4em', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>NOVAMIND</h2>
        <div className="mono" style={{ marginTop: '16px', opacity: 0.3, fontSize: '9px' }}>PROTOCOL_INITIALIZING...</div>
        <style>{` 
          @keyframes loadRotate { 
            0% { transform: scale(0.8) rotate(0deg); opacity: 0.5; } 
            50% { transform: scale(1.1) rotate(180deg); opacity: 1; } 
            100% { transform: scale(0.8) rotate(360deg); opacity: 0.5; } 
          } 
        `}</style>
      </div>
    );
  }

  const modules = {
    'writing': { name: 'Cognitive Drafting', component: <WritingAssistant />, desc: 'Neural assisted writing environment' },
    'code': { name: 'Architecture Scan', component: <CodeEngine />, desc: 'Structural AST analysis' },
    'research': { name: 'Research Core', component: <DocumentResearch />, desc: 'Semantic knowledge extraction' },
    'language': { name: 'Language Arena', component: <LanguageLearning />, desc: 'Vocal sync practice' },
    'meetings': { name: 'Neural Audio', component: <MeetingTranscription />, desc: 'Isolated hardware transcription' },
    'privacy': { name: 'Privacy Core', component: <PrivacyDashboard />, desc: 'Hardware isolation control' },
    'graph': { name: 'Knowledge Graph', component: <KnowledgeGraph />, desc: 'Relational logic mapping' },
    'notes': { name: 'Atomic Vault', component: <NotesModule />, desc: 'Decentralized thought archive' }
  };

  return (
    <div className="App">
      <Navbar 
        activeModule={location.pathname.split('/').pop() || null} 
        onNavigate={() => {}} // No longer used directly for module switching
        isLoggedIn={!!user}
        onAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarExpanded={isSidebarExpanded}
        onToggleSidebar={toggleSidebar}
      />
      
      {isAuthOpen && <Auth onSuccess={handleAuthSuccess} onClose={() => setIsAuthOpen(false)} />}
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)}
        modules={modules}
      />

      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage onAuth={() => setIsAuthOpen(true)} />} />
        <Route path="/dashboard/*" element={
          <ProtectedRoute user={user}>
            <Dashboard 
              user={user} 
              isSidebarExpanded={isSidebarExpanded}
              modules={modules}
            />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
