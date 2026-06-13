import React, { useState } from 'react';
import { GameData } from '../types';
import { TOTAL_LEVELS } from '../data/questions';
import { setPlayerName } from '../utils/storage';

interface HomeProps {
  gameData: GameData;
  onStartLevel: (level: number) => void;
  onProfile: () => void;
}

const Home: React.FC<HomeProps> = ({ gameData, onStartLevel, onProfile }) => {
  const [showNameModal, setShowNameModal] = useState(!gameData.playerName);
  const [nameInput, setNameInput] = useState('');

  const completedCount = gameData.levels.filter(l => l.status === 'completed').length;
  const totalStars = gameData.levels.reduce((s, l) => s + l.stars, 0);
  const accuracy = gameData.totalQuestions > 0
    ? Math.round((gameData.totalCorrect / gameData.totalQuestions) * 100)
    : 0;

  const handleConfirmName = () => {
    const name = nameInput.trim();
    if (name) {
      setPlayerName(gameData, name);
      setShowNameModal(false);
      window.location.reload();
    }
  };

  return (
    <div className="app-container">
      {/* 名字输入弹窗 */}
      {showNameModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>欢迎来到垃圾分类闯关！</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>请输入你的昵称</p>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirmName()}
              placeholder="请输入昵称"
              maxLength={12}
              autoFocus
            />
            <button className="btn btn-primary" onClick={handleConfirmName}>
              开始闯关
            </button>
          </div>
        </div>
      )}

      {/* 头部 */}
      <div className="home-header">
        <h1>垃圾分类闯关</h1>
        <p>
          {gameData.playerName
            ? `${gameData.playerName}，挑战垃圾分类知识！`
            : '挑战你的垃圾分类知识！'}
        </p>
      </div>

      {/* 统计 */}
      <div className="home-stats">
        <div className="stat">
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">已闯关</div>
        </div>
        <div className="stat">
          <div className="stat-value">{totalStars}⭐</div>
          <div className="stat-label">总星数</div>
        </div>
        <div className="stat">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">正确率</div>
        </div>
      </div>

      {/* 关卡列表 */}
      <div className="section-title">🗺️ 关卡地图</div>
      <div className="level-grid">
        {gameData.levels.map(lv => {
          let cls = 'level-card ';
          let content;
          if (lv.status === 'locked') {
            cls += 'locked';
            content = <span className="lock-icon">🔒</span>;
          } else if (lv.status === 'completed') {
            cls += 'completed';
            const starsStr = '⭐'.repeat(lv.stars) + '☆'.repeat(3 - lv.stars);
            content = (
              <>
                <span className="level-num">{lv.level}</span>
                <span className="level-stars">{starsStr}</span>
                <span className="level-score">{lv.bestScore}分</span>
              </>
            );
          } else {
            cls += 'unlocked';
            content = <span className="level-num">{lv.level}</span>;
          }

          return (
            <div
              key={lv.level}
              className={cls}
              onClick={() => {
                if (lv.status !== 'locked') onStartLevel(lv.level);
              }}
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* 底部 Tab */}
      <div className="tab-bar">
        <button className="tab-item active">
          <span className="tab-icon">🏠</span>
          <span>首页</span>
        </button>
        <button className="tab-item" onClick={onProfile}>
          <span className="tab-icon">👤</span>
          <span>我的</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
