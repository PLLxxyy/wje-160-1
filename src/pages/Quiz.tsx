import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameData, GarbageType, AnswerResult, GARBAGE_TYPES } from '../types';
import { getQuestionsForLevel, QUESTIONS_PER_LEVEL } from '../data/questions';
import { recordAnswers, completeLevel } from '../utils/storage';
import { ProgressBar } from '../components/ProgressBar';
import { Lives } from '../components/Lives';
import { Timer } from '../components/Timer';
import { ComboPopup } from '../components/ComboPopup';

interface QuizProps {
  level: number;
  updateData: (updater: (prev: GameData) => GameData) => void;
  onFinish: (score: number, accuracy: number, stars: number, timeUsed: number) => void;
  onBack: () => void;
}

const MAX_LIVES = 3;
const TIME_PER_QUESTION = 15;
const POINTS_PER_CORRECT = 10;

const Quiz: React.FC<QuizProps> = ({ level, updateData, onFinish, onBack }) => {
  const [questions] = useState(() => getQuestionsForLevel(level));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboKey, setComboKey] = useState(0);
  const [selected, setSelected] = useState<GarbageType | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerResetKey, setTimerResetKey] = useState(0);

  const startTimeRef = useRef(Date.now());
  const processingRef = useRef(false);
  const answersRef = useRef<AnswerResult[]>([]);
  const livesRef = useRef(MAX_LIVES);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const indexRef = useRef(0);

  const currentQuestion = questions[currentIndex];

  // Keep refs in sync
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);

  const finishQuiz = useCallback(
    (finalScore: number, finalAnswers: AnswerResult[]) => {
      const timeUsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const correctCount = finalAnswers.filter(a => a.correct).length;
      const totalAnswered = finalAnswers.length;
      const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      const passed = accuracy >= 80;
      let stars = 0;
      if (accuracy >= 95) stars = 3;
      else if (accuracy >= 85) stars = 2;
      else if (accuracy >= 80) stars = 1;

      updateData(prev => {
        let d = recordAnswers(prev, finalAnswers);
        if (passed) {
          d = completeLevel(d, level, finalScore, accuracy, stars).data;
        }
        return d;
      });

      onFinish(finalScore, accuracy, stars, timeUsed);
    },
    [level, onFinish, updateData],
  );

  const handleChoice = useCallback(
    (type: GarbageType) => {
      if (processingRef.current) return;
      processingRef.current = true;

      const q = questions[indexRef.current];
      const correct = type === q.answer;
      setSelected(type);
      setIsCorrect(correct);

      const result: AnswerResult = { questionId: q.id, correct, selected: type };
      const newAnswers = [...answersRef.current, result];
      answersRef.current = newAnswers;

      if (correct) {
        scoreRef.current += POINTS_PER_CORRECT;
        comboRef.current += 1;
        setScore(s => s + POINTS_PER_CORRECT);
        setCombo(comboRef.current);
        if (comboRef.current >= 3) setComboKey(k => k + 1);
      } else {
        livesRef.current -= 1;
        comboRef.current = 0;
        setLives(l => l - 1);
        setCombo(0);
      }

      setTimeout(() => {
        processingRef.current = false;
        setSelected(null);
        setIsCorrect(null);

        const isLastQuestion = indexRef.current + 1 >= QUESTIONS_PER_LEVEL;
        const noLivesLeft = livesRef.current <= 0;

        if (isLastQuestion || noLivesLeft || !correct) {
          // Wrong answer always ends, or reached end / no lives
          if (!correct && !isLastQuestion && !noLivesLeft) {
            // Wrong answer but not game over -- advance to next question
            setCurrentIndex(i => i + 1);
            setTimerResetKey(k => k + 1);
          } else {
            // Truly done
            finishQuiz(scoreRef.current, newAnswers);
          }
        } else {
          // Correct answer, advance
          setCurrentIndex(i => i + 1);
          setTimerResetKey(k => k + 1);
        }
      }, 600);
    },
    [finishQuiz, questions],
  );

  const handleTimeout = useCallback(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    setSelected('other');
    setIsCorrect(false);
    setCombo(0);
    comboRef.current = 0;

    const q = questions[indexRef.current];
    const result: AnswerResult = { questionId: q.id, correct: false, selected: 'other' };
    const newAnswers = [...answersRef.current, result];
    answersRef.current = newAnswers;

    livesRef.current -= 1;
    setLives(l => l - 1);

    setTimeout(() => {
      processingRef.current = false;
      setSelected(null);
      setIsCorrect(null);

      const isLastQuestion = indexRef.current + 1 >= QUESTIONS_PER_LEVEL;
      const noLivesLeft = livesRef.current <= 0;

      if (isLastQuestion || noLivesLeft) {
        finishQuiz(scoreRef.current, newAnswers);
      } else {
        setCurrentIndex(i => i + 1);
        setTimerResetKey(k => k + 1);
      }
    }, 600);
  }, [finishQuiz, questions]);

  if (currentIndex >= QUESTIONS_PER_LEVEL || lives <= 0) return null;

  return (
    <div className="app-container">
      <ComboPopup combo={combo} key_={comboKey} />

      <div className="quiz-header">
        <button className="nav-back" onClick={onBack}>←</button>
        <Lives remaining={lives} max={MAX_LIVES} />
        <Timer seconds={TIME_PER_QUESTION} onTimeout={handleTimeout} resetKey={timerResetKey} />
      </div>

      <ProgressBar current={currentIndex + 1} total={QUESTIONS_PER_LEVEL} />

      <div className="question-card">
        <div className="item-icon">{currentQuestion.icon}</div>
        <div className="item-name">{currentQuestion.item}</div>
        <div className="question-hint">这是什么垃圾？</div>
      </div>

      <div className="options-grid">
        {GARBAGE_TYPES.map(gt => {
          let btnClass = `option-btn ${gt.key}`;
          if (selected !== null) {
            if (gt.key === currentQuestion.answer) {
              btnClass += ' correct';
            } else if (gt.key === selected && !isCorrect) {
              btnClass += ' wrong';
            }
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
            : `✗ 回答错误，正确答案是：${GARBAGE_TYPES.find(g => g.key === currentQuestion.answer)?.label}`}
        </div>
      )}
    </div>
  );
};

export default Quiz;
