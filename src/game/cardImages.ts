// ===== 卡牌图片映射 =====
// 将卡牌ID映射到对应的图片路径

const CARD_IMAGE_MAP: Record<string, string> = {
  // 人物卡
  'CH001': '/assets/cards/character_ch001.png', // 秦始皇
  'CH004': '/assets/cards/character_ch004.png', // 刘邦
  'CH005': '/assets/cards/character_ch005.png', // 项羽
  'CH006': '/assets/cards/character_ch006.png', // 韩信
  'CH009': '/assets/cards/character_ch001.png', // 汉武帝（复用秦始皇图）
  'CH019': '/assets/cards/character_ch019.png', // 曹操
  'CH020': '/assets/cards/character_ch020.png', // 诸葛亮
  'CH021': '/assets/cards/character_ch021.png', // 周瑜
  'CH024': '/assets/cards/character_ch024.png', // 关羽
  'CH033': '/assets/cards/character_ch033.png', // 唐太宗
  'CH038': '/assets/cards/character_ch038.png', // 武则天
  'CH040': '/assets/cards/character_ch040.png', // 李白
  'CH051': '/assets/cards/character_ch051.png', // 苏轼
  'CH053': '/assets/cards/character_ch053.png', // 岳飞
  'CH061': '/assets/cards/character_ch061.png', // 朱元璋
  'CH063': '/assets/cards/character_ch063.png', // 郑和
  'CH074': '/assets/cards/character_ch074.png', // 康熙
  'CH080': '/assets/cards/character_ch080.png', // 孙中山
  // 物品卡
  'IT001': '/assets/cards/item_it001.png', // 和氏璧
  'IT005': '/assets/cards/item_it005.png', // 丝绸
  // 情景卡
  'SC001': '/assets/cards/scenario_sc001.png', // 丝绸之路
};

export function getCardImage(cardId: string): string | undefined {
  return CARD_IMAGE_MAP[cardId];
}

// 根据卡牌类型和时代获取备用颜色/渐变
export function getCardTypeGradient(type: string, era: string): string {
  const eraColors: Record<string, string> = {
    '秦': 'from-gray-800 to-gray-950',
    '汉': 'from-red-950 to-black',
    '楚': 'from-red-900 to-black',
    '东汉': 'from-red-900 to-black',
    '三国': 'from-green-950 to-black',
    '魏': 'from-blue-950 to-black',
    '蜀': 'from-green-950 to-black',
    '吴': 'from-red-950 to-black',
    '晋': 'from-purple-950 to-black',
    '北魏': 'from-yellow-950 to-black',
    '隋': 'from-indigo-950 to-black',
    '唐': 'from-pink-950 to-black',
    '宋': 'from-cyan-950 to-black',
    '元': 'from-sky-950 to-black',
    '明': 'from-orange-950 to-black',
    '清': 'from-yellow-950 to-black',
    '近代': 'from-red-950 to-black',
  };

  const typeColors: Record<string, string> = {
    'character': 'from-amber-950 to-black',
    'item': 'from-orange-950 to-black',
    'scenario': 'from-blue-950 to-black',
    'event': 'from-red-950 to-black',
  };

  return eraColors[era] || typeColors[type] || 'from-gray-900 to-black';
}

// 根据卡牌类型获取颜色标识
export function getCardTypeColor(type: string): string {
  switch (type) {
    case 'character': return '#D4AF37';
    case 'item': return '#CD853F';
    case 'scenario': return '#4682B4';
    case 'event': return '#DC143C';
    default: return '#888';
  }
}
