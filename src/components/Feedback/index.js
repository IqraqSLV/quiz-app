import { useState, useEffect } from 'react';
import {
  Container,
  Segment,
  Header,
  Form,
  Button,
  Message,
} from 'semantic-ui-react';
import './Feedback.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const glassmorphism = {
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(34, 36, 38, 0.1)',
};

const CATEGORY_OPTIONS = [
  { key: 'general', value: 'general', text: 'General' },
  { key: 'ui', value: 'ui', text: 'UI Improvement' },
  { key: 'content', value: 'content', text: 'Content Quality' },
  { key: 'bug', value: 'bug', text: 'Bug Report' },
];

const Feedback = () => {
  const [category, setCategory] = useState('general');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Solarvest HR Feedback';
  }, []);

  const handleSubmit = async () => {
    if (comment.trim().length < 10) {
      setError('Please enter at least 10 characters.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/feedback/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, comment: comment.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Submission failed');
      }
      setSuccess('Thank you! Your feedback has been submitted.');
      setComment('');
      setCategory('general');
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="quiz-container page-container">
      <Segment style={glassmorphism}>
        <Header as="h2" style={{ color: '#1A1A1A', marginBottom: '0.25em' }}>
          Feedback
        </Header>
        <p style={{ color: '#2C2C2C', marginTop: 0, marginBottom: '1em', fontSize: '0.9em' }}>
          Help us improve the HR Helpdesk. Your feedback is anonymous.
        </p>

        {success && (
          <Message positive onDismiss={() => setSuccess(null)}>
            {success}
          </Message>
        )}
        {error && (
          <Message negative onDismiss={() => setError(null)}>
            {error}
          </Message>
        )}

        <Form>
          <Form.Select
            label="Category"
            value={category}
            onChange={(e, { value }) => setCategory(value)}
            options={CATEGORY_OPTIONS}
          />
          <Form.TextArea
            label="Your Feedback"
            placeholder="Tell us what you think... (min 10 characters)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
          />
          <Button
            className="purple-button"
            onClick={handleSubmit}
            disabled={submitting || comment.trim().length < 10}
            loading={submitting}
            icon="send"
            content="Submit Feedback"
            labelPosition="right"
          />
        </Form>
      </Segment>
    </Container>
  );
};

export default Feedback;
