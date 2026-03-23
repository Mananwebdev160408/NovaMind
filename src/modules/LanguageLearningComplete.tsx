import React, { useState, useEffect } from 'react';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelCategory } from '@runanywhere/web';
import { generateText } from '../lib/ai-utils';
import { api } from '../lib/api';
import { Button, Input, Select, Toast, Card, Badge } from '../components/UI';

const LANGUAGES = [
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'mandarin', label: 'Mandarin' },
];

const DIFFICULTY = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function LanguageLearning() {
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  const [difficulty, setDifficulty] = useState('beginner');
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  const { state: modelState, ensure: ensureModel } = useModelLoader(ModelCategory.Language);

  useEffect(() => {
    loadProgress();
  }, [selectedLanguage]);

  const loadProgress = async () => {
    try {
      const data = await api.get(`/language/${selectedLanguage}`);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const handleStartConversation = async () => {
    setConversation([]);
    setIsGenerating(true);

    try {
      await ensureModel();

      const prompt = `You are a ${difficulty} level ${selectedLanguage} tutor. Start a friendly conversation in ${selectedLanguage}. Keep it simple and appropriate for ${difficulty} learners.`;

      const result = await generateText(prompt, { maxTokens: 100, temperature: 0.8 });
      
      setConversation([{ role: 'ai', content: result.text }]);
      setToast({ message: 'Conversation started!', type: 'success' });
    } catch (err) {
      console.error('Conversation start failed:', err);
      setToast({ message: 'Failed to start conversation', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { role: 'user', content: userInput };
    setConversation(prev => [...prev, newMessage]);
    setUserInput('');
    setIsGenerating(true);

    try {
      await ensureModel();

      const conversationContext = conversation.map(m => `${m.role}: ${m.content}`).join('\n');
      const prompt = `You are a ${difficulty} level ${selectedLanguage} tutor. Continue this conversation naturally in ${selectedLanguage}.

${conversationContext}
user: ${userInput}
ai:`;

      const result = await generateText(prompt, { maxTokens: 150, temperature: 0.8 });
      
      setConversation(prev => [...prev, { role: 'ai', content: result.text }]);

      // Save conversation session
      await api.post(`/language/${selectedLanguage}/conversation`, {
        difficulty,
        messages: [...conversation, newMessage, { role: 'ai', content: result.text }],
        duration: 5,
      });

      // Update practice streak
      await api.post(`/language/${selectedLanguage}/practice`, {});
      loadProgress();
    } catch (err) {
      console.error('Send message failed:', err);
      setToast({ message: 'Failed to send message', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckGrammar = async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    try {
      await ensureModel();

      const prompt = `Check this ${selectedLanguage} sentence for grammar errors and provide corrections with explanations in English.

Sentence: "${userInput}"

Analysis:`;

      const result = await generateText(prompt, { maxTokens: 200, temperature: 0.5 });
      
      setToast({ message: 'Grammar check complete', type: 'info' });
      setConversation(prev => [...prev, 
        { role: 'user', content: userInput },
        { role: 'grammar', content: result.text }
      ]);

      // Save grammar correction
      await api.post(`/language/${selectedLanguage}/grammar`, {
        original: userInput,
        corrected: result.text.split('\n')[0],
        explanation: result.text,
      });

      setUserInput('');
    } catch (err) {
      console.error('Grammar check failed:', err);
      setToast({ message: 'Failed to check grammar', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 320px', height: 'calc(100vh - 72px)', background: 'var(--bg-midnight)' }}>
      {/* Left Sidebar */}
      <aside style={{ borderRight: '1px solid var(--border-ghost)', padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-indigo)' }}>LANGUAGE_MODULE</span>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '8px' }}>Language Arena</h3>
          <Badge variant={modelState === 'ready' ? 'success' : 'warning'} style={{ marginTop: '12px' }}>
            AI: {modelState.toUpperCase()}
          </Badge>
        </div>

        <Select
          label="LANGUAGE"
          options={LANGUAGES}
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{ marginBottom: '16px' }}
        />

        <Select
          label="DIFFICULTY"
          options={DIFFICULTY}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ marginBottom: '24px' }}
        />

        <Button 
          variant="primary" 
          style={{ width: '100%', marginBottom: '24px' }}
          onClick={handleStartConversation}
          loading={isGenerating}
        >
          Start Conversation
        </Button>

        {stats && (
          <div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              YOUR_PROGRESS
            </div>
            
            <Card style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                {stats.currentStreak || 0}
              </div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                DAY_STREAK
              </div>
            </Card>

            <Card style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e' }}>
                {stats.vocabularySize || 0}
              </div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                VOCABULARY_WORDS
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#fb923c' }}>
                {stats.conversationsCompleted || 0}
              </div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                CONVERSATIONS
              </div>
            </Card>
          </div>
        )}
      </aside>

      {/* Main Conversation */}
      <main style={{ display: 'flex', flexDirection: 'column', padding: '32px', overflowY: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
          {conversation.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '24px' }}>
              <div style={{ fontSize: '64px' }}>🌍</div>
              <h3 style={{ fontSize: '24px', fontWeight: 600 }}>Ready to Practice?</h3>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
                Start a conversation with your AI language partner. Practice speaking, get grammar feedback, and improve your skills!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px', margin: '0 auto' }}>
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                  }}
                >
                  <Card style={{
                    padding: '16px',
                    background: msg.role === 'user' ? 'var(--accent-indigo)' : msg.role === 'grammar' ? 'rgba(251, 146, 60, 0.1)' : 'var(--bg-surface)',
                    border: msg.role === 'user' ? '1px solid var(--accent-indigo)' : msg.role === 'grammar' ? '1px solid #fb923c' : '1px solid var(--border-ghost)',
                  }}>
                    <div className="mono" style={{ fontSize: '9px', marginBottom: '8px', color: msg.role === 'user' ? 'white' : 'var(--text-dim)' }}>
                      {msg.role === 'user' ? 'YOU' : msg.role === 'grammar' ? 'GRAMMAR_CHECK' : 'AI_TUTOR'}
                    </div>
                    <div style={{ fontSize: '15px', lineHeight: '1.6', color: msg.role === 'user' ? 'white' : 'var(--text-primary)' }}>
                      {msg.content}
                    </div>
                  </Card>
                </div>
              ))}
              {isGenerating && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
                  <Card style={{ padding: '16px' }}>
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                      AI_TUTOR_TYPING...
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message in the target language..."
            style={{ flex: 1 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isGenerating) {
                handleSendMessage();
              }
            }}
            disabled={isGenerating}
          />
          <Button 
            variant="primary" 
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isGenerating}
            loading={isGenerating}
          >
            Send
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleCheckGrammar}
            disabled={!userInput.trim() || isGenerating}
          >
            Check Grammar
          </Button>
        </div>
      </main>

      {/* Right Panel - Tips */}
      <aside style={{ borderLeft: '1px solid var(--border-ghost)', padding: '32px 24px', overflowY: 'auto' }}>
        <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '16px' }}>
          LEARNING_TIPS
        </div>

        <Card style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Practice Daily</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Maintain your streak by practicing every day for best results
          </div>
        </Card>

        <Card style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Grammar Check</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Use the grammar check feature to learn from your mistakes
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Stay Consistent</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Regular practice is more effective than long occasional sessions
          </div>
        </Card>
      </aside>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
