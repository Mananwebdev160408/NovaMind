/**
 * Module 2: Intelligent Note-Taking System
 */

import { useState, useEffect } from 'react';
import { generateText, ensureLLMLoaded, extractKeywords, generateId, calculateTextSimilarity, truncateText } from '../lib/ai-utils';
import { create, update, deleteItem, getAll, searchNotes, STORES } from '../lib/storage';
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

  function newNote() {
    setCurrentNote(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  }

  function editNote(note: Note) {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  }

  async function saveNote() {
    if (!title.trim() || !content.trim()) return;
    setIsProcessing(true);
    try {
      const tags = extractKeywords(content, 5);
      const note: Note = currentNote ? { ...currentNote, title, content, tags, updatedAt: Date.now() } : {
        id: generateId(), title, content, tags, category: 'other', createdAt: Date.now(),
        updatedAt: Date.now(), linkedNotes: [], isPinned: false, isFavorite: false
      };
      currentNote ? await update(STORES.NOTES, note) : await create(STORES.NOTES, note);
      setIsEditing(false);
      setCurrentNote(note);
      loadNotes();
    } finally {
      setIsProcessing(false);
    }
  }

  async function summarizeNote(note: Note) {
    setIsProcessing(true);
    try {
      const result = await generateText(`Summarize in 3 bullet points:\n\n${note.content}`, { maxTokens: 200 });
      await update(STORES.NOTES, { ...note, summary: result.text });
      loadNotes();
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>📓 Intelligent Notes</h2>
        <p>AI-powered note-taking with auto-tagging and search</p>
      </div>
      <div className="module-toolbar">
        <input className="input" type="text" placeholder="🔍 Search..." value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, maxWidth: '300px' }} />
        <button className="btn btn-primary" onClick={newNote}>➕ New Note</button>
      </div>
      <div className="module-content" style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          {filteredNotes.map((note) => (
            <div key={note.id} className="module-card" style={{ cursor: 'pointer', marginBottom: '8px' }} 
              onClick={() => editNote(note)}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{note.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{truncateText(note.content, 60)}</div>
            </div>
          ))}
        </div>
        <div style={{ flex: 2 }}>
          {isEditing ? (
            <>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} 
                placeholder="Title..." />
              <textarea className="editor" style={{ minHeight: '300px', marginTop: '12px' }} 
                value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content..." />
              <div style={{ marginTop: '12px' }}>
                <button className="btn btn-primary" onClick={saveNote}>💾 Save</button>
                <button className="btn" style={{ marginLeft: '8px' }} onClick={() => setIsEditing(false)}>✖ Cancel</button>
              </div>
            </>
          ) : currentNote ? (
            <>
              <div className="module-card">
                <h2>{currentNote.title}</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{currentNote.content}</p>
                <button className="btn" onClick={() => editNote(currentNote)}>✏️ Edit</button>
                <button className="btn" style={{ marginLeft: '8px' }} onClick={() => summarizeNote(currentNote)}>
                  📝 Summarize
                </button>
              </div>
            </>
          ) : (
            <div className="module-empty"><h3>Select a note or create a new one</h3></div>
          )}
        </div>
      </div>
    </div>
  );
}
