/** 垃圾分类类型 */
export type GarbageType = 'recycle' | 'hazardous' | 'kitchen' | 'other';

/** 题目 */
export interface Question {
  id: number;
  item: string;
  icon: string;
  answer: GarbageType;
}

/** 关卡状态 */
export type LevelStatus = 'locked' | 'unlocked' | 'completed';

/** 单关记录 */
export interface LevelRecord {
  level: number;
  status: LevelStatus;
  stars: number;       // 0-3
  bestScore: number;
  bestAccuracy: number;
}

/** 答题结果 */
export interface AnswerResult {
  questionId: number;
  correct: boolean;
  selected: GarbageType;
}

/** 排行榜记录 */
export interface RankRecord {
  name: string;
  score: number;
  accuracy: number;
  levels: number;
  date: string;
}

/** 错题记录 */
export interface MistakeRecord {
  questionId: number;
  count: number;
  lastSelected: GarbageType;
}

/** 全局持久化数据 */
export interface GameData {
  levels: LevelRecord[];
  totalScore: number;
  totalQuestions: number;
  totalCorrect: number;
  mistakes: Record<number, MistakeRecord>;
  leaderboard: RankRecord[];
  playerName: string;
}

/** 垃圾分类信息 */
export interface GarbageTypeInfo {
  key: GarbageType;
  label: string;
  icon: string;
  color: string;
}

export const GARBAGE_TYPES: GarbageTypeInfo[] = [
  { key: 'recycle', label: '可回收物', icon: '♻️', color: '#1565c0' },
  { key: 'hazardous', label: '有害垃圾', icon: '☢️', color: '#c62828' },
  { key: 'kitchen', label: '厨余垃圾', icon: '🍊', color: '#e65100' },
  { key: 'other', label: '其他垃圾', icon: '🗑️', color: '#6a1b9a' },
];
