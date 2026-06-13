import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GarbageType, AnswerResult, GARBAGE_TYPES } from '../types';
import { getRandomQuestions, QUESTIONS_PER_LEVEL } from '../data/questions';
import { ProgressBar } from '../components/ProgressBar';
import { ComboPopup } from '../components/ComboPopup';

interface PracticeQuizProps {
  onFinish: (correctCount: number, totalCount: number, timeUsed: number) => void;
  onBack: () => void;
}

const PRACTICE_QUESTION_COUNT = QUESTIONS_PER_LEVEL;

const PracticeQuiz: React.FC<PracticeQuizProps> = ({ onFinish, onBack }) => {
  const [questions] = useState(() => getRandomQuestions(PRACTICE_QUESTION_COUNT));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboKey, setComboKey] = useState(0);
  const [selected, setSelected] = useState<GarbageType | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startTimeRef = useRef(Date.now());
  const processingRef = useRef(false);
  const answersRef = useRef<AnswerResult[]>([]);
  const correctCountRef = useRef(0);
  const comboRef = useRef(0);
  const indexRef = useRef(0);

  const currentQuestion = questions[currentIndex];

  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);

  const finishQuiz = useCallback(
    (finalAnswers: AnswerResult[]) => {
      const timeUsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const correct = finalAnswers.filter(a => a.correct).length;
      onFinish(correct, PRACTICE_QUESTION_COUNT, timeUsed);
    },
    [onFinish],
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
        correctCountRef.current += 1;
        comboRef.current += 1;
        setCombo(comboRef.current);
        if (comboRef.current >= 3) setComboKey(k => k + 1);
      } else {
        comboRef.current = 0;
        setCombo(0);
      }

      setTimeout(() => {
        processingRef.current = false;
        setSelected(null);
        setIsCorrect(null);

        const isLastQuestion = indexRef.current + 1 >= PRACTICE_QUESTION_COUNT;

        if (isLastQuestion) {
          finishQuiz(newAnswers);
        } else {
          setCurrentIndex(i => i + 1);
        }
      }, 600);
    },
    [finishQuiz, questions],
  );

  if (currentIndex >= PRACTICE_QUESTION_COUNT) return null;

  const currentCorrect = answersRef.current.filter(a => a.correct).length;

  return (
    <div className="app-container">
      <ComboPopup combo={combo} key_={comboKey} />

      <div className="quiz-header">
        <button className="nav-back" onClick={onBack}>←</button>
        <div className="practice-title">🎯 自由练习</div>
        <div className="practice-score">
          正确 {currentCorrect}/{currentIndex}
        </div>
      </div>

      <ProgressBar current={currentIndex + 1} total={PRACTICE_QUESTION_COUNT} />

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

export default PracticeQuiz;
