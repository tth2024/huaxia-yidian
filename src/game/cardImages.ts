// ===== 卡牌图片映射 =====
// 将卡牌ID映射到对应的图片路径
import { getAssetPath } from './assetPath';

const CARD_IMAGE_MAP: Record<string, string> = {
  // 人物卡
  'CH001': '/assets/cards/character_ch001.png', // 秦始皇
  'CH002': '/assets/cards/character_ch002.png', // 李斯
  'CH003': '/assets/cards/character_ch003.png', // 王翦
  'CH004': '/assets/cards/character_ch004.png', // 刘邦
  'CH005': '/assets/cards/character_ch005.png', // 项羽
  'CH006': '/assets/cards/character_ch006.png', // 韩信
  'CH009': '/assets/cards/character_ch009.png', // 汉武帝
  'CH010': '/assets/cards/character_ch010.png', // 卫青
  'CH011': '/assets/cards/character_ch011.png', // 霍去病
  'CH012': '/assets/cards/character_ch012.png', // 张骞
  'CH014': '/assets/cards/character_ch014.png', // 王昭君
  'CH015': '/assets/cards/character_ch015.png', // 刘秀
  'CH017': '/assets/cards/character_ch017.png', // 蔡伦
  'CH018': '/assets/cards/character_ch018.png', // 张衡
  'CH019': '/assets/cards/character_ch019.png', // 曹操
  'CH020': '/assets/cards/character_ch020.png', // 诸葛亮
  'CH021': '/assets/cards/character_ch021.png', // 周瑜
  'CH022': '/assets/cards/character_ch022.png', // 孙权
  'CH023': '/assets/cards/character_ch023.png', // 司马懿
  'CH024': '/assets/cards/character_ch024.png', // 关羽
  'CH025': '/assets/cards/character_ch025.png', // 华佗
  'CH027': '/assets/cards/character_ch027.png', // 曹植
  'CH028': '/assets/cards/character_ch028.png', // 王羲之
  'CH031': '/assets/cards/character_ch031.png', // 拓跋宏
  'CH033': '/assets/cards/character_ch033.png', // 唐太宗
  'CH034': '/assets/cards/character_ch034.png', // 魏徵
  'CH037': '/assets/cards/character_ch037.png', // 李靖
  'CH038': '/assets/cards/character_ch038.png', // 武则天
  'CH039': '/assets/cards/character_ch039.png', // 狄仁杰
  'CH040': '/assets/cards/character_ch040.png', // 李白
  'CH041': '/assets/cards/character_ch041.png', // 杜甫
  'CH042': '/assets/cards/character_ch042.png', // 白居易
  'CH043': '/assets/cards/character_ch043.png', // 玄奘
  'CH045': '/assets/cards/character_ch045.png', // 郭子仪
  'CH046': '/assets/cards/character_ch046.png', // 赵匡胤
  'CH047': '/assets/cards/character_ch047.png', // 包拯
  'CH049': '/assets/cards/character_ch049.png', // 王安石
  'CH051': '/assets/cards/character_ch051.png', // 苏轼
  'CH052': '/assets/cards/character_ch052.png', // 李清照
  'CH053': '/assets/cards/character_ch053.png', // 岳飞
  'CH058': '/assets/cards/character_ch058.png', // 成吉思汗
  'CH061': '/assets/cards/character_ch061.png', // 朱元璋
  'CH063': '/assets/cards/character_ch063.png', // 郑和
  'CH069': '/assets/cards/character_ch069.png', // 戚继光
  'CH074': '/assets/cards/character_ch074.png', // 康熙
  'CH080': '/assets/cards/character_ch080.png', // 孙中山
  'CH081': '/assets/cards/character_ch081.png', // 刘备
  // 第2批人物卡
  'CH007': '/assets/cards/character_ch007.png', // 张良
  'CH008': '/assets/cards/character_ch008.png', // 萧何
  'CH013': '/assets/cards/character_ch013.png', // 司马迁
  'CH016': '/assets/cards/character_ch016.png', // 班超
  'CH026': '/assets/cards/character_ch026.png', // 曹操
  'CH029': '/assets/cards/character_ch029.png', // 谢安
  'CH030': '/assets/cards/character_ch030.png', // 谢玄
  'CH032': '/assets/cards/character_ch032.png', // 隋炀帝
  'CH035': '/assets/cards/character_ch035.png', // 房玄龄
  'CH036': '/assets/cards/character_ch036.png', // 杜如晦
  'CH044': '/assets/cards/character_ch044.png', // 安禄山
  'CH048': '/assets/cards/character_ch048.png', // 范仲淹
  'CH050': '/assets/cards/character_ch050.png', // 司马光
  'CH054': '/assets/cards/character_ch054.png', // 韩世忠
  'CH055': '/assets/cards/character_ch055.png', // 秦桧
  'CH056': '/assets/cards/character_ch056.png', // 毕昇
  'CH057': '/assets/cards/character_ch057.png', // 沈括
  'CH059': '/assets/cards/character_ch059.png', // 忽必烈
  'CH060': '/assets/cards/character_ch060.png', // 关汉卿
  'CH062': '/assets/cards/character_ch062.png', // 朱棣
  'CH064': '/assets/cards/character_ch064.png', // 解缙
  'CH065': '/assets/cards/character_ch065.png', // 于谦
  'CH066': '/assets/cards/character_ch066.png', // 王阳明
  'CH067': '/assets/cards/character_ch067.png', // 张居正
  'CH068': '/assets/cards/character_ch068.png', // 海瑞
  'CH070': '/assets/cards/character_ch070.png', // 李时珍
  'CH071': '/assets/cards/character_ch071.png', // 魏忠贤
  'CH072': '/assets/cards/character_ch072.png', // 袁崇焕
  'CH073': '/assets/cards/character_ch073.png', // 吴三桂
  'CH075': '/assets/cards/character_ch075.png', // 乾隆
  'CH076': '/assets/cards/character_ch076.png', // 曹雪芹
  'CH077': '/assets/cards/character_ch077.png', // 林则徐
  'CH078': '/assets/cards/character_ch078.png', // 曾国藩
  'CH079': '/assets/cards/character_ch079.png', // 李鸿章
  'CH082': '/assets/cards/character_ch082.png', // 张飞
  'CH083': '/assets/cards/character_ch083.png', // 黄盖
  'CH084': '/assets/cards/character_ch084.png', // 王维
  'CH085': '/assets/cards/character_ch085.png', // 孟浩然
  'CH086': '/assets/cards/character_ch086.png', // 辛弃疾
  'CH087': '/assets/cards/character_ch087.png', // 欧阳修
  'CH088': '/assets/cards/character_ch088.png', // 徐达
  'CH089': '/assets/cards/character_ch089.png', // 王勃
  'CH090': '/assets/cards/character_ch090.png', // 苏洵
  'CH091': '/assets/cards/character_ch091.png', // 苏辙
  'CH092': '/assets/cards/character_ch092.png', // 唐玄宗
  'CH093': '/assets/cards/character_ch093.png', // 杨贵妃
  'CH094': '/assets/cards/character_ch094.png', // 王昭君
  'CH095': '/assets/cards/character_ch095.png', // 文成公主
  'CH096': '/assets/cards/character_ch096.png', // 李清照
  'CH097': '/assets/cards/character_ch097.png', // 陆游
  'CH098': '/assets/cards/character_ch098.png', // 唐伯虎
  'CH099': '/assets/cards/character_ch099.png', // 郑板桥
  // 物品卡
  'IT001': '/assets/cards/item_it001.png', // 和氏璧
  'IT002': '/assets/cards/item_it002.png', // 青铜鼎
  'IT003': '/assets/cards/item_it003.png', // 和氏璧
  'IT004': '/assets/cards/item_it004.png', // 兵马俑
  'IT005': '/assets/cards/item_it005.png', // 丝绸
  'IT006': '/assets/cards/item_it006.png', // 飞天壁画
  'IT007': '/assets/cards/item_it007.png', // 铜犀尊
  'IT008': '/assets/cards/item_it008.png', // 金缕玉衣
  'IT009': '/assets/cards/item_it009.png', // 木牛流马
  'IT010': '/assets/cards/item_it010.png', // 唐三彩骆驼
  'IT011': '/assets/cards/item_it011.png', // 敦煌壁画
  'IT012': '/assets/cards/item_it012.png', // 唐三彩马
  'IT013': '/assets/cards/item_it013.png', // 秘色瓷
  'IT014': '/assets/cards/item_it014.png', // 定窑白瓷
  'IT015': '/assets/cards/item_it015.png', // 青花瓷
  'IT016': '/assets/cards/item_it016.png', // 汝窑
  'IT017': '/assets/cards/item_it017.png', // 海兽葡萄镜
  'IT018': '/assets/cards/item_it018.png', // 越王勾践剑
  'IT019': '/assets/cards/item_it019.png', // 兵马俑军阵
  'IT020': '/assets/cards/item_it020.png', // 玉龙
  'IT021': '/assets/cards/item_it021.png', // 金缕玉衣局部
  'IT022': '/assets/cards/item_it022.png', // 金簪
  'IT023': '/assets/cards/item_it023.png', // 四羊方尊
  'IT024': '/assets/cards/item_it024.png', // 漆器云纹盒
  'IT025': '/assets/cards/item_it025.png', // 蛙纹铜鼓
  'IT026': '/assets/cards/item_it026.png', // 爵
  'IT027': '/assets/cards/item_it027.png', // 玉璧
  'IT028': '/assets/cards/item_it028.png', // 博山炉
  'IT029': '/assets/cards/item_it029.png', // 铜车马
  'IT030': '/assets/cards/item_it030.png', // 竹简
  'IT031': '/assets/cards/item_it031.png', // 帛画
  'IT032': '/assets/cards/item_it032.png', // 编钟
  'IT033': '/assets/cards/item_it033.png', // 古琴
  'IT034': '/assets/cards/item_it034.png', // 甲骨卜辞
  'IT035': '/assets/cards/item_it035.png', // 石鼓文
  'IT036': '/assets/cards/item_it036.png', // 大克鼎
  'IT037': '/assets/cards/item_it037.png', // 金杯
  'IT038': '/assets/cards/item_it038.png', // 银壶
  'IT039': '/assets/cards/item_it039.png', // 凤纹铜镜
  'IT040': '/assets/cards/item_it040.png', // 漆盘
  'IT041': '/assets/cards/item_it041.png', // 青铜剑
  'IT042': '/assets/cards/item_it042.png', // 玉琮
  'IT043': '/assets/cards/item_it043.png', // 提梁卣
  'IT044': '/assets/cards/item_it044.png', // 三彩骆驼
  'IT045': '/assets/cards/item_it045.png', // 彩绘陶俑
  'IT046': '/assets/cards/item_it046.png', // 玉龙佩
  'IT047': '/assets/cards/item_it047.png', // 铜尊
  // 情景卡
  'SC001': '/assets/cards/scenario_sc001.png', // 丝绸之路
  'SC002': '/assets/cards/scenario_sc002.png', // 茶马古道
  'SC003': '/assets/cards/scenario_sc003.png', // 海上丝路
  'SC004': '/assets/cards/scenario_sc004.png', // 科举考场
  'SC005': '/assets/cards/scenario_sc005.png', // 太学
  'SC006': '/assets/cards/scenario_sc006.png', // 白鹿洞书院
  'SC007': '/assets/cards/scenario_sc007.png', // 赤壁战场
  'SC008': '/assets/cards/scenario_sc008.png', // 淝水岸
  'SC009': '/assets/cards/scenario_sc009.png', // 官渡
  'SC010': '/assets/cards/scenario_sc010.png', // 长安城
  'SC011': '/assets/cards/scenario_sc011.png', // 洛阳城
  'SC012': '/assets/cards/scenario_sc012.png', // 大都城
  'SC013': '/assets/cards/scenario_sc013.png', // 紫禁城
  'SC014': '/assets/cards/scenario_sc014.png', // 大运河畔
  'SC015': '/assets/cards/scenario_sc015.png', // 天府平原
  'SC016': '/assets/cards/scenario_sc016.png', // 江南水乡
  'SC017': '/assets/cards/scenario_sc017.png', // 边关长城
  'SC018': '/assets/cards/scenario_sc018.png', // 玉门关
  'SC019': '/assets/cards/scenario_sc019.png', // 漠北草原
  'SC020': '/assets/cards/scenario_sc020.png', // 朝堂
  'SC021': '/assets/cards/scenario_sc021.png', // 朝堂
  'SC022': '/assets/cards/scenario_sc022.png', // 烽火台
  'SC023': '/assets/cards/scenario_sc023.png', // 黄河
  'SC024': '/assets/cards/scenario_sc024.png', // 长江三峡
  'SC025': '/assets/cards/scenario_sc025.png', // 泰山
  'SC026': '/assets/cards/scenario_sc026.png', // 华山
  'SC027': '/assets/cards/scenario_sc027.png', // 峨眉山
  'SC028': '/assets/cards/scenario_sc028.png', // 武当山
  'SC029': '/assets/cards/scenario_sc029.png', // 终南山
  'SC030': '/assets/cards/scenario_sc030.png', // 黄鹤楼
  'SC031': '/assets/cards/scenario_sc031.png', // 岳阳楼
  'SC032': '/assets/cards/scenario_sc032.png', // 滕王阁
  'SC033': '/assets/cards/scenario_sc033.png', // 西市
  'SC034': '/assets/cards/scenario_sc034.png', // 东市
  'SC035': '/assets/cards/scenario_sc035.png', // 鞠场
  'SC036': '/assets/cards/scenario_sc036.png', // 马球场
  'SC037': '/assets/cards/scenario_sc037.png', // 少林寺
  'SC038': '/assets/cards/scenario_sc038.png', // 莫高窟
  'SC039': '/assets/cards/scenario_sc039.png', // 龙门石窟
  'SC040': '/assets/cards/scenario_sc040.png', // 云冈石窟
  'SC041': '/assets/cards/scenario_sc041.png', // 白帝城
  'SC042': '/assets/cards/scenario_sc042.png', // 兰亭
  'SC043': '/assets/cards/scenario_sc043.png', // 马嵬坡
  'SC044': '/assets/cards/scenario_sc044.png', // 杜甫草堂
  'SC045': '/assets/cards/scenario_sc045.png', // 拙政园
  'SC046': '/assets/cards/scenario_sc046.png', // 恭王府
  'SC047': '/assets/cards/scenario_sc047.png', // 颐和园
  // 事件卡（EV001-EV021）
  'EV001': '/assets/cards/event_ev001.png', // 商鞅变法
  'EV002': '/assets/cards/event_ev002.png', // 秦始皇统一
  'EV003': '/assets/cards/event_ev003.png', // 焚书坑儒
  'EV004': '/assets/cards/event_ev004.png', // 楚汉相争
  'EV005': '/assets/cards/event_ev005.png', // 文景之治
  'EV006': '/assets/cards/event_ev006.png', // 汉武帝北伐
  'EV007': '/assets/cards/event_ev007_zhangqian.png', // 张骞通西域（补生成）
  'EV008': '/assets/cards/event_ev007.png', // 王莽改制
  'EV009': '/assets/cards/event_ev008.png', // 光武中兴
  'EV010': '/assets/cards/event_ev009.png', // 黄巾起义
  'EV011': '/assets/cards/event_ev010.png', // 官渡之战
  'EV012': '/assets/cards/event_ev011.png', // 赤壁之战
  'EV013': '/assets/cards/event_ev012.png', // 三国鼎立
  'EV014': '/assets/cards/event_ev013.png', // 八王之乱
  'EV015': '/assets/cards/event_ev014.png', // 淝水之战
  'EV016': '/assets/cards/event_ev015.png', // 孝文帝改革
  'EV017': '/assets/cards/event_ev016.png', // 隋朝统一
  'EV018': '/assets/cards/event_ev017.png', // 开凿大运河
  'EV019': '/assets/cards/event_ev018.png', // 创立科举
  'EV020': '/assets/cards/event_ev020.png', // 玄武门之变
  'EV021': '/assets/cards/event_ev021.png', // 贞观之治
  'EV022': '/assets/cards/event_ev022.png', // 开元盛世
  'EV023': '/assets/cards/event_ev023.png', // 安史之乱
  'EV024': '/assets/cards/event_ev024.png', // 黄巢起义
  'EV025': '/assets/cards/event_ev025.png', // 陈桥兵变
  'EV026': '/assets/cards/event_ev026.png', // 杯酒释兵权
  'EV027': '/assets/cards/event_ev027.png', // 澶渊之盟
  'EV028': '/assets/cards/event_ev028.png', // 王安石变法
  'EV029': '/assets/cards/event_ev029.png', // 靖康之耻
  'EV030': '/assets/cards/event_ev030.png', // 岳飞北伐
  'EV031': '/assets/cards/event_ev031.png', // 蒙古西征
  'EV032': '/assets/cards/event_ev032.png', // 元朝建立
  'EV033': '/assets/cards/event_ev033.png', // 红巾军起义
  'EV034': '/assets/cards/event_ev034.png', // 明朝建立
  'EV035': '/assets/cards/event_ev035.png', // 郑和下西洋
  'EV036': '/assets/cards/event_ev036.png', // 土木堡之变
  'EV037': '/assets/cards/event_ev037.png', // 北京保卫战
  'EV038': '/assets/cards/event_ev038.png', // 张居正改革
  'EV039': '/assets/cards/event_ev039.png', // 鸦片战争
  'EV040': '/assets/cards/event_ev040.png' // 辛亥革命
};

export function getCardImage(cardId: string): string | undefined {
  const path = CARD_IMAGE_MAP[cardId];
  return path ? getAssetPath(path) : undefined;
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
