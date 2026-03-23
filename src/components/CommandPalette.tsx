import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';

interface CommandItem {
  id: string;
  name: string;
  description: string;
  category: string;
  action: () => void;
  icon?: string;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  modules?: any;
}

export function CommandPalette({ isOpen, onClose, modules = {} }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [results, setResults] = useState<CommandItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Build command list
  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', name: 'Go to Dashboard', description: 'Main dashboard view', category: 'Navigation', action: () => navigate('/dashboard') },
    { id: 'nav-writing', name: 'Writing Assistant', description: 'AI-powered writing environment', category: 'Navigation', action: () => navigate('/dashboard/writing'), icon: '✍️' },
    { id: 'nav-notes', name: 'Notes', description: 'Intelligent note-taking', category: 'Navigation', action: () => navigate('/dashboard/notes'), icon: '📝' },
    { id: 'nav-docs', name: 'Document Research', description: 'Analyze documents & PDFs', category: 'Navigation', action: () => navigate('/dashboard/research'), icon: '📄' },
    { id: 'nav-meetings', name: 'Meeting Transcription', description: 'Record and transcribe meetings', category: 'Navigation', action: () => navigate('/dashboard/meetings'), icon: '🎙️' },
    { id: 'nav-language', name: 'Language Learning', description: 'Practice pronunciation', category: 'Navigation', action: () => navigate('/dashboard/language'), icon: '🌍' },
    { id: 'nav-code', name: 'Code Engine', description: 'Document and analyze code', category: 'Navigation', action: () => navigate('/dashboard/code'), icon: '💻' },
    { id: 'nav-graph', name: 'Knowledge Graph', description: 'Visualize connections', category: 'Navigation', action: () => navigate('/dashboard/graph'), icon: '🕸️' },
    { id: 'nav-privacy', name: 'Privacy Dashboard', description: 'Monitor data & encryption', category: 'Navigation', action: () => navigate('/dashboard/privacy'), icon: '🔒' },

    // Actions
    { id: 'action-new-note', name: 'New Note', description: 'Create a new note', category: 'Actions', action: () => { navigate('/dashboard/notes'); setTimeout(() => { /* trigger new note */ }, 100); }, shortcut: '⌘N' },
    { id: 'action-new-doc', name: 'New Writing Document', description: 'Start a new draft', category: 'Actions', action: () => { navigate('/dashboard/writing'); setTimeout(() => { /* trigger new doc */ }, 100); } },
    { id: 'action-upload-pdf', name: 'Upload Document', description: 'Upload PDF or text file', category: 'Actions', action: () => { navigate('/dashboard/research'); setTimeout(() => { /* trigger upload */ }, 100); } },
    { id: 'action-start-recording', name: 'Start Recording', description: 'Begin meeting transcription', category: 'Actions', action: () => { navigate('/dashboard/meetings'); setTimeout(() => { /* start recording */ }, 100); } },
    { id: 'action-practice-language', name: 'Practice Language', description: 'Start pronunciation practice', category: 'Actions', action: () => { navigate('/dashboard/language'); setTimeout(() => { /* start practice */ }, 100); } },

    // Settings
    { id: 'settings-theme', name: 'Toggle Theme', description: 'Switch between dark/light mode', category: 'Settings', action: () => { /* toggle theme */ } },
    { id: 'settings-profile', name: 'Edit Profile', description: 'Update your profile', category: 'Settings', action: () => { /* open profile modal */ } },
    { id: 'settings-preferences', name: 'Preferences', description: 'Configure app settings', category: 'Settings', action: () => { /* open preferences */ } },

    // Help
    { id: 'help-docs', name: 'Documentation', description: 'View documentation', category: 'Help', action: () => window.open('https://docs.runanywhere.ai/', '_blank') },
    { id: 'help-shortcuts', name: 'Keyboard Shortcuts', description: 'View all shortcuts', category: 'Help', action: () => { /* show shortcuts modal */ } },
  ];

  // Fuse.js configuration
  const fuse = new Fuse(commands, {
    keys: ['name', 'description', 'category'],
    threshold: 0.3,
    includeScore: true
  });

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelected(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(commands);
    } else {
      const fuseResults = fuse.search(query);
      setResults(fuseResults.map(r => r.item));
    }
    setSelected(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selected]) {
        results[selected].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20vh 24px 24px'
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-thin)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Search Input */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-ghost)' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            style={{
              width: '100%',
              background: 'var(--bg-obsidian)',
              border: '1px solid var(--border-thin)',
              padding: '16px',
              fontSize: '16px',
              color: 'var(--text-primary)',
              outline: 'none',
              borderRadius: 'var(--radius-sm)'
            }}
          />
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '12px' }}>
            ↑↓ Navigate • ↵ Select • ESC Dismiss
          </div>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span className="mono" style={{ fontSize: '10px' }}>NO_RESULTS_FOUND</span>
            </div>
          ) : (
            results.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => { item.action(); onClose(); }}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: idx === selected ? 'var(--bg-obsidian)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-ghost)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'background 0.15s'
                }}
              >
                {item.icon && (
                  <span style={{ fontSize: '24px', minWidth: '24px' }}>{item.icon}</span>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {item.description}
                  </div>
                </div>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', opacity: 0.5 }}>
                  {item.category}
                </div>
                {item.shortcut && (
                  <div className="mono" style={{ 
                    fontSize: '10px', 
                    color: 'var(--text-dim)', 
                    padding: '4px 8px', 
                    background: 'var(--bg-midnight)',
                    border: '1px solid var(--border-ghost)',
                    borderRadius: '4px'
                  }}>
                    {item.shortcut}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div style={{ padding: '16px 24px', background: 'var(--bg-midnight)', borderTop: '1px solid var(--border-ghost)' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', textAlign: 'center' }}>
            NEURAL_COMMAND_INTERFACE_v2.1 • {results.length} {results.length === 1 ? 'RESULT' : 'RESULTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
