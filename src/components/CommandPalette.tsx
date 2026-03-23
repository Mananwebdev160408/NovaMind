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

  const commands: CommandItem[] = [
    { id: 'nav-dashboard', name: 'Go to Dashboard', description: 'Main overview', category: 'Navigation', action: () => navigate('/dashboard') },
    { id: 'nav-writing', name: 'Writing Assistant', description: 'AI-powered writing', category: 'Navigation', action: () => navigate('/dashboard/writing'), icon: '✍️' },
    { id: 'nav-notes', name: 'Notes', description: 'Note-taking module', category: 'Navigation', action: () => navigate('/dashboard/notes'), icon: '📝' },
    { id: 'nav-docs', name: 'Document Analysis', description: 'Analyze documents', category: 'Navigation', action: () => navigate('/dashboard/research'), icon: '📄' },
    { id: 'action-new-note', name: 'New Note', description: 'Create a new note', category: 'Actions', action: () => { navigate('/dashboard/notes'); }, shortcut: '⌘N' },
    { id: 'action-new-doc', name: 'New Writing Document', description: 'Start a new draft', category: 'Actions', action: () => { navigate('/dashboard/writing'); } },
    { id: 'settings-profile', name: 'View Profile', description: 'Your account details', category: 'Settings', action: () => { navigate('/dashboard/profile'); } },
  ];

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
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '15vh 24px 24px'
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'var(--bg-app)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            style={{
              width: '100%',
              background: 'var(--bg-light)',
              border: '1px solid var(--border)',
              padding: '12px 16px',
              fontSize: '16px',
              color: 'var(--text-main)',
              outline: 'none',
              borderRadius: '8px'
            }}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px' }}>
            ↑↓ to navigate • Enter to select • Esc to close
          </div>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No commands found.
            </div>
          ) : (
            results.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => { item.action(); onClose(); }}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: idx === selected ? 'var(--bg-hover)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {item.icon && <span style={{ fontSize: '20px' }}>{item.icon}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{item.description}</div>
                </div>
                {item.shortcut && (
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '2px 6px', background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                    {item.shortcut}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div style={{ padding: '12px 24px', background: 'var(--bg-light)', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
            {results.length} commands available
          </div>
        </div>
      </div>
    </div>
  );
}
