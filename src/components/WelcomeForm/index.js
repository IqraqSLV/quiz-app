import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Segment, Header, Form, Button, Message, Icon } from 'semantic-ui-react';

const WelcomeForm = ({ onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState(null);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !employeeId.trim() || !department.trim()) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      employeeId: employeeId.trim(),
      department: department.trim(),
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Container text className="page-container" style={{
      display: 'flex',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <Segment style={{
        width: '100%',
        padding: '2em 2em 1.5em 2em',
        margin: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5em' }}>
          <Header as="h1" style={{ fontSize: '2.2em', marginBottom: '0.3em', color: '#1A1A1A' }}>
            Welcome to <span style={{ color: '#7B4397' }}>Solarvest!</span>
          </Header>
          <Header.Subheader style={{ fontSize: '1.1em', color: '#4A4A4A' }}>
            Before we begin your onboarding quiz, let's get to know you better
          </Header.Subheader>
        </div>

        <Form onSubmit={handleSubmit} error={!!error}>
          <Form.Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Form.Input
            label="Email Address"
            type="email"
            placeholder="your.email@solarvest.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Form.Input
            label="Employee ID"
            placeholder="Enter your employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />

          <Form.Input
            label="Department/Team"
            placeholder="e.g., Engineering, Sales, HR"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />

          {error && <Message error content={error} />}

          <div style={{ marginTop: '1.5em', textAlign: 'center' }}>
            <Button
              type="submit"
              size="large"
              icon
              labelPosition="right"
              className="purple-button"
              style={{
                background: '#7B4397 !important',
                backgroundColor: '#7B4397 !important',
                backgroundImage: 'none !important',
                color: 'white !important',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none !important'
              }}
            >
              Start My Quiz
              <Icon name="arrow right" />
            </Button>
          </div>
        </Form>

        <div style={{
          marginTop: '1.5em',
          marginBottom: '1.5em',
          padding: '1em',
          backgroundColor: 'rgba(123, 67, 151, 0.1)',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid rgba(123, 67, 151, 0.3)'
        }}>
          <Icon name="info circle" style={{ color: '#7B4397' }} />
          <span style={{ marginLeft: '0.5em', color: '#4A4A4A' }}>
            60% passing score required
          </span>
        </div>
      </Segment>
    </Container>
  );
};

WelcomeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default WelcomeForm;
