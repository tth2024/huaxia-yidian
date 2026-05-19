import type { Card, Attribute, CardAttributes, LevelConfig } from './types';
import { ALL_CARDS } from './cardData';
import { findMatchingCombo } from './comboData';
import type { CardCombo } from './types';

// ===== 牌库管理 =====
export class DeckManager {
  private deck: Card[] = [];
  private discardPile: Card[] = [];

  constructor(cardPool?: Card[]) {
    this.deck = cardPool ? [...cardPool] : [...ALL_CARDS];
    this.shuffle();
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  draw(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        // 牌库空了，洗回弃牌堆
        this.deck = [...this.discardPile];
        this.discardPile = [];
        this.shuffle();
      }
      if (this.deck.length > 0) {
        drawn.push(this.deck.pop()!);
      }
    }
    return drawn;
  }

  discard(cards: Card[]) {
    this.discardPile.push(...cards);
  }

  get remaining(): number {
    return this.deck.length;
  }
}

// ===== 分数计算 =====
export function calculateScore(cards: Card[], activeCombos: CardCombo[], attribute: Attribute): number {
  let baseScore = 0;
  let comboBonus = 0;

  // 基础分数：所有卡牌在目标指标上的数值之和
  for (const card of cards) {
    baseScore += card.attributes[attribute];
  }

  // 组合加成
  for (const combo of activeCombos) {
    comboBonus += combo.bonusAttributes[attribute] || 0;
  }

  return baseScore + comboBonus;
}

export function calculateTotalAttributes(cards: Card[], activeCombos: CardCombo[]): CardAttributes {
  const total: CardAttributes = { political: 0, economic: 0, military: 0, cultural: 0 };

  // 基础属性
  for (const card of cards) {
    total.political += card.attributes.political;
    total.economic += card.attributes.economic;
    total.military += card.attributes.military;
    total.cultural += card.attributes.cultural;
  }

  // 组合加成
  for (const combo of activeCombos) {
    total.political += combo.bonusAttributes.political || 0;
    total.economic += combo.bonusAttributes.economic || 0;
    total.military += combo.bonusAttributes.military || 0;
    total.cultural += combo.bonusAttributes.cultural || 0;
  }

  return total;
}

// ===== 掷骰子决定指标 =====
const ATTRIBUTES: Attribute[] = ['political', 'economic', 'military', 'cultural'];

export function rollDice(): Attribute {
  return ATTRIBUTES[Math.floor(Math.random() * ATTRIBUTES.length)];
}

// 双指标模式（高级关卡）
export function rollDoubleDice(): [Attribute, Attribute] {
  const first = rollDice();
  let second = rollDice();
  while (second === first) {
    second = rollDice();
  }
  return [first, second];
}

// ===== AI 对手逻辑 =====
export class AIOpponent {
  difficulty: string;

  constructor(difficulty: string = 'normal') {
    this.difficulty = difficulty;
  }

  // AI选择打出的卡牌
  selectCards(hand: Card[], targetAttribute: Attribute): { cards: Card[]; combos: CardCombo[] } {
    switch (this.difficulty) {
      case 'easy':
        return this.selectRandom(hand, targetAttribute);
      case 'normal':
        return this.selectBasic(hand, targetAttribute);
      case 'hard':
        return this.selectSmart(hand, targetAttribute);
      case 'expert':
        return this.selectExpert(hand, targetAttribute);
      default:
        return this.selectBasic(hand, targetAttribute);
    }
  }

  // 随机出牌（简单）
  private selectRandom(hand: Card[], _targetAttribute: Attribute): { cards: Card[]; combos: CardCombo[] } {
    void _targetAttribute;
    const cardCount = Math.min(Math.floor(Math.random() * 2) + 1, hand.length);
    const shuffled = [...hand].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, cardCount);
    const combo = findMatchingCombo(selected.map(c => c.id));
    return { cards: selected, combos: combo ? [combo] : [] };
  }

  // 基础AI：选择单张最高分的牌
  private selectBasic(hand: Card[], targetAttribute: Attribute): { cards: Card[]; combos: CardCombo[] } {
    // 找单张最高分
    let bestCard = hand[0];
    let bestScore = -Infinity;

    for (const card of hand) {
      const score = card.attributes[targetAttribute];
      if (score > bestScore) {
        bestScore = score;
        bestCard = card;
      }
    }

    // 30%概率尝试凑两张组合
    if (Math.random() < 0.3 && hand.length >= 2) {
      let bestPair: Card[] = [bestCard];
      let bestPairScore = bestScore;

      for (let i = 0; i < hand.length; i++) {
        for (let j = i + 1; j < hand.length; j++) {
          const combo = findMatchingCombo([hand[i].id, hand[j].id]);
          const pairScore = hand[i].attributes[targetAttribute] + hand[j].attributes[targetAttribute] + 
            (combo ? (combo.bonusAttributes[targetAttribute] || 0) : 0);
          if (pairScore > bestPairScore) {
            bestPairScore = pairScore;
            bestPair = [hand[i], hand[j]];
          }
        }
      }

      if (bestPair.length === 2) {
        const combo = findMatchingCombo(bestPair.map(c => c.id));
        return { cards: bestPair, combos: combo ? [combo] : [] };
      }
    }

    return { cards: [bestCard], combos: [] };
  }

  // 聪明AI：主动凑组合
  private selectSmart(hand: Card[], targetAttribute: Attribute): { cards: Card[]; combos: CardCombo[] } {
    let bestCards: Card[] = [];
    let bestCombos: CardCombo[] = [];
    let bestScore = -Infinity;

    // 尝试所有可能的1-3张牌组合
    const maxCards = Math.min(3, hand.length);

    for (let count = 1; count <= maxCards; count++) {
      const combinations = this.getCombinations(hand, count);
      for (const combo of combinations) {
        const ids = combo.map(c => c.id);
        const matched = findMatchingCombo(ids);
        const combos = matched ? [matched] : [];
        const score = calculateScore(combo, combos, targetAttribute);

        if (score > bestScore) {
          bestScore = score;
          bestCards = combo;
          bestCombos = combos;
        }
      }
    }

    return { cards: bestCards, combos: bestCombos };
  }

  // 专家AI：考虑克制和长期策略
  private selectExpert(hand: Card[], targetAttribute: Attribute): { cards: Card[]; combos: CardCombo[] } {
    // 基本和聪明AI相同，但更倾向于保留强力卡牌
    return this.selectSmart(hand, targetAttribute);
  }

  // 获取数组的所有n元素组合
  private getCombinations<T>(arr: T[], n: number): T[][] {
    if (n === 1) return arr.map(item => [item]);
    if (n > arr.length) return [];

    const result: T[][] = [];
    for (let i = 0; i <= arr.length - n; i++) {
      const first = arr[i];
      const rest = this.getCombinations(arr.slice(i + 1), n - 1);
      for (const combo of rest) {
        result.push([first, ...combo]);
      }
    }
    return result;
  }
}

// ===== 关卡配置 =====
export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    id: 1,
    name: '初出茅庐',
    description: '标准模式，熟悉四维指标',
    era: '全时代',
    difficulty: 'easy',
    aiBehavior: 'random',
    unlocked: true,
  },
  {
    id: 2,
    name: '秦扫六合',
    description: '秦朝牌库，军事指标权重增加',
    era: '秦',
    difficulty: 'easy',
    aiBehavior: 'basic',
    unlocked: false,
    requiredPrevLevel: 1,
  },
  {
    id: 3,
    name: '楚汉争霸',
    description: '汉初牌库，势力标签加成',
    era: '汉',
    difficulty: 'normal',
    aiBehavior: 'basic',
    unlocked: false,
    requiredPrevLevel: 2,
  },
  {
    id: 4,
    name: '三国鼎立',
    description: '三国时期，事件卡可克制对手',
    era: '三国',
    difficulty: 'normal',
    aiBehavior: 'smart',
    unlocked: false,
    requiredPrevLevel: 3,
  },
  {
    id: 5,
    name: '贞观之治',
    description: '盛唐牌库，诗人标签文化翻倍',
    era: '唐',
    difficulty: 'hard',
    aiBehavior: 'smart',
    unlocked: false,
    requiredPrevLevel: 4,
  },
  {
    id: 6,
    name: '安史之乱',
    description: '唐末牌库，负面事件卡增多',
    era: '唐',
    difficulty: 'hard',
    aiBehavior: 'expert',
    unlocked: false,
    requiredPrevLevel: 5,
  },
  {
    id: 7,
    name: '宋辽金元',
    description: '多政权混战，经济权重增加',
    era: '宋元',
    difficulty: 'hard',
    aiBehavior: 'expert',
    unlocked: false,
    requiredPrevLevel: 6,
  },
  {
    id: 8,
    name: '郑和下西洋',
    description: '明朝前期，航海卡改变指标',
    era: '明',
    difficulty: 'expert',
    aiBehavior: 'expert',
    unlocked: false,
    requiredPrevLevel: 7,
  },
  {
    id: 9,
    name: '明清变革',
    description: '朝代交替，对立标签受惩罚',
    era: '明清',
    difficulty: 'expert',
    aiBehavior: 'optimal',
    unlocked: false,
    requiredPrevLevel: 8,
  },
  {
    id: 10,
    name: '华夏五千年',
    description: '终极挑战，指标中途切换',
    era: '全时代',
    difficulty: 'hell',
    aiBehavior: 'optimal',
    unlocked: false,
    requiredPrevLevel: 9,
  },
];

// ===== 本地存储管理 =====
const SAVE_KEY = 'cultural_heritage_save';

export interface SaveData {
  unlockedLevels: number[];
  collection: string[]; // 已收集的卡牌ID
  winCount: number;
  loseCount: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    unlockedLevels: [1],
    collection: [],
    winCount: 0,
    loseCount: 0,
    soundEnabled: true,
    musicEnabled: true,
  };
}

export function saveSaveData(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function unlockLevel(levelId: number) {
  const data = loadSaveData();
  if (!data.unlockedLevels.includes(levelId)) {
    data.unlockedLevels.push(levelId);
    saveSaveData(data);
  }
}

export function addToCollection(cardIds: string[]) {
  const data = loadSaveData();
  for (const id of cardIds) {
    if (!data.collection.includes(id)) {
      data.collection.push(id);
    }
  }
  saveSaveData(data);
}
