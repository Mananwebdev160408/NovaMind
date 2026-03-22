/**
 * Module 6: Meeting Transcription & Intelligence
 */

import { useState, useEffect, useRef } from 'react';
import { generateText, ensureLLMLoaded, generateId } from '../lib/ai-utils';
import { create, getAll, STORES } from '../lib/storage';
import { ModelManager, ModelCategory } from '../runanywhere';
import type { Meeting, TranscriptSegment, ActionItem } from '../types';

export function MeetingTranscription() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    loadMeetings();
    ensureLLMLoaded().catch(console.error);
  }, []);

  async function loadMeetings() {
    const all = await getAll<Meeting>(STORES.MEETINGS);
    setMeetings(all.sort((a, b) => b.startTime - a.startTime));
  }

  async function startRecording() {
    const meeting: Meeting = {
      id: generateId(),
      title: `Meeting ${new Date().toLocaleString()}`,
      startTime: Date.now(),
      transcript: [],
      actionItems: [],
      decisions: [],
      status: 'recording',
    };
    await create(STORES.MEETINGS, meeting);
    setCurrentMeeting(meeting);
    setIsRecording(true);
    setTranscript('');
  }

  function stopRecording() {
    setIsRecording(false);
  }

  async function finalizeMeeting() {
    if (!currentMeeting) return;
    setIsProcessing(true);
    try {
      const result = await generateText(
        `Extract action items from this meeting transcript. List each as "- [Action item]":\n\n${transcript}`,
        { maxTokens: 300 }
      );
      const actionItems: ActionItem[] = result.text
        .split('\n')
        .filter((l) => l.trim().startsWith('-'))
        .map((l) => ({ id: generateId(), description: l.replace(/^-\s*/, ''), completed: false }));

      const updated: Meeting = {
        ...currentMeeting,
        endTime: Date.now(),
        transcript: [{ id: generateId(), speaker: 'User', text: transcript, timestamp: Date.now() }],
        actionItems,
        status: 'completed',
      };
      await create(STORES.MEETINGS, updated);
      loadMeetings();
      setCurrentMeeting(null);
      setTranscript('');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>🎙️ Meeting Transcription</h2>
        <p>Record and analyze meetings with AI-powered transcription</p>
      </div>

      <div className="module-content">
        {!currentMeeting ? (
          <div className="module-empty">
            <h3>No active meeting</h3>
            <button className="btn btn-primary" onClick={startRecording}>
              🎙️ Start Recording
            </button>
            <div style={{ marginTop: '24px', width: '100%' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Past Meetings</h3>
              {meetings.map((m) => (
                <div key={m.id} className="module-card" style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(m.startTime).toLocaleString()} • {m.actionItems.length} action items
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="module-card">
              <h3>Recording Meeting...</h3>
              <p style={{ color: 'var(--text-muted)' }}>Type or paste meeting notes below</p>
              <textarea
                className="editor"
                style={{ minHeight: '300px', marginTop: '12px' }}
                placeholder="Meeting notes..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                disabled={isProcessing}
              />
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" onClick={finalizeMeeting} disabled={isProcessing || !transcript}>
                  {isProcessing ? '⏳ Processing...' : '✅ Complete Meeting'}
                </button>
                <button className="btn" onClick={() => setCurrentMeeting(null)}>
                  ✖ Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
