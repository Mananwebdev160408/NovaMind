import { useState, useEffect } from 'react';
import { generateText, ensureLLMLoaded, generateId } from '../lib/ai-utils';
import { create, update, getAll, STORES } from '../lib/storage';
import type { Meeting, ActionItem } from '../types';

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
      await update(STORES.MEETINGS, updated);
      loadMeetings();
      setCurrentMeeting(null);
      setTranscript('');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="meetings-v2-container">
      {/* Pane 1: Global Nav Sidebar */}
      <aside className="writing-nav-sidebar" style={{ position: 'relative', height: '100%', width: '260px', minWidth: '260px' }}>
        <div className="spectral-branding">
          <div className="spectral-logo">🧠</div>
          <div className="spectral-info">
            <h3 style={{ fontSize: '12px', fontWeight: 800 }}>NEURAL ENGINE ACTIVE</h3>
            <span className="ai-status-badge">CORE V2.4 TRANSCRIPTION</span>
          </div>
        </div>

        <nav className="writing-nav-items" style={{ marginTop: '40px' }}>
          <div className="nav-item-v2">
            <span>✍️</span> WRITER
          </div>
          <div className="nav-item-v2">
            <span>📒</span> NOTES
          </div>
          <div className="nav-item-v2 active">
            <span>👥</span> MEETINGS
          </div>
          <div className="nav-item-v2">
            <span>💻</span> CODE DOCS
          </div>
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px' }}>
             <button className="btn btn-primary" style={{ width: '100%', borderRadius: '8px', padding: '12px' }}>NEW PROJECT</button>
        </div>

        <div className="writing-nav-footer">
          <a href="#" className="nav-footer-link">
            <span className="nav-footer-icon">❓</span> Help
          </a>
          <a href="#" className="nav-footer-link">
            <span className="nav-footer-icon">📁</span> Archive
          </a>
        </div>
      </aside>

      {/* Pane 2: Main Transcript Pane */}
      <main className="meetings-main-pane">
        <div className="meetings-header-row">
          <div className="meetings-title">
            <h1>Neural Sessions</h1>
            <p>Active transcription with real-time speaker diarization and semantic analysis powered by NovaMind Core.</p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '14px 28px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
            onClick={isRecording ? finalizeMeeting : startRecording}
            disabled={isProcessing}
          >
            <span className="live-dot" style={{ background: isRecording ? '#ff5500' : '#64748b' }}></span>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        <div className="live-session-card">
          <div className="live-session-header">
            <div className="live-status">
              <span className="live-dot"></span>
              LIVE SESSION: {currentMeeting?.title || 'WEEKLY SYNC'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="speaker-avatars">
                <div className="avatar-mini" style={{ background: '#3b82f6' }}>JS</div>
                <div className="avatar-mini" style={{ background: '#10b981' }}>LR</div>
                <div className="avatar-mini" style={{ background: '#f59e0b' }}>MK</div>
                <div className="avatar-mini">+2</div>
              </div>
              <div className="session-timer">00:14:32</div>
            </div>
          </div>

          <div className="transcript-area">
            {/* Mock Speaker A */}
            <div className="transcript-block">
              <div className="speaker-label">SPEAKER <span>A</span></div>
              <div className="transcript-content">
                <div className="transcript-text">
                  Welcome everyone to the NovaMind core engine update. Today we're looking at the <span className="transcript-highlight">WebGPU acceleration</span> for the transcription layer. We've seen a 40% reduction in latency since the last sprint.
                </div>
                <div className="transcript-timestamp">10:04 AM</div>
              </div>
            </div>

            {/* Mock Speaker B */}
            <div className="transcript-block">
              <div className="speaker-label" style={{ color: '#ffaa80' }}>SPEAKER <span>B</span></div>
              <div className="transcript-content">
                <div className="transcript-text" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                  That's impressive. Are we maintaining the 99.8% accuracy threshold with the new neural pruning?
                </div>
                <div className="transcript-timestamp">10:05 AM</div>
              </div>
            </div>

            {/* Mock Speaker A Response */}
            <div className="transcript-block">
              <div className="speaker-label">SPEAKER <span>A</span></div>
              <div className="transcript-content">
                <div className="transcript-text">
                  Yes, the testing data suggests we actually improved precision in high-noise environments. Let's look at the spectral analysis...
                </div>
                <div style={{ color: '#ffaa80', fontSize: '20px', letterSpacing: '2px', marginTop: '10px' }}>
                  |||..|||
                </div>
              </div>
            </div>
          </div>

          <div className="live-controls-bar">
            <button className="mic-toggle">🎙️</button>
            <div className="listening-indicator">
              {isRecording ? 'AI Assistant is listening for commands...' : 'Microphone standby...'}
            </div>
            <button className="btn btn-sm" style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 20px' }}>ADD NOTE</button>
          </div>
        </div>
      </main>

      {/* Pane 3: Intel Pane */}
      <aside className="meetings-intel-pane">
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Recent Sessions</h3>
            <span style={{ cursor: 'pointer', opacity: 0.6 }}>🔄</span>
          </div>
          <div className="recent-sessions-list">
            <div className="session-item-v2">
              <div className="session-tag-v2">PROJECT ORION</div>
              <h4>Architectural Review</h4>
              <div className="session-meta-v2">
                <span>⏱ 54M</span>
                <span style={{ color: '#10b981' }}>✨ ANALYSIS COMPLETE</span>
              </div>
            </div>
            <div className="session-item-v2">
              <div className="session-tag-v2" style={{ color: '#3b82f6' }}>PRODUCT</div>
              <h4>User Interview #12</h4>
              <div className="session-meta-v2">
                <span>⏱ 22M</span>
                <span>🕒 PROCESSING</span>
              </div>
            </div>
            <div className="session-item-v2">
              <div className="session-tag-v2" style={{ color: '#f59e0b' }}>SALES</div>
              <h4>Client Onboarding</h4>
              <div className="session-meta-v2">
                <span>⏱ 1H 12M</span>
                <span style={{ color: '#10b981' }}>✨ ANALYSIS COMPLETE</span>
              </div>
            </div>
          </div>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '24px', fontSize: '11px', letterSpacing: '0.1em' }}>VIEW ALL ARCHIVES</button>
        </section>

        <section className="ai-summary-card-v2">
          <div className="summary-header-v2">
            <span>✨</span> AI Summary
          </div>
          <ul className="summary-list-v2">
            <li>Key decision: Migrating neural layers to <strong>Metal/Vulkan</strong> backend.</li>
            <li>Next Action: Update benchmarking suite for the new 40% latency reduction claims.</li>
          </ul>
          <div className="sentiment-section">
            <div className="sentiment-label-v2">
              <span>SENTIMENT SCORE</span>
              <span style={{ color: '#10b981' }}>88% Positive</span>
            </div>
            <div className="sentiment-bar-v2">
              <div className="sentiment-fill-v2" style={{ width: '88%' }}></div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
