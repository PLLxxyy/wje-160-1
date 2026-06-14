import { GameData, LevelRecord, MistakeRecord, RankRecord, GarbageType, PracticeStats } from '../types';
import { TOTAL_LEVELS } from '../data/questions';

const STORAGE_KEY = 'garbage-sorting-game-data';

function getDefaultPractice(): PracticeStats {
  return {
    totalQuestions: 0,
    totalCorrect: 0,
    bestAccuracy: 0,
    lastAccuracy: 0,
  };
}

function getDefaultData(): GameData {
  const levels: LevelRecord[] = [];
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    levels.push({
      level: i,
      status: i === 1 ? 'unlocked' : 'locked',
      stars: 0,
      bestScore: 0,
      bestAccuracy: 0,
    });
  }
  return {
    levels,
    totalScore: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    mistakes: {},
    leaderboard: [],
    playerName: '',
    practice: getDefaultPractice(),
  };
}

/** 清洗 practice 数据，只保留正确率相关字段，过滤旧版本的多余字段 */
function sanitizePractice(raw: unknown): PracticeStats {
  const defaults = getDefaultPractice();
  if (!raw || typeof raw !== 'object') return defaults;
  const obj = raw as Record<string, unknown>;
  return {
    totalQuestions: typeof obj.totalQuestions === 'number' ? obj.totalQuestions : defaults.totalQuestions,
    totalCorrect: typeof obj.totalCorrect === 'number' ? obj.totalCorrect : defaults.totalCorrect,
    bestAccuracy: typeof obj.bestAccuracy === 'number' ? obj.bestAccuracy : defaults.bestAccuracy,
    lastAccuracy: typeof obj.lastAccuracy === 'number' ? obj.lastAccuracy : defaults.lastAccuracy,
  };
}

export function loadData(): GameData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as Partial<GameData>;
    const defaults = getDefaultData();
    return {
      ...defaults,
      ...parsed,
      levels: parsed.levels && parsed.levels.length > 0 ? parsed.levels : defaults.levels,
      mistakes: parsed.mistakes || {},
      leaderboard: parsed.leaderboard || [],
      practice: sanitizePractice(parsed.practice),
    };
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: GameData): void {
  const cleanData: GameData = {
    ...data,
    practice: sanitizePractice(data.practice),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
}

export function resetData(): GameData {
  const fresh = getDefaultData();
  saveData(fresh);
  return fresh;
}

/** 更新关卡完成记录，返回是否解锁了新关卡 */
export function completeLevel(
  data: GameData,
  level: number,
  score: number,
  accuracy: number,
  stars: number,
): { data: GameData; newUnlock: boolean } {
  const newData = { ...data };
  const levelRecord = newData.levels[level - 1];
  let newUnlock = false;

  // 更新关卡记录
  if (score > levelRecord.bestScore) levelRecord.bestScore = score;
  if (accuracy > levelRecord.bestAccuracy) levelRecord.bestAccuracy = accuracy;
  if (stars > levelRecord.stars) levelRecord.stars = stars;
  levelRecord.status = 'completed';

  // 解锁下一关
  if (level < TOTAL_LEVELS) {
    const next = newData.levels[level];
    if (next.status === 'locked') {
      next.status = 'unlocked';
      newUnlock = true;
    }
  }

  newData.totalScore += score;
  saveData(newData);
  return { data: newData, newUnlock };
}

/** 记录答题统计 */
export function recordAnswers(
  data: GameData,
  results: { questionId: number; correct: boolean; selected: GarbageType }[],
): GameData {
  const newData = { ...data, mistakes: { ...data.mistakes } };
  newData.totalQuestions += results.length;
  newData.totalCorrect += results.filter(r => r.correct).length;

  for (const r of results) {
    if (!r.correct) {
      const existing = newData.mistakes[r.questionId];
      if (existing) {
        newData.mistakes[r.questionId] = {
          ...existing,
          count: existing.count + 1,
          lastSelected: r.selected,
        };
      } else {
        newData.mistakes[r.questionId] = {
          questionId: r.questionId,
          count: 1,
          lastSelected: r.selected,
        };
      }
    }
  }

  saveData(newData);
  return newData;
}

/** 添加排行榜记录 */
export function addRankRecord(
  data: GameData,
  name: string,
  score: number,
  accuracy: number,
  levels: number,
): GameData {
  const record: RankRecord = {
    name,
    score,
    accuracy,
    levels,
    date: new Date().toLocaleDateString('zh-CN'),
  };
  const newData = { ...data };
  newData.leaderboard = [...data.leaderboard, record]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  saveData(newData);
  return newData;
}

/** 设置玩家名字 */
export function setPlayerName(data: GameData, name: string): GameData {
  const newData = { ...data, playerName: name };
  saveData(newData);
  return newData;
}

/** 移除错题 */
export function removeMistake(data: GameData, questionId: number): GameData {
  const newData = { ...data, mistakes: { ...data.mistakes } };
  delete newData.mistakes[questionId];
  saveData(newData);
  return newData;
}

/** 记录自由练习结果（仅正确率相关，不影响闯关记录） */
export function recordPracticeResult(
  data: GameData,
  correctCount: number,
  totalCount: number,
): GameData {
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const newData = {
    ...data,
    practice: {
      totalQuestions: data.practice.totalQuestions + totalCount,
      totalCorrect: data.practice.totalCorrect + correctCount,
      bestAccuracy: Math.max(data.practice.bestAccuracy, accuracy),
      lastAccuracy: accuracy,
    },
  };
  saveData(newData);
  return newData;
}
