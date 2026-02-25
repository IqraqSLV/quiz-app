import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from '../Layout';
import Loader from '../Loader';
import WelcomeForm from '../WelcomeForm';
import Main from '../Main';
import Quiz from '../Quiz';
import Result from '../Result';
import Chat from '../Chat';

import { calculateGrade, calculateScore, shuffle } from '../../utils';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import quizConfig from '../../config/quizConfig';

const QuizApp = ({ config }) => {
  const [loading, setLoading] = useState(false);

  // Set browser tab title based on quiz config
  useEffect(() => {
    document.title = config.tabTitle || 'Solarvest Quiz';
  }, [config.tabTitle]);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [data, setData] = useState(null);
  const [countdownTime, setCountdownTime] = useState(null);
  const [isWelcomeFormShown, setIsWelcomeFormShown] = useState(true);
  const [userData, setUserData] = useState(null);
  const [quizStartedAt, setQuizStartedAt] = useState(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [resultData, setResultData] = useState(null);

  const submitQuizResult = async payload => {
    console.log('🔍 submitQuizResult called');
    console.log('📊 Payload:', payload);
    console.log('✅ isSupabaseConfigured:', isSupabaseConfigured);
    console.log('✅ supabase:', supabase);

    if (!isSupabaseConfigured || !supabase) {
      console.warn('❌ Supabase is not configured. Skipping quiz result submission.');
      return;
    }

    console.log('🚀 Attempting to insert into Supabase...');
    try {
      const { data, error } = await supabase.from('quiz_results').insert(payload);
      if (error) {
        console.error('❌ Failed to save quiz result:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Successfully saved quiz result!', data);
      }
    } catch (error) {
      console.error('❌ Exception while saving quiz result:', error);
    }
  };

  const handleWelcomeFormSubmit = (userInfo) => {
    setUserData(userInfo);
    setIsWelcomeFormShown(false);
  };

  const startQuiz = (data, countdownTime) => {
    setLoading(true);
    setLoadingMessage({
      title: 'Loading your quiz...',
      message: "It won't be long!",
    });
    setCountdownTime(countdownTime);

    setTimeout(() => {
      setQuizStartedAt(new Date().toISOString());
      setData(data);
      setIsQuizStarted(true);
      setLoading(false);
    }, 1000);
  };

  const endQuiz = resultData => {
    const completedAt = new Date().toISOString();
    const startedAt = quizStartedAt || userData?.timestamp || completedAt;
    const scorePercentage = calculateScore(
      resultData.totalQuestions,
      resultData.correctAnswers
    );
    const { grade } = calculateGrade(scorePercentage);
    const timeTakenSeconds = Math.round((resultData.timeTaken || 0) / 1000);

    if (userData) {
      submitQuizResult({
        quiz_type: config.quizType,
        full_name: userData.fullName,
        email: userData.email,
        employee_id: userData.employeeId,
        department: userData.department,
        quiz_started_at: startedAt,
        quiz_completed_at: completedAt,
        total_questions: resultData.totalQuestions,
        correct_answers: resultData.correctAnswers,
        score_percentage: scorePercentage,
        grade,
        time_taken_seconds: timeTakenSeconds,
        questions_and_answers: resultData.questionsAndAnswers,
      });
    }

    setLoading(true);
    setLoadingMessage({
      title: 'Fetching your results...',
      message: 'Just a moment!',
    });

    setTimeout(() => {
      setIsQuizStarted(false);
      setIsQuizCompleted(true);
      setResultData(resultData);
      setLoading(false);
    }, 2000);
  };

  const replayQuiz = () => {
    setLoading(true);
    setLoadingMessage({
      title: 'Getting ready for round two.',
      message: "It won't take long!",
    });

    const shuffledData = shuffle(data);
    shuffledData.forEach(element => {
      element.options = shuffle(element.options);
    });

    setData(shuffledData);

    setTimeout(() => {
      setQuizStartedAt(new Date().toISOString());
      setIsQuizStarted(true);
      setIsQuizCompleted(false);
      setResultData(null);
      setLoading(false);
    }, 1000);
  };

  const resetQuiz = () => {
    setLoading(true);
    setLoadingMessage({
      title: 'Loading the home screen.',
      message: 'Thank you for playing!',
    });

    setTimeout(() => {
      setData(null);
      setCountdownTime(null);
      setIsWelcomeFormShown(true);
      setUserData(null);
      setQuizStartedAt(null);
      setIsQuizStarted(false);
      setIsQuizCompleted(false);
      setResultData(null);
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      {loading && <Loader {...loadingMessage} />}
      {!loading && isWelcomeFormShown && (
        <WelcomeForm onSubmit={handleWelcomeFormSubmit} />
      )}
      {!loading && !isWelcomeFormShown && !isQuizStarted && !isQuizCompleted && (
        <Main startQuiz={startQuiz} userData={userData} quizConfig={config} />
      )}
      {!loading && isQuizStarted && (
        <Quiz data={data} countdownTime={countdownTime} endQuiz={endQuiz} />
      )}
      {!loading && isQuizCompleted && (
        <Result {...resultData} userData={userData} />
      )}
    </Layout>
  );
};

// Main App component with routing
const App = () => {
  return (
    <Routes>
      <Route path="/hr" element={<QuizApp config={quizConfig.hr} />} />
      <Route path="/mctf" element={<QuizApp config={quizConfig.mctf} />} />
      <Route path="/chat" element={<Chat />} />
      {/* Default redirect to HR quiz */}
      <Route path="/" element={<Navigate to="/hr" replace />} />
      <Route path="*" element={<Navigate to="/hr" replace />} />
    </Routes>
  );
};

export default App;
