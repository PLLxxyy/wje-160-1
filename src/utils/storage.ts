import { GameData, LevelRecord, MistakeRecord, RankRecord, GarbageType } from '../types';
import { TOTAL_LEVELS } from '../data/questions';

const STORAGE_KEY = 'garbage-sorting-game-data';

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
    };
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: GameData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
