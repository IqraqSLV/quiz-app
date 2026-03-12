import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { topicLabels } from '../../data/topicMap';
import './Chat.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

/** Render a text string that may contain \n, "- " bullets, and **bold** markers. */
function FormattedText({ text }) {
  if (!text) return null;
  const lines = text.split('\n').filter((l) => l.trim() !== '');

  const elements = [];
  let bulletBuffer = [];

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${elements.length}`} className="chat-bullet-list">
        {bulletBuffer.map((b, i) => (
          <li key={i}><BoldText text={b} /></li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  for (const line of lines) {
    if (line.trimStart().startsWith('- ')) {
      bulletBuffer.push(line.trimStart().slice(2));
    } else {
      flushBullets();
      elements.push(<p key={`p-${elements.length}`}><BoldText text={line} /></p>);
    }
  }
  flushBullets();

  return <>{elements}</>;
}

/** Render **bold** markers within a line of text. */
function BoldText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part
      )}
    </>
  );
}

/** In-app document viewer modal */
function DocumentViewerModal({ doc, onClose }) {
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);

  const isPdf = doc.filename.toLowerCase().endsWith('.pdf');
  const isTxt = doc.filename.toLowerCase().endsWith('.txt');

  const fileUrl = `${API_BASE}/documents/${doc.documentId}/file`;
  const viewerUrl = isPdf && doc.pageNumber ? `${fileUrl}#page=${doc.pageNumber}` : fileUrl;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!isTxt) return;
    setTextLoading(true);
    fetch(fileUrl)
      .then((res) => res.text())
      .then((t) => { setTextContent(t); setTextLoading(false); })
      .catch(() => { setTextContent('Failed to load file.'); setTextLoading(false); });
  }, [fileUrl, isTxt]);

  return (
    <div className="doc-viewer-overlay" onClick={onClose}>
      <div className="doc-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="doc-viewer-header">
          <span className="doc-viewer-title">
            {doc.filename}
            {doc.pageNumber && <span className="doc-viewer-page">Page {doc.pageNumber}</span>}
          </span>
          <div className="doc-viewer-actions">
            <a className="doc-viewer-download" href={fileUrl} download={doc.filename}>
              ⬇ Download
            </a>
            <button className="doc-viewer-close" onClick={onClose} aria-label="Close viewer">✕</button>
          </div>
        </div>
        <div className="doc-viewer-body">
          {isPdf ? (
            <iframe src={viewerUrl} title={doc.filename} />
          ) : isTxt ? (
            textLoading
              ? <div className="doc-viewer-loading">Loading…</div>
              : <pre className="doc-viewer-text">{textContent}</pre>
          ) : (
            <div className="doc-viewer-fallback">
              <p>This file type cannot be previewed in the browser.</p>
              <a className="doc-viewer-download" href={fileUrl} download={doc.filename}>
                ⬇ Download {doc.filename}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Send icon SVG */
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

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
  const [viewerDoc, setViewerDoc] = useState(null);
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(false);
  const [widgetCategory, setWidgetCategory] = useState('general');
  const [widgetComment, setWidgetComment] = useState('');
  const [widgetStatus, setWidgetStatus] = useState('idle');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollRef = useRef(null);
  const sendingRef = useRef(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { autoResize(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setShowScrollBtn(!atBottom);
  };

  const sendMessage = async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!text || loading || sendingRef.current) return;
    sendingRef.current = true;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
      assistantMsg.content = assistantMsg.summary;
    } catch (err) {
      assistantMsg.content = 'Sorry, I could not reach the HR Helpdesk service. Please try again.';
      assistantMsg.summary = '';
      assistantMsg.failedQuery = text;
    }
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
    sendingRef.current = false;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCardClick = (prompt) => {
    if (loading) return;
    sendMessage(prompt);
  };

  const WIDGET_CATEGORY_LABELS = {
    general: 'General',
    ui: 'UI Improvement',
    content: 'Content Quality',
    bug: 'Bug Report',
  };

  useEffect(() => {
    if (!showFeedbackWidget) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowFeedbackWidget(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFeedbackWidget]);

  const handleWidgetSubmit = async () => {
    setWidgetStatus('submitting');
    const comment = widgetComment.trim() || `${WIDGET_CATEGORY_LABELS[widgetCategory]} feedback`;
    try {
      const res = await fetch(`${API_BASE}/feedback/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: widgetCategory, comment }),
      });
      if (!res.ok) throw new Error();
      setWidgetStatus('success');
      setTimeout(() => {
        setShowFeedbackWidget(false);
        setWidgetStatus('idle');
        setWidgetCategory('general');
        setWidgetComment('');
      }, 2000);
    } catch {
      setWidgetStatus('error');
    }
  };

  const handleFeedback = async (msgIndex, rating) => {
    setRatedMessages((prev) => new Set(prev).add(msgIndex));
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
      // best-effort
    }
  };

  return (
    <>
    <div className="chat-page">
      <div className="chat-card">

        {/* ── Header bar ── */}
        <div className="chat-card-header">
          <div className="chat-avatar" aria-hidden="true">🤖</div>
          <div className="chat-header-info">
            <p className="chat-header-title">HR Helpdesk</p>
            <p className="chat-header-subtitle">
              <span className="chat-status-dot" />
              Online · Ask me anything
            </p>
          </div>
        </div>

        {/* ── Messages ── */}
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
              {msg.role === 'assistant' && (
                <div className="bubble-avatar" aria-hidden="true">🤖</div>
              )}
              <div className={`chat-bubble ${msg.role}`}>
                {msg.summary ? (
                  <>
                    <div className="chat-summary">
                      <FormattedText text={msg.summary} />
                      {msg.meta?.confidence && (
                        <span className={`confidence-badge confidence-${msg.meta.confidence}`}>
                          {msg.meta.confidence}
                        </span>
                      )}
                    </div>

                    {msg.details && msg.details !== msg.summary && (
                      <details className="chat-details" open>
                        <summary className="chat-details-toggle">Full answer</summary>
                        <div className="chat-details-body">
                          {msg.details.split('\n').filter(Boolean).map((para, pi) => (
                            <p key={pi}>{para}</p>
                          ))}
                        </div>
                      </details>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <details className="chat-sources-panel">
                        <summary className="chat-sources-toggle">Sources ({msg.sources.length})</summary>
                        {msg.sources.slice(0, expandedSources[i] ? undefined : 2).map((src, si) => (
                          <div key={si} className="chat-source-card">
                            <button
                              className="chat-source-filename chat-source-link"
                              onClick={() => setViewerDoc({
                                documentId: src.document_id,
                                filename: src.filename,
                                pageNumber: src.page_number,
                              })}
                            >
                              {src.filename}
                            </button>
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
                      </details>
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
                    {msg.failedQuery && (
                      <div style={{ marginTop: '0.5em' }}>
                        <button className="retry-btn" onClick={() => sendMessage(msg.failedQuery)}>
                          ↺ Retry
                        </button>
                      </div>
                    )}
                  </>
                )}

                {msg.role === 'assistant' && i > 0 && (
                  <div className="chat-feedback">
                    {ratedMessages.has(i) ? (
                      <span className="chat-feedback-thanks">✓ Thanks for your feedback!</span>
                    ) : (
                      <>
                        <button
                          className="feedback-btn up"
                          onClick={() => handleFeedback(i, 'up')}
                          aria-label="This response was helpful"
                        >
                          👍 Helpful
                        </button>
                        <button
                          className="feedback-btn down"
                          onClick={() => handleFeedback(i, 'down')}
                          aria-label="This response was not helpful"
                        >
                          👎 Not helpful
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
              <div className="bubble-avatar" aria-hidden="true">🤖</div>
              <div className="chat-bubble assistant">
                <div className="typing-indicator" role="status" aria-label="Assistant is typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Scroll FAB (inside card, absolute) ── */}
        {showScrollBtn && (
          <button
            className="scroll-to-bottom"
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Scroll to bottom"
          >
            ↓
          </button>
        )}

        {/* ── Suggestion cards ── */}
        {showCards && (
          <div className="suggestion-cards">
            <span className="suggestion-cards-label">Suggested topics</span>
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

        {/* ── Input bar ── */}
        <div className="chat-input-bar">
          <div className="chat-textarea-wrap">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask about leave, benefits, policy…"
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
          <button
            className="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>

      </div>
    </div>

    {/* ── Floating feedback widget ── */}
    {showFeedbackWidget && (
      <div className="feedback-widget-panel" role="dialog" aria-label="Quick feedback">
        <div className="feedback-widget-header">
          <span>Quick Feedback</span>
          <button
            className="feedback-widget-close"
            onClick={() => setShowFeedbackWidget(false)}
            aria-label="Close feedback"
          >
            ✕
          </button>
        </div>
        <select
          className="feedback-widget-select"
          value={widgetCategory}
          onChange={(e) => setWidgetCategory(e.target.value)}
          disabled={widgetStatus === 'submitting' || widgetStatus === 'success'}
        >
          <option value="general">General</option>
          <option value="ui">UI Improvement</option>
          <option value="content">Content Quality</option>
          <option value="bug">Bug Report</option>
        </select>
        <textarea
          className="feedback-widget-textarea"
          placeholder="Anything else? (optional)"
          value={widgetComment}
          onChange={(e) => setWidgetComment(e.target.value)}
          rows={4}
          disabled={widgetStatus === 'submitting' || widgetStatus === 'success'}
        />
        <button
          className="feedback-widget-submit"
          onClick={handleWidgetSubmit}
          disabled={widgetStatus === 'submitting' || widgetStatus === 'success'}
        >
          {widgetStatus === 'submitting' ? 'Sending…' : widgetStatus === 'success' ? '✓ Thanks!' : 'Submit'}
        </button>
        {widgetStatus === 'error' && (
          <p className="feedback-widget-error">Couldn't send — try again</p>
        )}
      </div>
    )}
    <button
      className="feedback-widget-btn"
      onClick={() => { setShowFeedbackWidget(prev => !prev); setWidgetStatus('idle'); }}
      aria-label="Give feedback about this tool"
      title="Feedback"
    >
      💬
    </button>

    {viewerDoc && (
      <DocumentViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} />
    )}
    </>
  );
};

export default Chat;
