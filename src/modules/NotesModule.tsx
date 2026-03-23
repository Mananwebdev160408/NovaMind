import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Note, NoteCategory } from '../types';

export function NotesModule() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const allNotes = await api.get('/notes');
      const mappedNotes = allNotes.map((n: any) => ({
        ...n,
        id: n._id
      }));
      setNotes(mappedNotes);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const filteredNotes = notes.filter((n: Note) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveNote = async () => {
    if (!activeNote) return;

    try {
      if (activeNote.id && notes.find(n => n.id === activeNote.id)) {
        await api.put(`/notes/${activeNote.id}`, activeNote);
      } else {
        await api.post('/notes', activeNote);
      }

      setIsEditing(false);
      loadNotes();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const createNewNote = () => {
    const newNote: Partial<Note> = {
      title: 'New Note',
      content: '',
      tags: [],
      category: 'personal',
      isPinned: false,
      isFavorite: false
    };
    setActiveNote(newNote as Note);
    setIsEditing(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notes/${id}`);
      if (activeNote?.id === id) setActiveNote(null);
      loadNotes();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 280px', height: '100%', background: 'var(--bg-app)' }}>
      {/* List Sidebar */}
      <aside style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>Notes</h3>
            <button onClick={createNewNote} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>+ New</button>
          </div>
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }}>
          {filteredNotes.map((note: Note) => (
            <div 
              key={note.id}
              onClick={() => { setActiveNote(note); setIsEditing(false); }}
              className="card card-interactive"
              style={{ 
                padding: '16px', 
                marginBottom: '8px',
                background: activeNote?.id === note.id ? 'var(--bg-hover)' : 'transparent',
                borderColor: activeNote?.id === note.id ? 'var(--accent)' : 'var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{note.title || 'Untitled'}</h4>
                <button 
                  onClick={(e) => handleDelete(note.id, e)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', opacity: 0.5, cursor: 'pointer', fontSize: '12px' }}
                >✕</button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {note.content || 'No content...'}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* Editor Area */}
      <main style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        {activeNote ? (
          <>
            <header style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <input 
                    value={activeNote.title}
                    onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                    style={{ background: 'none', border: 'none', fontSize: '24px', fontWeight: 600, padding: '0', width: '100%' }}
                  />
                ) : (
                  <h2 style={{ fontSize: '24px' }}>{activeNote.title}</h2>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
                    <button onClick={handleSaveNote} className="btn btn-primary">Save Changes</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">Edit Note</button>
                )}
              </div>
            </header>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              {isEditing ? (
                <textarea 
                  value={activeNote.content}
                  onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
                  placeholder="Start writing..."
                  style={{ width: '100%', height: '100%', background: 'none', border: 'none', fontSize: '16px', lineHeight: '1.7', resize: 'none' }}
                />
              ) : (
                <div style={{ fontSize: '16px', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                  {activeNote.content}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>Select a note to view or create a new one.</p>
            </div>
          </div>
        )}
      </main>

      {/* Info Sidebar */}
      <aside style={{ borderLeft: '1px solid var(--border)', padding: '24px', background: 'var(--bg-app)' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' }}>Details</h3>
        
        {activeNote && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Category</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(['personal', 'work', 'research', 'idea', 'task', 'other'] as NoteCategory[]).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => activeNote && setActiveNote({ ...activeNote, category: cat })}
                    style={{ 
                      padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border)',
                      background: activeNote.category === cat ? 'var(--accent-soft)' : 'transparent',
                      color: activeNote.category === cat ? 'var(--accent)' : 'var(--text-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '0 8px' }}>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Last Updated</div>
               <div style={{ fontSize: '13px' }}>{activeNote.updatedAt ? new Date(activeNote.updatedAt).toLocaleDateString() : 'New'}</div>
            </div>

            <div style={{ padding: '0 8px' }}>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Tags</div>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeNote.tags?.map(tag => (
                    <span key={tag} style={{ padding: '2px 8px', background: 'var(--bg-hover)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-dim)' }}>#{tag}</span>
                  ))}
                  <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '11px' }}>+ Add Tag</button>
               </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
