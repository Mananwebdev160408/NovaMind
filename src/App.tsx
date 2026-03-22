import { useState, useEffect } from 'react';
import { initSDK, getAccelerationMode } from './runanywhere';
import { initDB } from './lib/storage';

// Components
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';

// Module components
import { WritingAssistant } from './modules/WritingAssistant';
import { NotesModule } from './modules/NotesModule';
import { LanguageLearning } from './modules/LanguageLearning';
import { DocumentResearch } from './modules/DocumentResearch';
import { CodeEngine } from './modules/CodeEngine';
import { MeetingTranscription } from './modules/MeetingTranscription';
import { KnowledgeGraph } from './modules/KnowledgeGraph';
import { PrivacyDashboard } from './modules/PrivacyDashboard';

export type Module =
  | 'home'
  | 'writing'
  | 'notes'
  | 'language'
  | 'research'
  | 'code'
  | 'meeting'
  | 'knowledge'
  | 'privacy';

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<Module>('home');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    // Initialize SDK and Database
    Promise.all([initSDK(), initDB()])
      .then(() => {
        setSdkReady(true);
        setDbReady(true);
      })
      .catch((err) => setSdkError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    // Command Palette keyboard shortcut (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  if (sdkError) {
    return (
      <div className="app-loading">
        <h2>Initialization Error</h2>
        <p className="error-text">{sdkError}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload App
        </button>
      </div>
    );
  }

  if (!sdkReady || !dbReady) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <h2 style={{ fontFamily: 'var(--font-display)' }}>🧠 Initializing NovaMind</h2>
        <p>Loading on-device AI engine & local storage...</p>
        <p className="text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>
          100% Private • Zero Cloud • Full Intelligence
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar activeModule={activeModule} setActiveModule={setActiveModule} />

      <main className={activeModule === 'home' ? '' : 'tab-content'}>
        {activeModule === 'home' && (
          <LandingPage onGetStarted={() => setActiveModule('writing')} />
        )}
        {activeModule === 'writing' && <WritingAssistant />}
        {activeModule === 'notes' && <NotesModule />}
        {activeModule === 'language' && <LanguageLearning />}
        {activeModule === 'research' && <DocumentResearch />}
        {activeModule === 'code' && <CodeEngine />}
        {activeModule === 'meeting' && <MeetingTranscription />}
        {activeModule === 'knowledge' && <KnowledgeGraph />}
        {activeModule === 'privacy' && <PrivacyDashboard />}
      </main>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onSelectModule={(module) => {
            setActiveModule(module);
            setCommandPaletteOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Command Palette Component
interface CommandPaletteProps {
  onClose: () => void;
  onSelectModule: (module: Module) => void;
}

function CommandPalette({ onClose, onSelectModule }: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  const commands = [
    { id: 'home', icon: '🏠', label: 'Home', keywords: 'landing page start' },
    { id: 'writing', icon: '✍️', label: 'Writing Assistant', keywords: 'write text document email' },
    { id: 'notes', icon: '📓', label: 'Notes', keywords: 'note idea task meeting' },
    { id: 'research', icon: '📄', label: 'Document Research', keywords: 'pdf document research analyze' },
    { id: 'meeting', icon: '🎙️', label: 'Meeting Transcription', keywords: 'meeting record transcript' },
    { id: 'code', icon: '💻', label: 'Code Documentation', keywords: 'code programming develop' },
    { id: 'language', icon: '🌍', label: 'Language Learning', keywords: 'language learn speak practice' },
    { id: 'knowledge', icon: '🧩', label: 'Knowledge Graph', keywords: 'graph knowledge connect visual' },
    { id: 'privacy', icon: '🔒', label: 'Privacy Dashboard', keywords: 'privacy security storage data' },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.keywords.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          className="command-palette-search"
          placeholder="Search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="command-palette-results">
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              className="command-palette-item"
              onClick={() => onSelectModule(cmd.id as Module)}
            >
              <span className="command-palette-icon">{cmd.icon}</span>
              <span className="command-palette-label">{cmd.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="command-palette-empty">No modules found</div>
          )}
        </div>
        <div className="command-palette-footer">
          <kbd>↑↓</kbd> Navigate <kbd>Enter</kbd> Select <kbd>Esc</kbd> Close
        </div>
      </div>
    </div>
  );
}
