import type { CardCombo, CounterRelation, Anecdote } from './types';

// ===== 核心卡牌组合表（严格按用户设计文档，44个唯一组合）=====
export const CARD_COMBOS: CardCombo[] = [
  { id: 'CB001', name: '秦统一六国', cardIds: ['CH001','CH003','CH002'], bonusAttributes: { political: 5, economic: 2, military: 5, cultural: 1 }, description: '秦统一六国' },
  { id: 'CB002', name: '焚书坑儒', cardIds: ['CH001','CH002'], bonusAttributes: { political: 1, cultural: -3 }, description: '焚书坑儒' },
  { id: 'CB003', name: '楚汉争霸', cardIds: ['CH004','CH005','CH006'], bonusAttributes: { political: 3, economic: 1, military: 5, cultural: 1 }, description: '楚汉争霸' },
  { id: 'CB004', name: '汉朝开国', cardIds: ['CH004','CH006','CH007'], bonusAttributes: { political: 4, economic: 2, military: 4, cultural: 1 }, description: '汉朝开国' },
  { id: 'CB005', name: '汉武盛世', cardIds: ['CH009','CH010','CH011'], bonusAttributes: { political: 4, economic: 1, military: 5, cultural: 2 }, description: '汉武盛世' },
  { id: 'CB006', name: '封狼居胥', cardIds: ['CH011','SC019'], bonusAttributes: { military: 4 }, description: '封狼居胥' },
  { id: 'CB007', name: '丝绸之路', cardIds: ['CH012','IT005'], bonusAttributes: { political: 1, economic: 4, cultural: 1 }, description: '丝绸之路' },
  { id: 'CB008', name: '丝绸之路鼎盛', cardIds: ['CH009','CH012','CH016'], bonusAttributes: { political: 2, economic: 5, military: 1, cultural: 2 }, description: '丝绸之路鼎盛' },
  { id: 'CB009', name: '史家绝唱', cardIds: ['CH013','IT018'], bonusAttributes: { political: 2, cultural: 4 }, description: '史家绝唱' },
  { id: 'CB010', name: '昭君出塞', cardIds: ['CH014','IT038'], bonusAttributes: { political: 2, cultural: 2 }, description: '昭君出塞' },
  { id: 'CB011', name: '木牛流马', cardIds: ['CH020','IT012'], bonusAttributes: { economic: 2, military: 1, cultural: 2 }, description: '木牛流马' },
  { id: 'CB012', name: '书圣真迹', cardIds: ['CH028','IT003'], bonusAttributes: { cultural: 5 }, description: '书圣真迹' },
  { id: 'CB013', name: '北府兵', cardIds: ['CH030','SC008'], bonusAttributes: { military: 4 }, description: '北府兵' },
  { id: 'CB014', name: '大运河', cardIds: ['CH032','IT032'], bonusAttributes: { economic: 5, cultural: 1 }, description: '大运河' },
  { id: 'CB015', name: '科举制', cardIds: ['CH032','SC004'], bonusAttributes: { political: 4, cultural: 1 }, description: '科举制' },
  { id: 'CB016', name: '贞观之治', cardIds: ['CH033','CH034','CH035'], bonusAttributes: { political: 5, economic: 3, military: 3, cultural: 4 }, description: '贞观之治' },
  { id: 'CB017', name: '房谋杜断', cardIds: ['CH035','CH036'], bonusAttributes: { political: 3, economic: 1 }, description: '房谋杜断' },
  { id: 'CB018', name: '卫公兵法', cardIds: ['CH037','IT017'], bonusAttributes: { military: 3, cultural: 2 }, description: '卫公兵法' },
  { id: 'CB019', name: '殿试制度', cardIds: ['CH038','SC004'], bonusAttributes: { political: 3, cultural: 1 }, description: '殿试制度' },
  { id: 'CB020', name: '李杜之交', cardIds: ['CH040','CH041'], bonusAttributes: { cultural: 4 }, description: '李杜之交' },
  { id: 'CB021', name: '唐诗三杰', cardIds: ['CH040','CH041','CH042'], bonusAttributes: { cultural: 5 }, description: '唐诗三杰' },
  { id: 'CB022', name: '玄奘西行', cardIds: ['CH043','IT037'], bonusAttributes: { economic: 1, cultural: 4 }, description: '玄奘西行' },
  { id: 'CB023', name: '资治通鉴', cardIds: ['CH050','IT019'], bonusAttributes: { political: 2, cultural: 4 }, description: '资治通鉴' },
  { id: 'CB024', name: '元祐更化', cardIds: ['CH050','CH049'], bonusAttributes: {  }, description: '元祐更化' },
  { id: 'CB025', name: '十二道金牌', cardIds: ['CH055','CH053'], bonusAttributes: {  }, description: '十二道金牌' },
  { id: 'CB026', name: '活字印刷', cardIds: ['CH056','IT011'], bonusAttributes: { economic: 2, cultural: 5 }, description: '活字印刷' },
  { id: 'CB027', name: '永宣盛世', cardIds: ['CH062','CH063','CH064'], bonusAttributes: { political: 4, economic: 5, military: 3, cultural: 4 }, description: '永宣盛世' },
  { id: 'CB028', name: '迁都北京', cardIds: ['CH062','SC013'], bonusAttributes: { political: 3, economic: 1 }, description: '迁都北京' },
  { id: 'CB029', name: '郑和宝船', cardIds: ['CH063','IT013'], bonusAttributes: { economic: 4, cultural: 1 }, description: '郑和宝船' },
  { id: 'CB030', name: '明朝远航', cardIds: ['CH062','CH063','IT013'], bonusAttributes: { political: 2, economic: 5, military: 2, cultural: 2 }, description: '明朝远航' },
  { id: 'CB031', name: '一条鞭法', cardIds: ['CH067','SC027'], bonusAttributes: { political: 3, economic: 4 }, description: '一条鞭法' },
  { id: 'CB032', name: '平定三藩', cardIds: ['CH074','CH073'], bonusAttributes: { political: 2, military: 4 }, description: '平定三藩' },
  { id: 'CB033', name: '红楼梦', cardIds: ['CH076','IT022'], bonusAttributes: { cultural: 5 }, description: '红楼梦' },
  { id: 'CB043', name: '海上丝路', cardIds: ['IT007','SC022'], bonusAttributes: { economic: 4, cultural: 1 }, description: '海上丝路' },
  { id: 'CB045', name: '淝水岸', cardIds: ['CH029','CH030','SC008'], bonusAttributes: { military: 4, cultural: 1 }, description: '淝水岸' },
  { id: 'CB046', name: '长安城', cardIds: ['CH033','SC010'], bonusAttributes: { political: 2, economic: 2, military: 1, cultural: 3 }, description: '长安城' },
  { id: 'CB048', name: '边关长城', cardIds: ['CH001','SC017'], bonusAttributes: { military: 3, cultural: 1 }, description: '边关长城' },
  { id: 'CB050', name: '均田制', cardIds: ['CH031','SC024'], bonusAttributes: { political: 2, economic: 3 }, description: '均田制' },
  { id: 'CB051', name: '募兵制', cardIds: ['CH046','SC026'], bonusAttributes: { military: 2 }, description: '募兵制' },
  { id: 'CB053', name: '内阁', cardIds: ['CH062','SC030'], bonusAttributes: { political: 2, cultural: 1 }, description: '内阁' },
  { id: 'CB054', name: '藩镇', cardIds: ['CH044','SC031'], bonusAttributes: { political: -1, military: 2 }, description: '藩镇' },
  { id: 'CB056', name: '洋务运动', cardIds: ['CH078','CH079','SC035'], bonusAttributes: { political: 1, economic: 2, military: 2, cultural: 1 }, description: '洋务运动' },
  { id: 'CB057', name: '辛亥革命', cardIds: ['CH080','EV040'], bonusAttributes: { political: 4, economic: 1, military: 1, cultural: 2 }, description: '辛亥革命' },
  { id: 'CB062', name: '张骞通西域', cardIds: ['CH012','SC001'], bonusAttributes: { economic: 3, cultural: 2 }, description: '张骞通西域' },
];

// ===== 组合克制关系 =====
export const COUNTER_RELATIONS: CounterRelation[] = [
  { counterComboId: 'CB024', targetComboId: 'CB049', effect: '元祐更化废除王安石变法，变法牌全失效' },
  { counterComboId: 'CB025', targetComboId: 'CB006', effect: '十二道金牌召回岳飞，北伐军令作废' },
  { counterComboId: 'CB055', targetComboId: 'CB016', effect: '党争导致朝政混乱，贞观之治效果减半' },
];

// ===== 典故文案 =====
export const ANECDOTES: Record<string, Anecdote> = {
  'CB001': { comboName: '秦统一六国', winText: '十年征伐，六国逐一臣服。书同文，车同轨，秦王嬴政成为中国历史上第一位皇帝。', loseText: '六国虽弱，合纵连横之势难撼，统一大业功败垂成。' },
  'CB005': { comboName: '汉武盛世', winText: '卫青七战七捷，霍去病封狼居胥。匈奴远遁，漠南无王庭。', loseText: '匈奴骑兵来去如风，补给线过长，北伐大业未能完成。' },
  'CB016': { comboName: '贞观之治', winText: '君明臣贤，夜不闭户，路不拾遗。唐太宗与魏徵、房玄龄共创贞观盛世。', loseText: '虽有明君，缺少贤臣辅佐，盛世之梦未能实现。' },
};

// 检查一组卡牌是否构成某个组合（严格匹配：数量精确相等）
export function findMatchingCombo(cardIds: string[]): CardCombo | null {
  const sorted = [...cardIds].sort();
  for (const combo of CARD_COMBOS) {
    const comboSorted = [...combo.cardIds].sort();
    if (sorted.length !== comboSorted.length) continue;
    const hasAll = comboSorted.every(id => sorted.includes(id));
    if (hasAll) return combo;
  }
  return null;
}

// 查找包含指定卡牌的所有组合
export function findCombosWithCard(cardId: string): CardCombo[] {
  return CARD_COMBOS.filter(combo => combo.cardIds.includes(cardId));
}

// 情报提示库
export const INTELLIGENCE_HINTS: string[] = [
  '情报：尝试寻找同朝代的人物卡进行组合，可触发时代加成。',
  '情报：物品卡与相关人物卡组合可触发特殊典故加成。',
  '情报：两张以上卡牌组合时，注意查看是否有金色连线提示。',
  '情报：【将领】标签卡牌军事属性突出，适合军事指标的回合。',
  '情报：【改革家】标签卡牌政治和经济双高，是强力辅助。',
  '情报：负面属性卡牌单独打出会扣分，但与特定卡牌组合可能有奇效。',
  '情报：唐朝诗人卡组合可触发"唐诗"系列加成，文化指标极高。',
  '情报：四大发明物品卡齐聚可触发最强科技组合。',
  '情报：明朝中后期的组合注重军事防御，适合对抗侵略型AI。',
  '情报：统一类事件卡四维均衡，适合不确定指标时使用。',
];

// 获取可用的情报提示
export function getRandomHint(): string {
  return INTELLIGENCE_HINTS[Math.floor(Math.random() * INTELLIGENCE_HINTS.length)];
}

// 获取组合对目标组合的克制关系
export function findCounterRelation(targetComboId: string): CounterRelation | null {
  return COUNTER_RELATIONS.find(c => c.targetComboId === targetComboId) || null;
}