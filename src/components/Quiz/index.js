import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Segment,
  Item,
  Divider,
  Button,
  Message,
  Menu,
} from 'semantic-ui-react';
import he from 'he';

import Countdown from '../Countdown';
import ProgressBar from '../ProgressBar';
import { getLetter } from '../../utils';

const Quiz = ({ data, countdownTime, endQuiz }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userSlectedAns, setUserSlectedAns] = useState(null);
  const [timeTaken, setTimeTaken] = useState(null);
  const [userAnswers, setUserAnswers] = useState({}); // Store all user answers

  useEffect(() => {
    if (questionIndex > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    // Load previously selected answer when navigating back
    setUserSlectedAns(userAnswers[questionIndex] || null);
  }, [questionIndex, userAnswers]);

  const handleItemClick = (e, { name }) => {
    setUserSlectedAns(name);
    // Store answer immediately when selected
    setUserAnswers(prev => ({ ...prev, [questionIndex]: name }));
  };

  const handlePrevious = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleNext = () => {
    if (questionIndex === data.length - 1) {
      // Calculate final results from all stored answers
      let totalCorrect = 0;
      const qna = data.map((question, index) => {
        const userAnswer = userAnswers[index] || '';
        const correctAnswer = he.decode(question.correct_answer);
        const point = userAnswer === correctAnswer ? 1 : 0;
        totalCorrect += point;

        return {
          question: he.decode(question.question),
          user_answer: userAnswer,
          correct_answer: correctAnswer,
          point,
        };
      });

      return endQuiz({
        totalQuestions: data.length,
        correctAnswers: totalCorrect,
        timeTaken,
        questionsAndAnswers: qna,
      });
    }

    setQuestionIndex(questionIndex + 1);
  };

  const timeOver = timeTaken => {
    // Calculate final results from all stored answers when time runs out
    let totalCorrect = 0;
    const qna = data.map((question, index) => {
      const userAnswer = userAnswers[index] || '';
      const correctAnswer = he.decode(question.correct_answer);
      const point = userAnswer === correctAnswer ? 1 : 0;
      totalCorrect += point;

      return {
        question: he.decode(question.question),
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        point,
      };
    });

    return endQuiz({
      totalQuestions: data.length,
      correctAnswers: totalCorrect,
      timeTaken,
      questionsAndAnswers: qna,
    });
  };

  return (
    <Item.Header>
      <Container className="quiz-container page-container">
        <ProgressBar current={questionIndex + 1} total={data.length} />
        <Segment style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <Item.Group divided>
            <Item>
              <Item.Content>
                <Item.Extra>
                  <Countdown
                    countdownTime={countdownTime}
                    timeOver={timeOver}
                    setTimeTaken={setTimeTaken}
                  />
                </Item.Extra>
                <br />
                <Item.Meta>
                  <Message
                    className="quiz-question-text"
                    style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                  >
                    {`Q. ${he.decode(data[questionIndex].question)}`}
                  </Message>
                  <br />
                  <Item.Description>
                    <h3 className="quiz-question-text">Please choose one of the following answers:</h3>
                  </Item.Description>
                  <Divider />
                  <Menu vertical fluid style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}>
                    {data[questionIndex].options.map((option, i) => {
                      const letter = getLetter(i);
                      const decodedOption = he.decode(option);

                      return (
                        <Menu.Item
                          key={decodedOption}
                          name={decodedOption}
                          active={userSlectedAns === decodedOption}
                          onClick={handleItemClick}
                          className={`quiz-option ${userSlectedAns === decodedOption ? 'selected' : ''}`}
                        >
                          <b style={{ marginRight: '8px' }}>{letter}</b>
                          {decodedOption}
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                </Item.Meta>
                <Divider />
                <Item.Extra>
                  <Button
                    content="Previous"
                    onClick={handlePrevious}
                    floated="left"
                    size="big"
                    icon="left chevron"
                    labelPosition="left"
                    disabled={questionIndex === 0}
                    className="purple-button"
                  />
                  <Button
                    content={questionIndex === data.length - 1 ? 'Submit' : 'Next'}
                    onClick={handleNext}
                    floated="right"
                    size="big"
                    icon="right chevron"
                    labelPosition="right"
                    disabled={!userSlectedAns}
                    className="purple-button"
                  />
                </Item.Extra>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
        <br />
      </Container>
    </Item.Header>
  );
};

Quiz.propTypes = {
  data: PropTypes.array.isRequired,
  countdownTime: PropTypes.number.isRequired,
  endQuiz: PropTypes.func.isRequired,
};

export default Quiz;
