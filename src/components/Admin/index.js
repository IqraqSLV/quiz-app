import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Segment,
  Header,
  Table,
  Button,
  Form,
  Message,
  Label,
} from 'semantic-ui-react';
import './Admin.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const glassmorphism = {
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(34, 36, 38, 0.1)',
};

const STATUS_COLORS = {
  pending: 'grey',
  ingesting: 'yellow',
  ingested: 'green',
  error: 'red',
};

const Admin = () => {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('pdf');
  const [accessLevel, setAccessLevel] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [ingestingId, setIngestingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [chatFeedback, setChatFeedback] = useState([]);
  const [generalFeedback, setGeneralFeedback] = useState([]);

  useEffect(() => {
    document.title = 'Solarvest HR Admin';
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch(`${API_BASE}/documents`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      setLoadError('Could not load documents. Is the backend running?');
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    try {
      const [chatRes, generalRes] = await Promise.all([
        fetch(`${API_BASE}/feedback`),
        fetch(`${API_BASE}/feedback/general`),
      ]);
      if (chatRes.ok) {
        const data = await chatRes.json();
        setChatFeedback(data.feedback || []);
      }
      if (generalRes.ok) {
        const data = await generalRes.json();
        setGeneralFeedback(data.feedback || []);
      }
    } catch {
      /* best-effort */
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchFeedback();
  }, [fetchDocuments, fetchFeedback]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('access_level', accessLevel);

    try {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }
      const data = await res.json();
      setSuccess(`Uploaded "${data.filename}" successfully.`);
      setFile(null);
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleIngest = async (id) => {
    setIngestingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/ingest/${id}`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Ingest failed');
      }
      const data = await res.json();
      setSuccess(`Document ingested successfully — ${data.chunks_stored} chunks stored.`);
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Ingest failed');
    } finally {
      setIngestingId(null);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Delete failed');
      }
      setSuccess(`Deleted "${filename}".`);
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Container className="quiz-container page-container">
      {/* Title */}
      <Segment style={glassmorphism}>
        <Header as="h2" style={{ color: '#1A1A1A', marginBottom: '0.25em' }}>
          Document Management
        </Header>
        <p
          style={{
            color: '#2C2C2C',
            marginTop: 0,
            marginBottom: 0,
            fontSize: '0.9em',
          }}
        >
          Upload and manage HR policy documents.
        </p>
      </Segment>

      {/* Feedback messages */}
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

      {/* Upload form */}
      <Segment style={glassmorphism}>
        <Header as="h3" style={{ color: '#1A1A1A', marginBottom: '1em' }}>
          Upload Document
        </Header>
        <Form>
          <div className="admin-upload-form">
            <Form.Field className="admin-file-field">
              <label>File</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </Form.Field>
            <Form.Select
              label="Doc Type"
              value={docType}
              onChange={(e, { value }) => setDocType(value)}
              options={[
                { key: 'pdf', value: 'pdf', text: 'PDF' },
                { key: 'docx', value: 'docx', text: 'DOCX' },
                { key: 'txt', value: 'txt', text: 'TXT' },
              ]}
            />
            <Form.Select
              label="Access Level"
              value={accessLevel}
              onChange={(e, { value }) => setAccessLevel(value)}
              options={[
                { key: 'all', value: 'all', text: 'All' },
                { key: 'hr', value: 'hr', text: 'HR Only' },
                { key: 'management', value: 'management', text: 'Management' },
              ]}
            />
          </div>
          <Button
            className="purple-button"
            onClick={handleUpload}
            disabled={!file || uploading}
            loading={uploading}
            icon="upload"
            content="Upload Document"
            labelPosition="right"
            style={{ marginTop: '1em' }}
          />
        </Form>
      </Segment>

      {/* Document table */}
      <Segment style={glassmorphism}>
        <details className="admin-panel" open>
          <summary className="admin-panel-toggle">
            Documents ({documents.length})
          </summary>

          {loadError && <Message warning>{loadError}</Message>}

          {documents.length === 0 && !loadError ? (
            <p style={{ color: '#2C2C2C', fontStyle: 'italic' }}>
              No documents uploaded yet.
            </p>
          ) : (
            <div className="admin-scroll-area">
              <Table striped className="transparent-table">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>#</Table.HeaderCell>
                    <Table.HeaderCell>Filename</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Access</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Action</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {documents.map((doc, i) => (
                    <Table.Row key={doc.id}>
                      <Table.Cell>{i + 1}</Table.Cell>
                      <Table.Cell>{doc.filename}</Table.Cell>
                      <Table.Cell>{doc.doc_type}</Table.Cell>
                      <Table.Cell>{doc.access_level}</Table.Cell>
                      <Table.Cell>
                        <Label
                          color={STATUS_COLORS[doc.status] || 'grey'}
                          size="tiny"
                        >
                          {doc.status}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>{formatDate(doc.ingested_at)}</Table.Cell>
                      <Table.Cell>
                        {(doc.status === 'pending' || doc.status === 'error') && (
                          <Button
                            size="tiny"
                            className="purple-button"
                            icon="play"
                            content="Ingest"
                            labelPosition="left"
                            loading={ingestingId === doc.id}
                            disabled={ingestingId !== null}
                            onClick={() => handleIngest(doc.id)}
                            style={{ marginRight: '0.4em' }}
                          />
                        )}
                        <Button
                          negative
                          size="tiny"
                          icon="trash"
                          content="Delete"
                          onClick={() => handleDelete(doc.id, doc.filename)}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </details>
      </Segment>

      {/* Chat Feedback Ratings */}
      <Segment style={glassmorphism}>
        <details className="admin-panel" open>
          <summary className="admin-panel-toggle">
            Chat Ratings
            {chatFeedback.length > 0 && (
              <span className="admin-panel-badges">
                <Label size="mini">
                  Total <Label.Detail>{chatFeedback.length}</Label.Detail>
                </Label>
                <Label color="green" size="mini">
                  &#128077; <Label.Detail>{chatFeedback.filter((f) => f.rating === 'up').length}</Label.Detail>
                </Label>
                <Label color="red" size="mini">
                  &#128078; <Label.Detail>{chatFeedback.filter((f) => f.rating === 'down').length}</Label.Detail>
                </Label>
              </span>
            )}
          </summary>

          {chatFeedback.length === 0 ? (
            <p style={{ color: '#2C2C2C', fontStyle: 'italic' }}>
              No chat ratings yet.
            </p>
          ) : (
            <div className="admin-scroll-area">
              <Table striped className="transparent-table">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Rating</Table.HeaderCell>
                    <Table.HeaderCell>User Question</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {chatFeedback.slice(0, 50).map((fb) => (
                    <Table.Row key={fb.id}>
                      <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(fb.created_at)}
                      </Table.Cell>
                      <Table.Cell>
                        <Label
                          color={fb.rating === 'up' ? 'green' : 'red'}
                          size="tiny"
                        >
                          {fb.rating === 'up' ? '\u{1F44D}' : '\u{1F44E}'}
                        </Label>
                      </Table.Cell>
                      <Table.Cell>
                        {fb.query
                          ? fb.query.length > 80
                            ? fb.query.slice(0, 80) + '...'
                            : fb.query
                          : '-'}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </details>
      </Segment>

      {/* General Feedback Comments */}
      <Segment style={glassmorphism}>
        <details className="admin-panel" open>
          <summary className="admin-panel-toggle">
            General Comments ({generalFeedback.length})
          </summary>

          {generalFeedback.length === 0 ? (
            <p style={{ color: '#2C2C2C', fontStyle: 'italic' }}>
              No general feedback yet.
            </p>
          ) : (
            <div className="admin-scroll-area">
              <Table striped className="transparent-table">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Category</Table.HeaderCell>
                    <Table.HeaderCell>Comment</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {generalFeedback.slice(0, 50).map((fb) => (
                    <Table.Row key={fb.id}>
                      <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(fb.created_at)}
                      </Table.Cell>
                      <Table.Cell>
                        <Label size="tiny">{fb.category}</Label>
                      </Table.Cell>
                      <Table.Cell>{fb.comment}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </details>
      </Segment>
    </Container>
  );
};

export default Admin;
