import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Segment, Input, Button, Header } from 'semantic-ui-react';
import { topicLabels } from '../../data/topicMap';
import './Chat.css';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hi! Ask me anything about leave, benefits, or company policy.',
};

const TOPIC_PROMPTS = {
  company_culture:     "What are Solarvest's core values and how do they shape the workplace?",
  probation:           'What are the key rules and expectations during the probation period?',
  working_hours:       'What are the official working hours and flexible work arrangements at Solarvest?',
  annual_leave:        'How do I apply for annual leave and what is the entitlement?',
  medical_leave:       'What is the medical leave entitlement and what documents do I need to submit?',
  maternity_leave:     'How many days of maternity leave am I entitled to and how do I apply?',
  paternity_leave:     'What is the paternity leave policy and how do I apply for it?',
  overtime:            'Who approves overtime and what is the eligibility criteria?',
  outpatient_benefits: 'What outpatient medical benefits am I entitled to and how do I claim them?',
  claims_expenses:     'How do I submit expense claims and what are the reimbursable items?',
  compassionate_leave: 'What is the compassionate leave entitlement and when does it apply?',
  hr_systems:          'Where can I find HR forms and how do I use the HR systems?',
  payroll:             'When is salary paid and how do I handle payroll-related queries?',
  benefits_insurance:  'What insurance and benefits am I entitled to as a Solarvest employee?',
};
const GENERIC_PROMPT = 'Can you summarise the key HR policies I should know about?';
const GENERIC_LABEL  = 'Review HR Policies';

const Chat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState(location.state?.prefill || '');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const state = location.state || {};
  const isQuizEntry = state.entrypoint === 'quiz_result';
  let cardTopics = [];
  if (isQuizEntry) {
    if (Array.isArray(state.weakTopics) && state.weakTopics.length > 0) {
      cardTopics = state.weakTopics.slice(0, 4);
    } else if (state.topic) {
      cardTopics = [state.topic];
    }
  }
  const showCards = isQuizEntry && messages.length === 1;

  useEffect(() => {
    document.title = 'Solarvest HR Chat';
    const entrypoint = location.state?.entrypoint || 'direct';
    sessionStorage.setItem('chat_entrypoint', entrypoint);
    window.dispatchEvent(new CustomEvent('telemetry', {
      detail: { event: 'chat_session_start', entrypoint },
    }));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    let assistantContent = '';
    let newSources = [];
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, session_id: null, access_level: 'all' }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      assistantContent = data.answer || '(No answer returned)';
      newSources = data.sources || [];
    } catch (err) {
      assistantContent = 'Sorry, I could not reach the HR Helpdesk service. Please try again.';
    }
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: assistantContent, sources: newSources },
    ]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCardClick = (prompt) => {
    if (loading) return;
    setInput(prompt);
    sendMessage(prompt);
  };

  return (
    <Container className="quiz-container page-container">
      <Segment
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(34, 36, 38, 0.1)',
        }}
      >
        <Header as="h2" style={{ color: '#1A1A1A', marginBottom: '0.25em' }}>
          HR Helpdesk
        </Header>
        <p style={{ color: '#2C2C2C', marginTop: 0, marginBottom: '1em', fontSize: '0.9em' }}>
          Ask me anything about HR policies, leave, or benefits.
        </p>

        {/* Message scroll area */}
        <div className="chat-scroll-area">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-wrap ${msg.role}`}>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.content}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="chat-sources">
                    <strong>Sources:</strong>
                    {msg.sources.map((src, si) => (
                      <div key={si} className="chat-source-item">
                        <span className="chat-source-filename">{src.filename}</span>
                        <span className="chat-source-snippet">{src.snippet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-wrap assistant">
              <div className="chat-bubble assistant">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestion cards — shown only on quiz_result entry before first message */}
        {showCards && (
          <div className="suggestion-cards">
            {cardTopics.length > 0
              ? cardTopics.map((key) => (
                  <button
                    key={key}
                    className="suggestion-card"
                    onClick={() => handleCardClick(TOPIC_PROMPTS[key] || GENERIC_PROMPT)}
                  >
                    <span className="suggestion-card-label">{topicLabels[key]}</span>
                    <span className="suggestion-card-prompt">{TOPIC_PROMPTS[key] || GENERIC_PROMPT}</span>
                  </button>
                ))
              : (
                  <button
                    className="suggestion-card"
                    onClick={() => handleCardClick(GENERIC_PROMPT)}
                  >
                    <span className="suggestion-card-label">{GENERIC_LABEL}</span>
                    <span className="suggestion-card-prompt">{GENERIC_PROMPT}</span>
                  </button>
                )
            }
          </div>
        )}

        {/* Input bar */}
        <div className="chat-input-bar">
          <Input
            fluid
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button
            className="purple-button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            icon="send"
            content="Send"
            labelPosition="right"
          />
        </div>
      </Segment>
    </Container>
  );
};

export default Chat;
