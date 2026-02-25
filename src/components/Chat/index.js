import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Segment, Input, Button, Header } from 'semantic-ui-react';
import './Chat.css';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hi! Ask me anything about leave, benefits, or company policy.',
};

const Chat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState(location.state?.prefill || '');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    document.title = 'Solarvest HR Chat';
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    // MOCK — replace with fetch('http://localhost:8000/chat', ...) in P2-07
    await new Promise(r => setTimeout(r, 800));
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '(Mock) The backend RAG endpoint is not connected yet. This will be answered by the HR Helpdesk AI in P2-07.',
      },
    ]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
              <div className={`chat-bubble ${msg.role}`}>{msg.content}</div>
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
