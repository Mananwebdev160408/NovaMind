import { useState, useEffect } from 'react';
import { initSDK, getAccelerationMode } from './runanywhere';
import { initDB } from './lib/storage';

// Module components
import { WritingAssistant } from './modules/WritingAssistant';
import { NotesModule } from './modules/NotesModule';
import { LanguageLearning } from './modules/LanguageLearning';
import { DocumentResearch } from './modules/DocumentResearch';
import { CodeEngine } from './modules/CodeEngine';
import { MeetingTranscription } from './modules/MeetingTranscription';
import { KnowledgeGraph } from './modules/KnowledgeGraph';
import { PrivacyDashboard } from './modules/PrivacyDashboard';

type Module =
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
  const [activeModule, setActiveModule] = useState<Module>('writing');
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
        <h2>🧠 Initializing NovaMind</h2>
        <p>Loading on-device AI engine & local storage...</p>
        <p className="text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>
          100% Private • Zero Cloud • Full Intelligence
        </p>
      </div>
    );
  }

  const accel = getAccelerationMode();

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 NovaMind</h1>
        {accel && (
          <span className="badge" title={accel === 'webgpu' ? 'GPU Accelerated' : 'CPU Mode'}>
            {accel === 'webgpu' ? 'WebGPU' : 'CPU'}
          </span>
        )}
        <button
          className="btn btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={() => setCommandPaletteOpen(true)}
          title="Command Palette (⌘K / Ctrl+K)"
        >
          ⌘K
        </button>
      </header>

      <nav className="tab-bar">
        <button
          className={activeModule === 'writing' ? 'active' : ''}
          onClick={() => setActiveModule('writing')}
          title="Smart Writing Assistant"
        >
          ✍️ Write
        </button>
        <button
          className={activeModule === 'notes' ? 'active' : ''}
          onClick={() => setActiveModule('notes')}
          title="Intelligent Notes"
        >
          📓 Notes
        </button>
        <button
          className={activeModule === 'research' ? 'active' : ''}
          onClick={() => setActiveModule('research')}
          title="Document Research"
        >
          📄 Research
        </button>
        <button
          className={activeModule === 'meeting' ? 'active' : ''}
          onClick={() => setActiveModule('meeting')}
          title="Meeting Transcription"
        >
          🎙️ Meeting
        </button>
        <button
          className={activeModule === 'code' ? 'active' : ''}
          onClick={() => setActiveModule('code')}
          title="Code Documentation"
        >
          💻 Code
        </button>
        <button
          className={activeModule === 'language' ? 'active' : ''}
          onClick={() => setActiveModule('language')}
          title="Language Learning"
        >
          🌍 Language
        </button>
        <button
          className={activeModule === 'knowledge' ? 'active' : ''}
          onClick={() => setActiveModule('knowledge')}
          title="Knowledge Graph"
        >
          🧩 Graph
        </button>
        <button
          className={activeModule === 'privacy' ? 'active' : ''}
          onClick={() => setActiveModule('privacy')}
          title="Privacy Dashboard"
        >
          🔒 Privacy
        </button>
      </nav>

      <main className="tab-content">
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
