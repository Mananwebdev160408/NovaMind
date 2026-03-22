/**
 * Module 3: Language Learning Companion
 */

import { useState, useEffect } from 'react';
import { generateStreamingText, ensureLLMLoaded, generateId } from '../lib/ai-utils';
import { create, getAll, STORES } from '../lib/storage';
import type { LanguagePractice, ProficiencyLevel } from '../types';

export function LanguageLearning() {
  const [language, setLanguage] = useState('Spanish');
  const [level, setLevel] = useState<ProficiencyLevel>('beginner');
  const [mode, setMode] = useState<'conversation' | 'grammar' | 'vocabulary'>('conversation');
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    ensureLLMLoaded().catch(console.error);
  }, []);

  async function sendMessage() {
    if (!userInput.trim()) return;
    setConversation([...conversation, { role: 'user', text: userInput }]);
    setIsProcessing(true);

    try {
      const systemPrompt = `You are a ${language} language teacher. User level: ${level}. Mode: ${mode}. Be encouraging and provide corrections when needed.`;
      let aiResponse = '';
      await generateStreamingText(
        userInput,
        { maxTokens: 300, temperature: 0.7, systemPrompt },
        (token) => {
          aiResponse += token;
        }
      );

      setConversation((prev) => [...prev, { role: 'ai', text: aiResponse }]);
      setUserInput('');

      const practice: LanguagePractice = {
        id: generateId(),
        language,
        type: mode,
        content: userInput,
        aiResponse,
        timestamp: Date.now(),
      };
      await create(STORES.LANGUAGE, practice);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>🌍 Language Learning</h2>
        <p>AI-powered language practice with pronunciation and grammar</p>
      </div>

      <div className="module-toolbar">
        <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Italian">Italian</option>
          <option value="Japanese">Japanese</option>
          <option value="Chinese">Chinese</option>
        </select>
        <select className="select" value={level} onChange={(e) => setLevel(e.target.value as ProficiencyLevel)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select className="select" value={mode} onChange={(e) => setMode(e.target.value as any)}>
          <option value="conversation">Conversation</option>
          <option value="grammar">Grammar</option>
          <option value="vocabulary">Vocabulary</option>
        </select>
      </div>

      <div className="module-content">
        <div className="message-list" style={{ flex: 1, maxHeight: '400px' }}>
          {conversation.map((msg, i) => (
            <div key={i} className={`message message-${msg.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder={`Type in ${language}...`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isProcessing}
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={isProcessing || !userInput}>
            {isProcessing ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}
