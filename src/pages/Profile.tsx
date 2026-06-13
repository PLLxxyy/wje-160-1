import React, { useState } from 'react';
import { GameData, GARBAGE_TYPES } from '../types';
import { allQuestions } from '../data/questions';
import { resetData, setPlayerName } from '../utils/storage';

interface ProfileProps {
  gameData: GameData;
  onBack: () => void;
  onMistakes: () => void;
  updateData: (updater: (prev: GameData) => GameData) => void;
}

const Profile: React.FC<ProfileProps> = ({ gameData, onBack, onMistakes, updateData }) => {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(gameData.playerName);

  const completedCount = gameData.levels.filter(l => l.status === 'completed').length;
  const totalStars = gameData.levels.reduce((s, l) => s + l.stars, 0);
  const accuracy = gameData.totalQuestions > 0
    ? Math.round((gameData.totalCorrect / gameData.totalQuestions) * 100)
    : 0;
  const mistakeCount = Object.keys(gameData.mistakes).length;

  const handleSaveName = () => {
    const name = nameInput.trim();
    if (name) {
      updateData(prev => setPlayerName(prev, name));
      setEditing(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要重置所有数据吗？此操作不可撤销！')) {
      updateData(() => resetData());
      onBack();
    }
  };

  return (
    <div className="app-container">
      <div className="nav-bar">
        <button className="nav-back" onClick={onBack}>←</button>
        <h1>个人中心</h1>
        <span style={{ width: 32 }} />
      </div>

      {/* 头像 & 名字 */}
      <div className="profile-header">
        <div className="profile-avatar">
          {gameData.playerName ? gameData.playerName[0].toUpperCase() : '?'}
        </div>
        {editing ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              maxLength={12}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '2px solid #4caf50',
                fontSize: 16, textAlign: 'center', width: 140,
              }}
              autoFocus
            />
            <button
              onClick={handleSaveName}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: '#4caf50', color: 'white', fontWeight: 600, cursor: 'pointer',
              }}
            >
              保存
            </button>
          </div>
        ) : (
          <div
            style={{ fontSize: 18, fontWeight: 700, marginTop: 8, cursor: 'pointer' }}
            onClick={() => {
              setNameInput(gameData.playerName);
              setEditing(true);
            }}
          >
            {gameData.playerName || '点击设置昵称'} ✏️
          </div>
        )}
      </div>

      {/* 统计 */}
      <div className="profile-stats">
        <div className="profile-stat">
          <div className="ps-value">{completedCount}</div>
          <div className="ps-label">闯关数</div>
        </div>
        <div className="profile-stat">
          <div className="ps-value">{accuracy}%</div>
          <div className="ps-label">正确率</div>
        </div>
        <div className="profile-stat">
          <div className="ps-value">{totalStars}⭐</div>
          <div className="ps-label">总星数</div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="section-title">📊 详细统计</div>
      <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ color: '#666' }}>总答题数</span>
          <span style={{ fontWeight: 600 }}>{gameData.totalQuestions}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ color: '#666' }}>答对题数</span>
          <span style={{ fontWeight: 600, color: '#4caf50' }}>{gameData.totalCorrect}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ color: '#666' }}>答错题数</span>
          <span style={{ fontWeight: 600, color: '#f44336' }}>{gameData.totalQuestions - gameData.totalCorrect}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ color: '#666' }}>累计得分</span>
          <span style={{ fontWeight: 600, color: '#ff8f00' }}>{gameData.totalScore}</span>
        </div>
      </div>

      {/* 错题本入口 */}
      <div className="section-title">📝 学习工具</div>
      <button className="btn btn-secondary" onClick={onMistakes} style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>错题本</span>
        <span style={{ color: mistakeCount > 0 ? '#f44336' : '#999' }}>
          {mistakeCount > 0 ? `${mistakeCount} 道错题` : '暂无错题'}
        </span>
      </button>

      {/* 排行榜 */}
      {gameData.leaderboard.length > 0 && (
        <>
          <div className="section-title">🏆 排行榜</div>
          {gameData.leaderboard.map((r, i) => (
            <div key={i} className="rank-card">
              <span className={`rank-num ${i < 3 ? `top${i + 1}` : ''}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </span>
              <div className="rank-info">
                <div className="rank-name">{r.name}</div>
                <div className="rank-detail">{r.accuracy}%正确率 · 第{r.levels}关 · {r.date}</div>
              </div>
              <div className="rank-score">{r.score}</div>
            </div>
          ))}
        </>
      )}

      {/* 重置 */}
      <div style={{ marginTop: 32 }}>
        <button className="btn btn-danger" onClick={handleReset}>
          重置所有数据
        </button>
      </div>

      {/* 底部 Tab */}
      <div className="tab-bar">
        <button className="tab-item" onClick={onBack}>
          <span className="tab-icon">🏠</span>
          <span>首页</span>
        </button>
        <button className="tab-item active">
          <span className="tab-icon">👤</span>
          <span>我的</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
