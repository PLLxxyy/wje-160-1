import React from 'react';
import { GameData } from '../types';
import { recordPracticeResult } from '../utils/storage';

interface PracticeResultProps {
  correctCount: number;
  totalCount: number;
  gameData: GameData;
  updateData: (updater: (prev: GameData) => GameData) => void;
  onHome: () => void;
  onRetry: () => void;
}

const PracticeResult: React.FC<PracticeResultProps> = ({
  correctCount, totalCount, gameData, updateData, onHome, onRetry,
}) => {
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  React.useEffect(() => {
    updateData(prev => recordPracticeResult(prev, correctCount, totalCount));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const newTotalQuestions = gameData.practice.totalQuestions + totalCount;
  const newTotalCorrect = gameData.practice.totalCorrect + correctCount;
  const avgAccuracy = newTotalQuestions > 0
    ? Math.round((newTotalCorrect / newTotalQuestions) * 100)
    : 0;
  const bestAccuracy = Math.max(gameData.practice.bestAccuracy, accuracy);

  let resultIcon = '📝';
  let resultTitle = '练习完成';
  if (accuracy === 100) {
    resultIcon = '🏆';
    resultTitle = '满分通关！';
  } else if (accuracy >= 90) {
    resultIcon = '🎉';
    resultTitle = '非常棒！';
  } else if (accuracy >= 70) {
    resultIcon = '👍';
    resultTitle = '做得不错';
  } else if (accuracy >= 50) {
    resultIcon = '💪';
    resultTitle = '继续努力';
  } else {
    resultIcon = '📚';
    resultTitle = '需要加油';
  }

  return (
    <div className="app-container">
      <div className="nav-bar">
        <button className="nav-back" onClick={onHome}>←</button>
        <h1>自由练习</h1>
        <span style={{ width: 32 }} />
      </div>

      <div className="result-card">
        <div className="result-icon">{resultIcon}</div>
        <div className="result-title">{resultTitle}</div>
        <div className="result-subtitle">共 {totalCount} 题，答对 {correctCount} 题</div>
      </div>

      <div className="result-stats">
        <div className="result-stat">
          <div className="rs-value">{accuracy}%</div>
          <div className="rs-label">本次正确率</div>
        </div>
        <div className="result-stat">
          <div className="rs-value">{correctCount}/{totalCount}</div>
          <div className="rs-label">答对数</div>
        </div>
        <div className="result-stat">
          <div className="rs-value">{bestAccuracy}%</div>
          <div className="rs-label">最高正确率</div>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 24 }}>📊 累计统计</div>
      <div className="home-stats" style={{ marginBottom: 16 }}>
        <div className="stat">
          <div className="stat-value">{newTotalQuestions}</div>
          <div className="stat-label">累计答题</div>
        </div>
        <div className="stat">
          <div className="stat-value">{newTotalCorrect}</div>
          <div className="stat-label">累计答对</div>
        </div>
        <div className="stat">
          <div className="stat-value">{avgAccuracy}%</div>
          <div className="stat-label">平均正确率</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 24 }}>
        练习数据仅作统计，不影响闯关记录
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onRetry}>
          再来一轮 🔄
        </button>
        <button className="btn btn-secondary" onClick={onHome}>
          返回首页
        </button>
      </div>
    </div>
  );
};

export default PracticeResult;
