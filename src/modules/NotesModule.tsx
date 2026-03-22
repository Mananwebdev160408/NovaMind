import { useState, useEffect } from 'react';
import { ensureLLMLoaded, extractKeywords, generateId, truncateText } from '../lib/ai-utils';
import { create, update, getAll, searchNotes, STORES } from '../lib/storage';
import type { Note, NoteCategory } from '../types';

export function NotesModule() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'all'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNeuralInsights, setShowNeuralInsights] = useState(true);

  useEffect(() => {
    loadNotes();
    ensureLLMLoaded().catch(console.error);
  }, []);

  useEffect(() => {
    filterNotesLocal();
  }, [notes, searchQuery, filterCategory]);

  async function loadNotes() {
    const allNotes = await getAll<Note>(STORES.NOTES);
    setNotes(allNotes.sort((a, b) => b.updatedAt - a.updatedAt));
  }

  async function filterNotesLocal() {
    let filtered = notes;
    if (searchQuery) {
      filtered = await searchNotes(searchQuery);
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter((n) => n.category === filterCategory);
    }
    setFilteredNotes(filtered);
  }

  function handleNewNote() {
    setCurrentNote(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  }

  function selectNote(note: Note) {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setIsProcessing(true);
    try {
      const tags = extractKeywords(content, 5);
      const note: Note = currentNote ? { ...currentNote, title, content, tags, updatedAt: Date.now() } : {
        id: generateId(),
        title,
        content,
        tags,
        category: 'other',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        linkedNotes: [],
        isPinned: false,
        isFavorite: false
      };
      currentNote ? await update(STORES.NOTES, note) : await create(STORES.NOTES, note);
      setIsEditing(false);
      setCurrentNote(note);
      loadNotes();
    } finally {
      setIsProcessing(false);
    }
  }

  const formatTime = (ms: number) => {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}M AGO`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}H AGO`;
    return new Date(ms).toLocaleDateString();
  };

  return (
    <div className="notes-v2-container">
      {/* Left Sidebar */}
      <aside className="writing-nav-sidebar" style={{ position: 'relative', height: '100%', width: '260px', minWidth: '260px' }}>
        <div className="spectral-branding">
          <div className="spectral-logo">🧠</div>
          <div className="spectral-info">
            <h3>SPECTRAL ENGINE</h3>
            <span className="ai-status-badge"><span style={{ color: '#ff5500' }}>●</span> AI Processing Active</span>
          </div>
        </div>

        <button className="btn-new-draft" onClick={handleNewNote} style={{ marginTop: '24px' }}>
          + New Neural Note
        </button>

        <nav className="writing-nav-items">
          <div className="nav-item-v2 active">
            <span>📒</span> Notes
          </div>
          <div className="nav-item-v2">
            <span>📁</span> Archives
          </div>
          <div className="nav-item-v2">
            <span>🗑️</span> Trash
          </div>
        </nav>

        <div className="writing-nav-footer">
          <a href="#" className="nav-footer-link" onClick={(e) => e.preventDefault()}>
            <span className="nav-footer-icon">⏳</span> Sync Status
          </a>
          <a href="#" className="nav-footer-link" onClick={(e) => e.preventDefault()}>
            <span className="nav-footer-icon">❓</span> Help Center
          </a>
        </div>
      </aside>

      {/* Middle Library Pane */}
      <section className="notes-library-pane">
        <div className="library-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2>Library</h2>
            <span className="node-count-badge">{notes.length} NODES</span>
          </div>
          <button className="btn btn-sm btn-primary" onClick={handleNewNote}>+ New Note</button>
        </div>

        <div className="library-search">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Filter by intelligence..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="note-list-v2">
          {filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className={`note-card-v2 ${currentNote?.id === note.id ? 'active' : ''}`}
              onClick={() => selectNote(note)}
            >
              <div className="note-card-header">
                <h4>{note.title || 'Untitled Note'}</h4>
                <span className="note-card-time">{formatTime(note.updatedAt)}</span>
              </div>
              <div className="note-card-snippet">
                {note.content || 'No content yet...'}
              </div>
              <div className="note-card-tags">
                {(note.tags || []).slice(0, 2).map((tag, i) => (
                  <span key={i} className="note-tag-v2">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Right Editor Pane */}
      <main className="notes-editor-pane">
        <div className="notes-editor-toolbar">
          <div className="toolbar-group">
            <button className="toolbar-btn"><b>B</b></button>
            <button className="toolbar-btn"><i>I</i></button>
            <button className="toolbar-btn"><u>U</u></button>
            <button className="toolbar-btn">≡</button>
          </div>
          <div className="toolbar-group">
            <button className="toolbar-btn">🔗</button>
            <button className="toolbar-btn">🖼️</button>
          </div>
        </div>

        <div className="notes-editor-top">
          <button className="btn btn-sm btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
          <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? 'Saving...' : 'Save Note'}
          </button>
        </div>

        {isEditing || currentNote ? (
          <>
            <input 
              className="notes-title-input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
            />

            <div className="notes-meta-row">
              <div className="notes-meta-item">
                <span style={{ marginRight: '8px' }}>📅</span> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="notes-meta-item ai-status-badge">
                <span style={{ marginRight: '8px' }}>⚡</span> AI ANALYSIS READY
              </div>
            </div>

            <textarea 
              className="notes-body-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start drafting your next big idea here..."
            />
          </>
        ) : (
          <div className="module-empty" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3>Select a note or create a new one</h3>
          </div>
        )}

        {/* Neural Insights Floating Card */}
        {showNeuralInsights && (isEditing || currentNote) && (
          <div className="neural-insights-v2">
            <div className="neural-header">
              <div className="neural-icon">🧠</div>
              <div>
                <h4>Neural Insights</h4>
                <span>ANALYZING CONTEXT...</span>
              </div>
            </div>
            <div className="neural-content">
              I've found <b>3 related notes</b> regarding your current drafting context. Would you like to link them?
            </div>
            <a href="#" className="link-references" onClick={(e) => e.preventDefault()}>LINK REFERENCES</a>
            <div className="suggested-tags-row">
              <span>Suggested Tags</span>
              <div className="tag-suggestion-group">
                <div className="tag-suggestion">+ Architecture</div>
                <div className="tag-suggestion">+ WebGPU</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
