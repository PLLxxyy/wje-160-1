import React from 'react';
import { GameData } from '../types';
import { TOTAL_LEVELS } from '../data/questions';
import { addRankRecord } from '../utils/storage';

interface ResultProps {
  level: number;
  score: number;
  accuracy: number;
  stars: number;
  timeUsed: number;
  gameData: GameData;
  updateData: (updater: (prev: GameData) => GameData) => void;
  onHome: () => void;
  onRetry: () => void;
  onNext: () => void;
  onProfile: () => void;
}

const Result: React.FC<ResultProps> = ({
  level, score, accuracy, stars, timeUsed, gameData, updateData, onHome, onRetry, onNext, onProfile,
}) => {
  const passed = accuracy >= 80;
  const hasNext = level < TOTAL_LEVELS;

  const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  const minutes = Math.floor(timeUsed / 60);
  const seconds = timeUsed % 60;
  const timeStr = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;

  // Record to leaderboard
  React.useEffect(() => {
    if (gameData.playerName && passed) {
      updateData(prev => addRankRecord(prev, prev.playerName, score, accuracy, level));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app-container">
      <div className="nav-bar">
        <button className="nav-back" onClick={onHome}>←</button>
        <h1>第 {level} 关</h1>
        <span style={{ width: 32 }} />
      </div>

      <div className="result-card">
        <div className="result-icon">
          {passed ? (stars >= 3 ? '🏆' : stars >= 2 ? '🎉' : '👍') : '😤'}
        </div>
        <div className="result-title">
          {passed ? (stars >= 3 ? '完美通关！' : stars >= 2 ? '优秀通关！' : '恭喜过关！') : '闯关失败'}
        </div>
        <div className="result-stars">{starsDisplay}</div>
        <div className="result-subtitle">
          {passed ? `第 ${level} 关已通过` : '正确率需达到80%才能过关，再试一次吧'}
        </div>
      </div>

      <div className="result-stats">
        <div className="result-stat">
          <div className="rs-value">{score}</div>
          <div className="rs-label">得分</div>
        </div>
        <div className="result-stat">
          <div className="rs-value">{accuracy}%</div>
          <div className="rs-label">正确率</div>
        </div>
        <div className="result-stat">
          <div className="rs-value">{timeStr}</div>
          <div className="rs-label">用时</div>
        </div>
      </div>

      <div className="result-actions">
        {passed && hasNext && (
          <button className="btn btn-primary" onClick={onNext}>
            下一关 →
          </button>
        )}
        <button className="btn btn-secondary" onClick={onRetry}>
          再玩一次
        </button>
        <button className="btn btn-secondary" onClick={onHome}>
          返回首页
        </button>
        <button className="btn btn-secondary" onClick={onProfile}>
          个人中心
        </button>
      </div>
    </div>
  );
};

export default Result;
