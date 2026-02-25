import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Header, Message, Button, Icon } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

import { calculateScore, calculateGrade, timeConverter } from '../../utils';
import { topicMap } from '../../data/topicMap';

const Stats = ({
  totalQuestions,
  correctAnswers,
  timeTaken,
  userData,
  questionsAndAnswers,
}) => {
  const navigate = useNavigate();
  const score = calculateScore(totalQuestions, correctAnswers);
  const { grade } = calculateGrade(score);
  const { hours, minutes, seconds } = timeConverter(timeTaken);
  const normalizedGrade = grade ? grade[0] : null;
  const wrongAnswers = totalQuestions - correctAnswers;
  const weakTopics = [
    ...new Set(
      (questionsAndAnswers || [])
        .filter(item => item.point === 0)
        .map(item => topicMap[item.question] ?? null)
        .filter(Boolean)
    ),
  ];

  // Extract first name for personalization
  const firstName = userData.fullName.split(' ')[0];

  // Grade-based greeting messages
  const getGreeting = () => {
    if (normalizedGrade === 'A') return `Outstanding, ${firstName}!`;
    if (normalizedGrade === 'B') return `Excellent work, ${firstName}!`;
    if (normalizedGrade === 'C' || normalizedGrade === 'D') return `Good job, ${firstName}!`;
    if (normalizedGrade === 'F') return `Not quite there yet, ${firstName}`;
    return `Thanks for completing the quiz, ${firstName}!`;
  };

  // Grade-specific encouragement messages
  const gradeMessages = {
    'A': "You're ready to shine at Solarvest!",
    'B': "You have a strong grasp of our values.",
    'C': "You're on the right track.",
    'D': "Consider reviewing the materials for deeper understanding.",
    'F': "Let's schedule a review with HR to help you succeed."
  };

  return (
    <Segment style={{
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    }}>
      <Header as="h1" textAlign="center">
        {getGreeting()}
      </Header>
      <Header as="h3" textAlign="center" style={{ color: '#4A4A4A', marginTop: '-10px', marginBottom: '30px' }}>
        {normalizedGrade ? gradeMessages[normalizedGrade] : null}
      </Header>

      <Message
        info
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(34, 36, 38, 0.08)'
        }}
      >
        <Message.Header>Your results have been submitted</Message.Header>
        <p>
          Your quiz results have been sent to the HR team.
          You'll receive an email with your next onboarding steps soon.
        </p>
      </Message>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1em',
        marginTop: '2em'
      }}>
        <div style={{
          backgroundColor: 'rgba(123, 67, 151, 0.7)',
          color: 'white',
          padding: '1.5em 1em',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '0.3em' }}>
            {grade}
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Grade</div>
        </div>

        <div style={{
          backgroundColor: 'rgba(123, 67, 151, 0.7)',
          color: 'white',
          padding: '1.5em 1em',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '0.3em' }}>
            {score}%
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Your Score</div>
        </div>

        <div style={{
          backgroundColor: 'rgba(123, 67, 151, 0.7)',
          color: 'white',
          padding: '1.5em 1em',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '0.3em' }}>
            {correctAnswers}/{totalQuestions}
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Correct Answers</div>
        </div>

        <div style={{
          backgroundColor: 'rgba(123, 67, 151, 0.7)',
          color: 'white',
          padding: '1.5em 1em',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '0.3em' }}>
            {`${Number(hours)}h ${Number(minutes)}m ${Number(seconds)}s`}
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Time Taken</div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '1em',
        fontSize: '0.85em',
        color: '#6B6B6B'
      }}>
        Passing score : 60%
      </div>

      {wrongAnswers > 0 && (
        <Segment
          style={{
            background: 'rgba(123, 67, 151, 0.08)',
            border: '1px solid rgba(123, 67, 151, 0.25)',
            borderRadius: '8px',
            marginTop: '1.5em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1em',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: '0.2em' }}>
              <Icon name="lightbulb outline" style={{ color: '#7B4397' }} />
              You got {wrongAnswers} question{wrongAnswers > 1 ? 's' : ''} wrong
            </div>
            <div style={{ fontSize: '0.9em', color: '#4A4A4A' }}>
              Review your missed answers with the HR Assistant.
            </div>
          </div>
          <Button
            className="purple-button"
            icon
            labelPosition="right"
            onClick={() => navigate('/chat', { state: { entrypoint: 'quiz_result', weakTopics } })}
          >
            Ask HR Assistant
            <Icon name="chat" />
          </Button>
        </Segment>
      )}
    </Segment>
  );
};

Stats.propTypes = {
  totalQuestions: PropTypes.number.isRequired,
  correctAnswers: PropTypes.number.isRequired,
  timeTaken: PropTypes.number.isRequired,
  userData: PropTypes.object.isRequired,
  questionsAndAnswers: PropTypes.array,
};

export default Stats;
