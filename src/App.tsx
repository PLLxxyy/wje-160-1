import React, { useState, useCallback } from 'react';
import { GameData } from './types';
import { loadData } from './utils/storage';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Profile from './pages/Profile';
import Mistakes from './pages/Mistakes';

type Page =
  | { name: 'home' }
  | { name: 'quiz'; level: number }
  | { name: 'result'; level: number; score: number; accuracy: number; stars: number; timeUsed: number }
  | { name: 'profile' }
  | { name: 'mistakes' };

const App: React.FC = () => {
  const [gameData, setGameData] = useState<GameData>(() => loadData());
  const [page, setPage] = useState<Page>({ name: 'home' });

  const updateData = useCallback((updater: (prev: GameData) => GameData) => {
    setGameData(prev => updater(prev));
  }, []);

  const goHome = useCallback(() => setPage({ name: 'home' }), []);
  const goProfile = useCallback(() => setPage({ name: 'profile' }), []);
  const goMistakes = useCallback(() => setPage({ name: 'mistakes' }), []);

  switch (page.name) {
    case 'home':
      return (
        <Home
          gameData={gameData}
          onStartLevel={(level) => setPage({ name: 'quiz', level })}
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
  }
};

export default App;
