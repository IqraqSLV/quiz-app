// Quiz configuration for different quiz types
// Add new quizzes here by adding a new key with the required properties

const quizConfig = {
  hr: {
    quizType: 'hr',
    path: '/hr',
    file: 'QA.csv',
    questionCount: 10,
    timePerQuestion: 60, // seconds
    tabTitle: 'Did You Pay Attention? 👀',
    title: "Orientation Recap, You're Up!",
    description: `Now let's do a quick and fun recap to see what stuck 🧠✨
This isn't a test, just a check-in to help you start your journey confidently.
This quiz contains 10 random questions with 1 min allocated per Q.

Ready? Let's begin!`,
  },
  mctf: {
    quizType: 'mctf',
    path: '/mctf',
    file: 'MCTF.csv',
    questionCount: 3,
    timePerQuestion: 60, // seconds
    tabTitle: 'Are You Solarvest-Ready?',
    title: 'Are You Solarvest-Ready?',
    description: `Welcome to the Solarvest Career Fair Quiz! 🌞
Test your knowledge about Solarvest with 3 quick questions.

Ready? Let's begin!`,
  },
};

export default quizConfig;
