import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Menu } from 'semantic-ui-react';
import confetti from 'canvas-confetti';

import Stats from './Stats';
import QNA from './QNA';

const Result = ({
  totalQuestions,
  correctAnswers,
  timeTaken,
  questionsAndAnswers,
  replayQuiz,
  resetQuiz,
  userData,
}) => {
  const [activeTab, setActiveTab] = useState('Stats');
  const passingScore = totalQuestions * 0.6; // 60% passing
  const passed = correctAnswers >= passingScore;

  useEffect(() => {
    // Trigger confetti if user passed
    if (passed) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire confetti from both sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#7B4397', '#E8D5F2', '#FFFFFF', '#FFD700']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#7B4397', '#E8D5F2', '#FFFFFF', '#FFD700']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [passed]);

  const handleTabClick = (e, { name }) => {
    setActiveTab(name);
  };

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
      <Menu fluid widths={2} className="result-tabs">
        <Menu.Item
          name="Stats"
          active={activeTab === 'Stats'}
          onClick={handleTabClick}
        />
        <Menu.Item
          name="QNA"
          active={activeTab === 'QNA'}
          onClick={handleTabClick}
        />
      </Menu>
      {activeTab === 'Stats' && (
        <Stats
          totalQuestions={totalQuestions}
          correctAnswers={correctAnswers}
          timeTaken={timeTaken}
          replayQuiz={replayQuiz}
          resetQuiz={resetQuiz}
          userData={userData}
          questionsAndAnswers={questionsAndAnswers}
        />
      )}
      {activeTab === 'QNA' && <QNA questionsAndAnswers={questionsAndAnswers} />}
      <br />
    </Container>
  );
};

Result.propTypes = {
  totalQuestions: PropTypes.number.isRequired,
  correctAnswers: PropTypes.number.isRequired,
  timeTaken: PropTypes.number.isRequired,
  questionsAndAnswers: PropTypes.array.isRequired,
  replayQuiz: PropTypes.func.isRequired,
  resetQuiz: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
};

export default Result;
