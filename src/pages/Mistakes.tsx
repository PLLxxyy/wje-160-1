import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameData, GarbageType, GARBAGE_TYPES } from '../types';
import { allQuestions } from '../data/questions';
import { removeMistake } from '../utils/storage';
import { Lives } from '../components/Lives';
import { Timer } from '../components/Timer';
import { ComboPopup } from '../components/ComboPopup';

interface MistakesProps {
  gameData: GameData;
  updateData: (updater: (prev: GameData) => GameData) => void;
  onBack: () => void;
}

const MAX_LIVES = 3;
const TIME_PER_QUESTION = 15;

const Mistakes: React.FC<MistakesProps> = ({ gameData, updateData, onBack }) => {
  const mistakeIds = Object.keys(gameData.mistakes).map(Number);
  const hasMistakes = mistakeIds.length > 0;

  const [mode, setMode] = useState<'list' | 'practice'>('list');
  const [practiceQuestions, setPracticeQuestions] = useState<typeof allQuestions>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [combo, setCombo] = useState(0);
  const [comboKey, setComboKey] = useState(0);
  const [selected, setSelected] = useState<GarbageType | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [practiceResult, setPracticeResult] = useState({ correct: 0, total: 0 });

  const processingRef = useRef(false);
  const livesRef = useRef(MAX_LIVES);
  const correctCountRef = useRef(0);
  const totalCountRef = useRef(0);
  const indexRef = useRef(0);
  const comboRef = useRef(0);
  const questionsRef = useRef<typeof allQuestions>([]);

  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);

  const startPractice = () => {
    const qs = mistakeIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter(Boolean) as typeof allQuestions;
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    questionsRef.current = qs;
    setPracticeQuestions(qs);
    setCurrentIndex(0);
    indexRef.current = 0;
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setCombo(0);
    comboRef.current = 0;
    correctCountRef.current = 0;
    totalCountRef.current = 0;
    setSelected(null);
    setIsCorrect(null);
    setTimerResetKey(0);
    setPracticeFinished(false);
    setPracticeResult({ correct: 0, total: 0 });
    setMode('practice');
  };

  const handleChoice = useCallback(
    (type: GarbageType) => {
      if (processingRef.current) return;
      processingRef.current = true;

      const q = questionsRef.current[indexRef.current];
      if (!q) { processingRef.current = false; return; }
      const correct = type === q.answer;
      setSelected(type);
      setIsCorrect(correct);
      totalCountRef.current += 1;

      if (correct) {
        correctCountRef.current += 1;
        comboRef.current += 1;
        setCombo(comboRef.current);
        if (comboRef.current >= 3) setComboKey(k => k + 1);
        updateData(prev => removeMistake(prev, q.id));
      } else {
        comboRef.current = 0;
        setCombo(0);
        livesRef.current -= 1;
        setLives(l => l - 1);
      }

      setTimeout(() => {
        processingRef.current = false;
        setSelected(null);
        setIsCorrect(null);

        const isLast = indexRef.current + 1 >= questionsRef.current.length;
        const noLives = livesRef.current <= 0;

        if (isLast || noLives || !correct) {
          if (!correct && !isLast && !noLives) {
            setCurrentIndex(i => i + 1);
            setTimerResetKey(k => k + 1);
          } else {
            setPracticeFinished(true);
            setPracticeResult({ correct: correctCountRef.current, total: totalCountRef.current });
          }
        } else {
          setCurrentIndex(i => i + 1);
          setTimerResetKey(k => k + 1);
        }
      }, 600);
    },
    [updateData],
  );

  const handleTimeout = useCallback(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    setSelected('other');
    setIsCorrect(false);
    comboRef.current = 0;
    setCombo(0);
    totalCountRef.current += 1;
    livesRef.current -= 1;
    setLives(l => l - 1);

    setTimeout(() => {
      processingRef.current = false;
      setSelected(null);
      setIsCorrect(null);

      const isLast = indexRef.current + 1 >= questionsRef.current.length;
      const noLives = livesRef.current <= 0;

      if (isLast || noLives) {
        setPracticeFinished(true);
        setPracticeResult({ correct: correctCountRef.current, total: totalCountRef.current });
      } else {
        setCurrentIndex(i => i + 1);
        setTimerResetKey(k => k + 1);
      }
    }, 600);
  }, []);

  // ---- LIST MODE ----
  if (mode === 'list') {
    return (
      <div className="app-container">
        <div className="nav-bar">
          <button className="nav-back" onClick={onBack}>←</button>
          <h1>错题本</h1>
          <span style={{ width: 32 }} />
        </div>

        {!hasMistakes ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>暂无错题，继续保持！</p>
          </div>
        ) : (
          <>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
              共 {mistakeIds.length} 道错题
            </p>
            {mistakeIds.map(id => {
              const q = allQuestions.find(q => q.id === id);
              const record = gameData.mistakes[id];
              if (!q || !record) return null;
              const typeInfo = GARBAGE_TYPES.find(g => g.key === q.answer);
              return (
                <div key={id} className="mistake-card">
                  <div className="mistake-item">{q.icon} {q.item}</div>
                  <div className="mistake-answer">
                    正确答案：<span className="mistake-correct">{typeInfo?.icon} {typeInfo?.label}</span>
                  </div>
                  <div className="mistake-times">已答错 {record.count} 次</div>
                </div>
              );
            })}
            <button className="btn btn-primary" onClick={startPractice} style={{ marginTop: 20 }}>
              错题重练
            </button>
          </>
        )}
      </div>
    );
  }

  // ---- PRACTICE FINISHED ----
  if (practiceFinished) {
    const accuracy = practiceResult.total > 0
      ? Math.round((practiceResult.correct / practiceResult.total) * 100) : 0;
    return (
      <div className="app-container">
        <div className="nav-bar">
          <button className="nav-back" onClick={() => setMode('list')}>←</button>
          <h1>错题练习结果</h1>
          <span style={{ width: 32 }} />
        </div>
        <div className="result-card">
          <div className="result-icon">{accuracy >= 80 ? '🎉' : '💪'}</div>
          <div className="result-title">{accuracy >= 80 ? '掌握得不错！' : '继续加油！'}</div>
          <div className="result-subtitle">正确率 {accuracy}%（{practiceResult.correct}/{practiceResult.total}）</div>
        </div>
        <button className="btn btn-primary" onClick={startPractice}>再练一次</button>
        <button className="btn btn-secondary" onClick={() => setMode('list')}>返回错题本</button>
      </div>
    );
  }

  // ---- PRACTICE ACTIVE ----
  const q = practiceQuestions[currentIndex];
  if (!q) return null;

  return (
    <div className="app-container">
      <ComboPopup combo={combo} key_={comboKey} />

      <div className="quiz-header">
        <button className="nav-back" onClick={() => setMode('list')}>←</button>
        <Lives remaining={lives} max={MAX_LIVES} />
        <Timer seconds={TIME_PER_QUESTION} onTimeout={handleTimeout} resetKey={timerResetKey} />
      </div>

      <div style={{ textAlign: 'center', color: '#999', fontSize: 13, marginBottom: 12 }}>
        第 {currentIndex + 1} / {practiceQuestions.length} 题
      </div>

      <div className="question-card">
        <div className="item-icon">{q.icon}</div>
        <div className="item-name">{q.item}</div>
        <div className="question-hint">这是什么垃圾？</div>
      </div>

      <div className="options-grid">
        {GARBAGE_TYPES.map(gt => {
          let btnClass = `option-btn ${gt.key}`;
          if (selected !== null) {
            if (gt.key === q.answer) btnClass += ' correct';
            else if (gt.key === selected && !isCorrect) btnClass += ' wrong';
            btnClass += ' disabled';
          }
          return (
            <button key={gt.key} className={btnClass} onClick={() => handleChoice(gt.key)}>
              <span className="option-icon">{gt.icon}</span>
              <span>{gt.label}</span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className={`feedback-bar ${isCorrect ? 'correct' : 'wrong'}`}>
          {isCorrect
            ? '✓ 回答正确！'
            : `✗ 回答错误，正确答案是：${GARBAGE_TYPES.find(g => g.key === q.answer)?.label}`}
        </div>
      )}
    </div>
  );
};

export default Mistakes;
