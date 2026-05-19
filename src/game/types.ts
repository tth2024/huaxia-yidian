// ===== 游戏核心类型定义 =====

export type Attribute = 'political' | 'economic' | 'military' | 'cultural';

export interface CardAttributes {
  political: number;   // 政治
  economic: number;    // 经济
  military: number;    // 军事
  cultural: number;    // 文化
}

export type CardType = 'character' | 'item' | 'scenario' | 'event';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  era: string;
  tags: string[];
  attributes: CardAttributes;
  description: string;
  image?: string;
}

export interface CardCombo {
  id: string;
  name: string;
  cardIds: string[];
  bonusAttributes: Partial<CardAttributes>;
  description: string;
  era?: string;
}

export interface CounterRelation {
  counterComboId: string;
  targetComboId: string;
  effect: string;
}

export type GameScreen = 
  | 'menu' 
  | 'levelSelect' 
  | 'dealing' 
  | 'diceRoll' 
  | 'playerTurn' 
  | 'aiTurn' 
  | 'resolve' 
  | 'roundEnd' 
  | 'matchEnd'
  | 'settings'
  | 'collection';

export interface GameState {
  screen: GameScreen;
  playerHand: Card[];
  aiHand: Card[];
  playerPlayedCards: Card[];
  aiPlayedCards: Card[];
  playerActiveCombos: CardCombo[];
  aiActiveCombos: CardCombo[];
  currentRound: number;
  playerRoundWins: number;
  aiRoundWins: number;
  currentAttribute: Attribute | null;
  isRolling: boolean;
  canPlay: boolean;
  selectedCards: Card[];
  matchResult: 'win' | 'lose' | 'draw' | null;
  roundResult: 'win' | 'lose' | 'draw' | null;
  playerScore: number;
  aiScore: number;
  showComboHint: boolean;
  showAnecdote: boolean;
  currentAnecdote: string;
  unlockedLevels: number[];
  collection: Card[];
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  era: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'hell';
  specialRule?: string;
  poolRestriction?: string[];
  aiBehavior: 'random' | 'basic' | 'smart' | 'expert' | 'optimal';
  unlocked: boolean;
  requiredPrevLevel?: number;
}

export interface Anecdote {
  comboName: string;
  winText: string;
  loseText: string;
}

export const ATTRIBUTES: Attribute[] = ['political', 'economic', 'military', 'cultural'];

export const ATTRIBUTE_COLORS: Record<Attribute, string> = {
  political: '#4F46E5',
  economic: '#FFD700',
  military: '#DC143C',
  cultural: '#00BFFF',
};

export const ATTRIBUTE_NAMES: Record<Attribute, string> = {
  political: '政治',
  economic: '经济',
  military: '军事',
  cultural: '文化',
};

export const CARD_TYPE_NAMES: Record<CardType, string> = {
  character: '人物',
  item: '物品',
  scenario: '情景',
  event: '事件',
};

export const CARD_TYPE_COLORS: Record<CardType, string> = {
  character: '#D4AF37',
  item: '#CD853F',
  scenario: '#4682B4',
  event: '#8B4513',
};
