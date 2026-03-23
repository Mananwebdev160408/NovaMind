import React, { useState, useEffect } from 'react';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelCategory } from '@runanywhere/web';
import { generateText } from '../lib/ai-utils';
import { api } from '../lib/api';
import { Button, Input, TextArea, Toast, Card, Badge } from '../components/UI';

interface Meeting {
  _id: string;
  title: string;
  transcript: string;
  actionItems: Array<{ text: string; owner: string; completed: boolean }>;
  decisions: Array<{ text: string }>;
  summary?: string;
  duration: number;
}

export function MeetingTranscription() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const { state: modelState, ensure: ensureModel } = useModelLoader(ModelCategory.Language);

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadMeetings = async () => {
    try {
      const data = await api.get('/meetings');
      setMeetings(data);
    } catch (err) {
      console.error('Failed to load meetings:', err);
      setToast({ message: 'Failed to load meetings', type: 'error' });
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setTranscript('');
    setMeetingTitle(`Meeting ${new Date().toLocaleString()}`);
    setToast({ message: 'Recording started', type: 'info' });
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    
    if (!transcript.trim()) {
      setToast({ message: 'No transcript to save', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const meeting = {
        title: meetingTitle,
        transcript,
        duration: recordingTime,
        meetingType: 'general',
      };

      const newMeeting = await api.post('/meetings', meeting);
      setActiveMeeting(newMeeting);
      setToast({ message: 'Meeting saved successfully', type: 'success' });
      loadMeetings();
      
      // Auto-extract action items and decisions
      await handleExtractIntelligence(newMeeting._id);
    } catch (err) {
      console.error('Save failed:', err);
      setToast({ message: 'Failed to save meeting', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractIntelligence = async (meetingId?: string) => {
    const targetMeeting = meetingId ? meetings.find(m => m._id === meetingId) || activeMeeting : activeMeeting;
    if (!targetMeeting) return;

    setIsProcessing(true);
    try {
      await ensureModel();

      // Extract action items
      const actionPrompt = `Extract all action items from this meeting transcript. List each one clearly.

Transcript:
${targetMeeting.transcript}

Action Items:`;

      const actionResult = await generateText(actionPrompt, { maxTokens: 300, temperature: 0.5 });
      const actionItems = actionResult.text
        .split('\n')
        .filter(line => line.trim())
        .map(text => ({ text: text.replace(/^[-•*]\s*/, ''), owner: '', completed: false }));

      // Extract decisions
      const decisionPrompt = `Extract all key decisions made in this meeting. List each decision clearly.

Transcript:
${targetMeeting.transcript}

Decisions:`;

      const decisionResult = await generateText(decisionPrompt, { maxTokens: 200, temperature: 0.5 });
      const decisions = decisionResult.text
        .split('\n')
        .filter(line => line.trim())
        .map(text => ({ text: text.replace(/^[-•*]\s*/, '') }));

      // Generate summary
      const summaryPrompt = `Create a brief executive summary of this meeting in 2-3 sentences.

Transcript:
${targetMeeting.transcript}

Summary:`;

      const summaryResult = await generateText(summaryPrompt, { maxTokens: 150, temperature: 0.5 });

      await api.put(`/meetings/${targetMeeting._id}`, {
        actionItems,
        decisions,
        summary: summaryResult.text,
      });

      setToast({ message: 'Intelligence extracted successfully', type: 'success' });
      loadMeetings();
    } catch (err) {
      console.error('Intelligence extraction failed:', err);
      setToast({ message: 'Failed to extract intelligence', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 350px', height: 'calc(100vh - 72px)', background: 'var(--bg-midnight)' }}>
      {/* Left Sidebar */}
      <aside style={{ borderRight: '1px solid var(--border-ghost)', padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>MEETING_MODULE</span>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '8px' }}>Neural Audio</h3>
          <Badge variant={modelState === 'ready' ? 'success' : 'warning'} style={{ marginTop: '12px' }}>
            AI: {modelState.toUpperCase()}
          </Badge>
        </div>

        {!isRecording ? (
          <Button variant="primary" style={{ width: '100%', marginBottom: '24px' }} onClick={handleStartRecording}>
            🎙️ Start Recording
          </Button>
        ) : (
          <Button variant="danger" style={{ width: '100%', marginBottom: '24px' }} onClick={handleStopRecording}>
            ⏹️ Stop Recording
          </Button>
        )}

        {isRecording && (
          <Card style={{ marginBottom: '24px', background: 'var(--accent-glow)', border: '1px solid var(--accent-indigo)' }}>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)', marginBottom: '8px' }}>
              RECORDING_IN_PROGRESS
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-indigo)' }}>
              {formatTime(recordingTime)}
            </div>
          </Card>
        )}

        <div>
          <span className="mono" style={{ fontSize: '9px', opacity: 0.4, display: 'block', marginBottom: '12px' }}>
            {meetings.length} MEETINGS
          </span>
          {meetings.map(meeting => (
            <Card
              key={meeting._id}
              hoverable
              onClick={() => setActiveMeeting(meeting)}
              style={{
                padding: '16px',
                marginBottom: '8px',
                background: activeMeeting?._id === meeting._id ? 'var(--accent-glow)' : 'var(--bg-surface)',
                border: activeMeeting?._id === meeting._id ? '1px solid var(--accent-indigo)' : '1px solid var(--border-ghost)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>{meeting.title}</div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                {formatTime(meeting.duration || 0)}
              </div>
            </Card>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        {isRecording ? (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Input
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Meeting title..."
              style={{ fontSize: '24px', fontWeight: 600, border: 'none', background: 'transparent', padding: '0 0 16px 0', marginBottom: '24px' }}
            />

            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--accent-glow)', border: '1px solid var(--accent-indigo)', borderRadius: 'var(--radius-md)' }}>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)', marginBottom: '8px' }}>
                LIVE_TRANSCRIPTION
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Speak into your microphone. Your words will be transcribed in real-time.
              </div>
            </div>

            <TextArea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Transcript will appear here... (You can also type directly)"
              style={{ 
                minHeight: '500px', 
                fontSize: '16px', 
                lineHeight: '1.8',
                border: '1px solid var(--border-ghost)',
                background: 'var(--bg-deep)',
              }}
            />
          </div>
        ) : activeMeeting ? (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>{activeMeeting.title}</h2>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <Badge variant="info">Duration: {formatTime(activeMeeting.duration || 0)}</Badge>
              {activeMeeting.actionItems && (
                <Badge variant="warning">{activeMeeting.actionItems.length} Action Items</Badge>
              )}
              {activeMeeting.decisions && (
                <Badge variant="success">{activeMeeting.decisions.length} Decisions</Badge>
              )}
            </div>

            {activeMeeting.summary && (
              <Card style={{ marginBottom: '24px', background: 'var(--accent-glow)', border: '1px solid var(--accent-indigo)' }}>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)', marginBottom: '12px' }}>
                  EXECUTIVE_SUMMARY
                </div>
                <div style={{ fontSize: '15px', lineHeight: '1.7' }}>{activeMeeting.summary}</div>
              </Card>
            )}

            <div style={{ marginBottom: '24px' }}>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleExtractIntelligence()}
                loading={isProcessing}
              >
                Extract Intelligence
              </Button>
            </div>

            <div style={{ 
              background: 'var(--bg-deep)', 
              border: '1px solid var(--border-ghost)', 
              borderRadius: 'var(--radius-md)', 
              padding: '32px',
              fontSize: '15px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              marginBottom: '32px'
            }}>
              {activeMeeting.transcript}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '24px' }}>
            <div style={{ fontSize: '64px' }}>🎙️</div>
            <h3 style={{ fontSize: '24px', fontWeight: 600 }}>No Meeting Selected</h3>
            <p style={{ color: 'var(--text-muted)' }}>Start recording or select a past meeting</p>
          </div>
        )}
      </main>

      {/* Right Panel */}
      <aside style={{ borderLeft: '1px solid var(--border-ghost)', padding: '32px 24px', overflowY: 'auto' }}>
        {activeMeeting && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                ACTION_ITEMS
              </div>
              {activeMeeting.actionItems && activeMeeting.actionItems.length > 0 ? (
                activeMeeting.actionItems.map((item, idx) => (
                  <Card key={idx} style={{ marginBottom: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                      <input 
                        type="checkbox" 
                        checked={item.completed}
                        onChange={() => {
                          // Toggle completion
                          const updated = [...activeMeeting.actionItems];
                          updated[idx].completed = !updated[idx].completed;
                          api.patch(`/meetings/${activeMeeting._id}/action-items/${idx}`, { completed: updated[idx].completed });
                        }}
                        style={{ marginTop: '4px' }}
                      />
                      <div style={{ flex: 1, fontSize: '14px', lineHeight: '1.5' }}>
                        {item.text}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0' }}>
                  NO_ACTION_ITEMS
                </div>
              )}
            </div>

            <div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                KEY_DECISIONS
              </div>
              {activeMeeting.decisions && activeMeeting.decisions.length > 0 ? (
                activeMeeting.decisions.map((decision, idx) => (
                  <Card key={idx} style={{ marginBottom: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      {decision.text}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0' }}>
                  NO_DECISIONS_LOGGED
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
