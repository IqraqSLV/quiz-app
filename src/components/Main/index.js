import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Segment,
  Item,
  Divider,
  Button,
  Message,
} from 'semantic-ui-react';
import { parseCSV, shuffle } from '../../utils';

import Offline from '../Offline';

const Main = ({ startQuiz, userData, quizConfig }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  const loadQuizData = () => {
    console.log('🚀 loadQuizData called!');
    setProcessing(true);

    if (error) setError(null);

    const csvPath = `${process.env.PUBLIC_URL}/data/${quizConfig.file}`;
    console.log('Fetching CSV from', csvPath);
    fetch(csvPath)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load quiz data');
        return response.text();
      })
      .then(csvText => {
        console.log('✅ CSV loaded successfully, length:', csvText.length);
        setTimeout(() => {
          console.log('Parsing CSV...');
          const parsedQuestions = parseCSV(csvText);
          console.log('✅ Parsed questions:', parsedQuestions.length);

          if (parsedQuestions.length === 0) {
            throw new Error('No questions found in quiz data');
          }

          // Randomly select questions from the pool based on config
          const shuffledQuestions = shuffle(parsedQuestions);
          const questionCount = quizConfig.questionCount || 10;
          const selectedQuestions = shuffledQuestions.slice(0, questionCount);
          console.log('✅ Selected', selectedQuestions.length, 'random questions');

          // Shuffle options for each selected question
          selectedQuestions.forEach(element => {
            element.options = shuffle([
              element.correct_answer,
              ...element.incorrect_answers,
            ]);
          });

          // Set timer based on config (questions × seconds per question)
          const timePerQuestion = quizConfig.timePerQuestion || 60;
          const totalTimeInSeconds = questionCount * timePerQuestion;
          console.log('✅ Starting quiz with', selectedQuestions.length, 'questions and', totalTimeInSeconds, 'seconds');

          setProcessing(false);
          startQuiz(selectedQuestions, totalTimeInSeconds);
        }, 1000);
      })
      .catch(error => {
        console.error('❌ Error loading quiz:', error);
        setTimeout(() => {
          if (!navigator.onLine) {
            setOffline(true);
          } else {
            setProcessing(false);
            setError({
              message: 'Failed to load quiz questions. Please refresh and try again.'
            });
          }
        }, 1000);
      });
  };

  if (offline) return <Offline />;

  return (
    <Container
      className="quiz-container page-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 2em)'
      }}
    >
      <Segment style={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        margin: 0
      }}>
        <Item.Group divided>
          <Item>
            <Item.Content>
              <Item.Header style={{ textAlign: 'center', width: '100%' }}>
                <h1 style={{ margin: 0 }}>{quizConfig.title}</h1>
              </Item.Header>
              {error && (
                <Message error onDismiss={() => setError(null)}>
                  <Message.Header>Error!</Message.Header>
                  {error.message}
                </Message>
              )}
              <Divider />
              <Item.Meta>
                <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line', textAlign: 'center' }}>
                  {quizConfig.description}
                </p>
              </Item.Meta>
              <Divider />
              <Item.Extra style={{ textAlign: 'center' }}>
                <Button
                  size="big"
                  onClick={loadQuizData}
                  disabled={processing}
                  loading={processing}
                  className="purple-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4em'
                  }}
                >
                  {processing ? 'Processing...' : (
                    <>
                      <span>Start</span>
                      <span aria-hidden="true">{'\u26A1'}</span>
                    </>
                  )}
                </Button>
              </Item.Extra>
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
      <br />
    </Container>
  );
};

Main.propTypes = {
  startQuiz: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  quizConfig: PropTypes.shape({
    file: PropTypes.string.isRequired,
    questionCount: PropTypes.number,
    timePerQuestion: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
};

export default Main;
