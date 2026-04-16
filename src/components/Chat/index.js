import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { topicLabels } from '../../data/topicMap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';
import SLVLogo from './SLVLogo.png';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

/** Render markdown content from LLM output (bullets, bold, paragraphs). */
function FormattedText({ text }) {
  if (!text) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ul: ({ node, ...props }) => <ul className="chat-bullet-list" {...props} />,
        ol: ({ node, ...props }) => <ol className="chat-bullet-list" style={{ listStyleType: 'decimal' }} {...props} />,
        strong: ({ node, ...props }) => <strong {...props} />,
        p: ({ node, ...props }) => <p {...props} />,
        a: ({ node, children, ...props }) => (
          <a target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/** In-app document viewer modal */
function DocumentViewerModal({ doc, onClose }) {
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const isPdf = doc.filename.toLowerCase().endsWith('.pdf');
  const isTxt = doc.filename.toLowerCase().endsWith('.txt');

  const fileUrl = `${API_BASE}/documents/${doc.documentId}/file`;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!isPdf) return undefined;

    const controller = new AbortController();
    let blobUrl = null;

    setPdfLoading(true);
    setPdfError('');
    setPdfViewerUrl(null);

    // Use a blob URL so the preview does not depend on iframe response headers.
    fetch(fileUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        blobUrl = URL.createObjectURL(blob);
        setPdfViewerUrl(doc.pageNumber ? `${blobUrl}#page=${doc.pageNumber}` : blobUrl);
        setPdfLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setPdfError('Failed to load PDF preview.');
        setPdfLoading(false);
      });

    return () => {
      controller.abort();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [doc.pageNumber, fileUrl, isPdf]);

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
            pdfLoading ? (
              <div className="doc-viewer-loading">Loading PDF...</div>
            ) : pdfError ? (
              <div className="doc-viewer-fallback">
                <p>{pdfError}</p>
                <a className="doc-viewer-download" href={fileUrl} download={doc.filename}>
                  â¬‡ Download {doc.filename}
                </a>
              </div>
            ) : pdfViewerUrl ? (
              <iframe src={pdfViewerUrl} title={doc.filename} />
            ) : null
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

function AssistantIcon() {
  return (
    <img src={SLVLogo} alt="Solarvest" width="20" height="20" style={{ borderRadius: '50%', objectFit: 'contain', backgroundColor: '#fff' }} />
  );
}

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Welcome to the Solarvest HR Policy Assistant. I can help you with leave entitlements, medical benefits, claims, working hours, and other company policies. Your questions are confidential and answers are sourced directly from official Solarvest HR documents.',
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
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState(location.state?.prefill || '');
  const [loading, setLoading] = useState(false);
  const [ratedMessages, setRatedMessages] = useState(new Set());
  const [expandedSources, setExpandedSources] = useState({});
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
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
    document.body.classList.add('chat-route');
    return () => document.body.classList.remove('chat-route');
  }, []);

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
        body: JSON.stringify({ query: text, session_id: sessionId, access_level: 'all' }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      assistantMsg.summary = data.summary || data.answer || '(No answer returned)';
      assistantMsg.details = data.details || '';
      assistantMsg.followups = data.followups || [];
      assistantMsg.sources = (data.sources || []).filter(s => !s.filename?.toLowerCase().endsWith('.txt'));
      assistantMsg.meta = data.meta || {};
      assistantMsg.contact = data.contact || null;
      assistantMsg.form = data.form || null;
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
          session_id: sessionId,
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
          <div className="chat-avatar" aria-hidden="true"><AssistantIcon /></div>
          <div className="chat-header-info">
            <p className="chat-header-title">Solarvest HR Assistant</p>
            <p className="chat-header-subtitle">
              <span className="chat-status-dot" />
              Sourced from official Solarvest HR policies
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
                <div className="bubble-avatar" aria-hidden="true"><AssistantIcon /></div>
              )}
              <div className={`chat-bubble ${msg.role}`}>
                {msg.summary ? (
                  <>
                    <div className="chat-summary">
                      <FormattedText text={msg.summary} />
                    </div>

                    {msg.details && msg.details !== msg.summary && (
                      <details className="chat-details" open>
                        <summary className="chat-details-toggle">Full answer</summary>
                        <div className="chat-details-body">
                          <FormattedText text={msg.details} />
                        </div>
                      </details>
                    )}

                    {msg.sources && msg.sources.length > 0 && (msg.meta?.top_reranker_score ?? 1) >= 0.10 && (
                      <details className="chat-sources-panel">
                        <summary className="chat-sources-toggle">Sources ({msg.sources.length})</summary>
                        {msg.sources.slice(0, expandedSources[i] ? undefined : 3).map((src, si) => (
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
                        {msg.sources.length > 3 && !expandedSources[i] && (
                          <button
                            className="chat-sources-more"
                            onClick={() => setExpandedSources(prev => ({ ...prev, [i]: true }))}
                          >
                            Show {msg.sources.length - 3} more
                          </button>
                        )}
                      </details>
                    )}

                    {msg.contact && (
                      <div className="chat-contact-card">
                        <div className="chat-contact-label">Need further help? Reach out to:</div>
                        <div className="chat-contact-info">
                          <strong className="chat-contact-name">{msg.contact.name}</strong>
                          <span className="chat-contact-role">
                            {msg.contact.designation} — {msg.contact.function_label}
                          </span>
                          <a href={`mailto:${msg.contact.email}`} className="chat-contact-email">
                            {msg.contact.email}
                          </a>
                          {msg.contact.phone && (
                            <a href={`tel:${msg.contact.phone.replace(/\s/g, '')}`} className="chat-contact-phone">
                              {msg.contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {msg.form && (
                      <div className="chat-form-card">
                        <div className="chat-form-header">RELATED FORM</div>
                        <div className="chat-form-body">
                          <svg className="chat-form-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M11 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            <path d="M11 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            <path d="M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <div className="chat-form-info">
                            <strong className="chat-form-name">{msg.form.label}</strong>
                            <span className="chat-form-desc">{msg.form.description}</span>
                            <div className="chat-form-actions">
                              <button
                                className="chat-form-btn"
                                onClick={() => setViewerDoc({
                                  documentId: msg.form.document_id,
                                  filename: msg.form.filename,
                                })}
                              >
                                View
                              </button>
                              <a
                                className="chat-form-btn"
                                href={`${API_BASE}/documents/${msg.form.document_id}/file`}
                                download={msg.form.filename}
                              >
                                ↓ Download
                              </a>
                            </div>
                          </div>
                        </div>
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
                    {msg.failedQuery && (
                      <div style={{ marginTop: '0.5em' }}>
                        <button className="retry-btn" onClick={() => sendMessage(msg.failedQuery)}>
                          ↺ Retry
                        </button>
                      </div>
                    )}
                  </>
                )}

                {msg.role === 'assistant' && i > 0 && !msg.failedQuery && (
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
                          Helpful
                        </button>
                        <button
                          className="feedback-btn down"
                          onClick={() => handleFeedback(i, 'down')}
                          aria-label="This response was not helpful"
                        >
                          Not helpful
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
              <div className="bubble-avatar" aria-hidden="true"><AssistantIcon /></div>
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

    {viewerDoc && (
      <DocumentViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} />
    )}
    </>
  );
};

export default Chat;
