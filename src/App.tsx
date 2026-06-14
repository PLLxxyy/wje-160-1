import React, { useState, useCallback } from 'react';
import { GameData } from './types';
import { loadData } from './utils/storage';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Profile from './pages/Profile';
import Mistakes from './pages/Mistakes';
import PracticeQuiz from './pages/PracticeQuiz';
import PracticeResult from './pages/PracticeResult';

type Page =
  | { name: 'home' }
  | { name: 'quiz'; level: number }
  | { name: 'result'; level: number; score: number; accuracy: number; stars: number; timeUsed: number }
  | { name: 'profile' }
  | { name: 'mistakes' }
  | { name: 'practice-quiz' }
  | { name: 'practice-result'; correctCount: number; totalCount: number };

const App: React.FC = () => {
  const [gameData, setGameData] = useState<GameData>(() => loadData());
  const [page, setPage] = useState<Page>({ name: 'home' });

  const updateData = useCallback((updater: (prev: GameData) => GameData) => {
    setGameData(prev => updater(prev));
  }, []);

  const goHome = useCallback(() => setPage({ name: 'home' }), []);
  const goProfile = useCallback(() => setPage({ name: 'profile' }), []);
  const goMistakes = useCallback(() => setPage({ name: 'mistakes' }), []);
  const goPracticeQuiz = useCallback(() => setPage({ name: 'practice-quiz' }), []);

  switch (page.name) {
    case 'home':
      return (
        <Home
          gameData={gameData}
          onStartLevel={(level) => setPage({ name: 'quiz', level })}
          onStartPractice={goPracticeQuiz}
          onProfile={goProfile}
        />
      );
    case 'quiz':
      return (
        <Quiz
          level={page.level}
          updateData={updateData}
          onFinish={(score, accuracy, stars, timeUsed) =>
            setPage({ name: 'result', level: page.level, score, accuracy, stars, timeUsed })
          }
          onBack={goHome}
        />
      );
    case 'result':
      return (
        <Result
          level={page.level}
          score={page.score}
          accuracy={page.accuracy}
          stars={page.stars}
          timeUsed={page.timeUsed}
          gameData={gameData}
          updateData={updateData}
          onHome={goHome}
          onRetry={() => setPage({ name: 'quiz', level: page.level })}
          onNext={() => setPage({ name: 'quiz', level: page.level + 1 })}
          onProfile={goProfile}
        />
      );
    case 'profile':
      return (
        <Profile
          gameData={gameData}
          onBack={goHome}
          onMistakes={goMistakes}
          updateData={updateData}
        />
      );
    case 'mistakes':
      return (
        <Mistakes
          gameData={gameData}
          updateData={updateData}
          onBack={goProfile}
        />
      );
    case 'practice-quiz':
      return (
        <PracticeQuiz
          onFinish={(correctCount, totalCount) =>
            setPage({ name: 'practice-result', correctCount, totalCount })
          }
          onBack={goHome}
        />
      );
    case 'practice-result':
      return (
        <PracticeResult
          correctCount={page.correctCount}
          totalCount={page.totalCount}
          gameData={gameData}
          updateData={updateData}
          onHome={goHome}
          onRetry={goPracticeQuiz}
        />
      );
  }
};

export default App;
