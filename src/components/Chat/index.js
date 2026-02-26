import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Segment, Button, Header } from 'semantic-ui-react';
import { topicLabels } from '../../data/topicMap';
import './Chat.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

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
  const [ratedMessages, setRatedMessages] = useState(new Set());
  const [expandedSources, setExpandedSources] = useState({});
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollRef = useRef(null);

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

  // Snap textarea to correct height on mount (eliminates browser default row padding)
  useEffect(() => {
    autoResize();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  };

  // Scroll indicator
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setShowScrollBtn(!atBottom);
  };

  const sendMessage = async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    // Reset textarea height after clear
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    let assistantMsg = { role: 'assistant' };
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, session_id: null, access_level: 'all' }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      assistantMsg.summary = data.summary || data.answer || '(No answer returned)';
      assistantMsg.details = data.details || '';
      assistantMsg.followups = data.followups || [];
      assistantMsg.sources = data.sources || [];
      assistantMsg.meta = data.meta || {};
      assistantMsg.content = assistantMsg.summary; // backward compat for feedback
    } catch (err) {
      assistantMsg.content = 'Sorry, I could not reach the HR Helpdesk service. Please try again.';
      assistantMsg.summary = '';
      assistantMsg.failedQuery = text;
    }
    setMessages(prev => [...prev, assistantMsg]);
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

  const handleFeedback = async (msgIndex, rating) => {
    setRatedMessages((prev) => new Set(prev).add(msgIndex));
    // Auto-hide "Thanks" after 3 seconds
    setTimeout(() => {
      setRatedMessages((prev) => {
        const s = new Set(prev);
        s.delete(msgIndex);
        return s;
      });
    }, 3000);
    const userMsg = messages[msgIndex - 1];
    const assistantMsg = messages[msgIndex];
    try {
      await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'anonymous',
          message_idx: msgIndex,
          rating,
          query: userMsg?.content || '',
          answer: assistantMsg?.content || '',
        }),
      });
    } catch {
      // Feedback is best-effort — don't disrupt the chat
    }
  };

  return (
    <Container className="quiz-container page-container">
      <Segment
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(34, 36, 38, 0.1)',
          position: 'relative',
        }}
      >
        <Header as="h2" style={{ color: '#1A1A1A', marginBottom: '0.25em' }}>
          HR Helpdesk
        </Header>
        <p style={{ color: '#2C2C2C', marginTop: 0, marginBottom: '1em', fontSize: '0.9em' }}>
          Ask me anything about HR policies, leave, or benefits.
        </p>

        {/* Message scroll area */}
        <div
          className="chat-scroll-area"
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          aria-busy={loading}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-wrap ${msg.role}`}>
              <div className={`chat-bubble ${msg.role}`}>
                {/* Structured rendering for assistant messages */}
                {msg.summary ? (
                  <>
                    <div className="chat-summary">
                      {msg.summary}
                      {msg.meta?.confidence && (
                        <span className={`confidence-badge confidence-${msg.meta.confidence}`}>
                          {msg.meta.confidence}
                        </span>
                      )}
                    </div>

                    {msg.details && msg.details !== msg.summary && (
                      <details className="chat-details">
                        <summary className="chat-details-toggle">Show full answer</summary>
                        <div className="chat-details-body">
                          {msg.details.split('\n').filter(Boolean).map((para, pi) => (
                            <p key={pi}>{para}</p>
                          ))}
                        </div>
                      </details>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="chat-sources-panel">
                        <div className="chat-sources-label">Sources ({msg.sources.length})</div>
                        {msg.sources.slice(0, expandedSources[i] ? undefined : 2).map((src, si) => (
                          <div key={si} className="chat-source-card">
                            <span className="chat-source-filename">{src.filename}</span>
                            {src.page_number && <span className="chat-source-page">p.{src.page_number}</span>}
                            <span className="chat-source-snippet">{src.snippet}</span>
                          </div>
                        ))}
                        {msg.sources.length > 2 && !expandedSources[i] && (
                          <button
                            className="chat-sources-more"
                            onClick={() => setExpandedSources(prev => ({ ...prev, [i]: true }))}
                          >
                            Show {msg.sources.length - 2} more
                          </button>
                        )}
                      </div>
                    )}

                    {msg.followups && msg.followups.length > 0 && (
                      <div className="chat-followup-chips">
                        {msg.followups.map((fq, fi) => (
                          <button key={fi} className="followup-chip" onClick={() => handleCardClick(fq)}>
                            {fq}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {msg.content}
                    {/* Retry button for failed requests */}
                    {msg.failedQuery && (
                      <div style={{ marginTop: '0.5em' }}>
                        <button className="followup-chip" onClick={() => sendMessage(msg.failedQuery)}>
                          Retry
                        </button>
                      </div>
                    )}
                  </>
                )}

                {msg.role === 'assistant' && i > 0 && (
                  <div className="chat-feedback">
                    {ratedMessages.has(i) ? (
                      <span className="chat-feedback-thanks">Thanks for your feedback!</span>
                    ) : (
                      <>
                        <button
                          className="feedback-btn up"
                          onClick={() => handleFeedback(i, 'up')}
                          aria-label="This response was helpful"
                        >
                          &#128077; Helpful
                        </button>
                        <button
                          className="feedback-btn down"
                          onClick={() => handleFeedback(i, 'down')}
                          aria-label="This response was not helpful"
                        >
                          &#128078; Not helpful
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-wrap assistant">
              <div className="chat-bubble assistant">
                <div className="typing-indicator" role="status">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Scroll-to-bottom floating button */}
        {showScrollBtn && (
          <button
            className="scroll-to-bottom"
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Scroll to bottom"
          >
            ↓
          </button>
        )}

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
          <div className="chat-textarea-wrap">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Type your question... (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              maxLength={2000}
            />
            {input.length > 1500 && (
              <span className={`chat-char-count${input.length > 1900 ? ' over-limit' : ''}`}>
                {input.length} / 2000
              </span>
            )}
          </div>
          <Button
            className="purple-button"
            onClick={() => sendMessage()}
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
