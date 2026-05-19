import { useState, useEffect, useRef, useCallback } from 'react';
import type { Card, Attribute, CardCombo, LevelConfig } from './game/types';
import { ATTRIBUTES, ATTRIBUTE_NAMES, ATTRIBUTE_COLORS } from './game/types';
import { ALL_CARDS } from './game/cardData';
import { findMatchingCombo, getRandomHint, ANECDOTES, CARD_COMBOS } from './game/comboData';
import { DeckManager, AIOpponent, calculateScore, rollDice, LEVEL_CONFIGS, loadSaveData, unlockLevel, addToCollection } from './game/gameLogic';
import { getCardImage, getCardTypeColor } from './game/cardImages';
import { getAssetPath } from './game/assetPath';
import { AudioFX, BGM } from './game/audio';
import { getTagline } from './game/taglines';
import { getAnecdoteByComboName, getAnecdoteByCardName } from './game/anecdotesFull';
import { getCardDetailById } from './game/cardDetails';
import { Swords, Scroll, Settings, BookOpen, Trophy, ChevronRight, Volume2, VolumeX, HelpCircle, Sparkles, Shield, Coins, Crown, FlaskConical, X, Info, Layers, Shuffle } from 'lucide-react';
import './App.css';

type Screen = 'menu' | 'levelSelect' | 'game' | 'settings' | 'collection' | 'howToPlay';
type Phase = 'dice' | 'playerTurn' | 'aiTurn' | 'roundEnd' | 'matchEnd';

/* ===== Audio helper ===== */
function playIf(audio: { enabled: boolean }, fn: () => void) {
  if (audio.enabled) fn();
}

function saveAudio(data: { soundEnabled: boolean }) {
  const existing = loadSaveData();
  existing.soundEnabled = data.soundEnabled;
  localStorage.setItem('cultural_heritage_save', JSON.stringify(existing));
}

/* ===== Card Back Component ===== */
const CardBack = ({ width, height }: { width: string; height: string }) => (
  <div
    className="rounded-xl border-2 border-yellow-800/60 bg-gradient-to-br from-gray-900 via-amber-950/40 to-gray-950 flex flex-col items-center justify-center relative overflow-hidden"
    style={{ width, height }}
  >
    <div className="absolute inset-2 rounded-lg border border-yellow-900/40" />
    <div className="text-yellow-700/40 text-3xl font-bold" style={{ fontFamily: 'var(--font-title)' }}>弈</div>
    <div className="absolute bottom-2 text-yellow-900/30 text-[8px]" style={{ fontFamily: 'var(--font-body)' }}>华夏弈典</div>
  </div>
);

/* ===== Card Detail Modal ===== */
function CardDetailModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const img = getCardImage(card.id);
  const combos = CARD_COMBOS.filter(c => c.cardIds.includes(card.id));

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm"
      onClick={onClose}>
      <div className="max-w-sm mx-4 p-6 border-2 rounded-2xl shadow-2xl relative overflow-hidden"
        style={{ borderColor: getCardTypeColor(card.type) + '80', backgroundImage: `url(${getAssetPath('assets/backgrounds/card_texture.jpg')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 z-0" style={{ background: 'rgba(15,8,3,0.7)' }} />
        <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ color: getCardTypeColor(card.type), background: getCardTypeColor(card.type) + '20', fontFamily: 'var(--font-body)' }}>
              {card.type === 'character' ? '人物' : card.type === 'item' ? '物品' : card.type === 'scenario' ? '情景' : '事件'}
            </span>
            <span className="text-xs text-gray-400">{card.era}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-yellow-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Image / Character */}
        <div className="flex justify-center mb-4">
          {img ? (
            <img src={img} alt={card.name} className="h-36 object-contain rounded-lg" draggable={false} />
          ) : (
            <div className="h-36 w-24 rounded-lg flex items-center justify-center text-5xl font-bold"
              style={{ color: getCardTypeColor(card.type), fontFamily: 'var(--font-title)', background: 'rgba(0,0,0,0.4)' }}>
              {card.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-2xl font-bold text-yellow-400 text-center mb-1" style={{ fontFamily: 'var(--font-title)' }}>{card.name}</h3>
        <p className="text-gray-400 text-xs text-center mb-4" style={{ fontFamily: 'var(--font-body)' }}>{card.description}</p>

        {/* Full Attributes */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {ATTRIBUTES.map(attr => (
            <div key={attr} className="flex flex-col items-center p-2 rounded-lg" style={{ background: `${ATTRIBUTE_COLORS[attr]}15` }}>
              <span className="text-[10px] font-bold" style={{ color: ATTRIBUTE_COLORS[attr], fontFamily: 'var(--font-body)' }}>
                {ATTRIBUTE_NAMES[attr]}
              </span>
              <span className="text-lg font-bold" style={{ color: ATTRIBUTE_COLORS[attr], fontFamily: 'var(--font-title)' }}>
                {card.attributes[attr]}
              </span>
            </div>
          ))}
        </div>

        {/* Combo hints */}
        {combos.length > 0 && (
          <div className="border-t border-yellow-800/30 pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Layers size={14} className="text-yellow-500" />
              <span className="text-yellow-400 text-sm font-bold" style={{ fontFamily: 'var(--font-body)' }}>可参与组合</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {combos.map(combo => (
                <div key={combo.id} className="p-2 rounded-lg bg-yellow-900/20 border border-yellow-800/20">
                  <div className="text-yellow-300 text-xs font-bold" style={{ fontFamily: 'var(--font-body)' }}>{combo.name}</div>
                  <div className="text-gray-400 text-[10px] mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>{combo.description}</div>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {combo.cardIds.map(cid => {
                      const c = ALL_CARDS.find(x => x.id === cid);
                      return (
                        <span key={cid} className={`text-[9px] px-1.5 py-0.5 rounded ${c?.id === card.id ? 'bg-yellow-800/50 text-yellow-300' : 'bg-gray-800 text-gray-400'}`}
                          style={{ fontFamily: 'var(--font-body)' }}>
                          {c?.name || '?'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {combos.length === 0 && (
          <div className="border-t border-yellow-800/30 pt-3 text-center text-gray-500 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
            此卡牌暂无可参与的组合
          </div>
        )}

        <button onClick={onClose}
          className="w-full mt-4 py-2.5 bg-gradient-to-r from-yellow-800 to-yellow-700 border border-yellow-500/50 rounded-xl text-white font-bold hover:from-yellow-700 hover:to-yellow-600 transition-all text-sm"
          style={{ fontFamily: 'var(--font-body)' }}>
          关闭
        </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Main App ===== */
export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [saveData, setSaveData] = useState(loadSaveData);
  const [audioEnabled, setAudioEnabled] = useState(() => loadSaveData().soundEnabled);

  const audioObj = useRef({ enabled: audioEnabled });
  audioObj.current.enabled = audioEnabled;

  useEffect(() => { 
    import('./game/audio').then(m => m.preloadSounds()); 
  }, []);

  // BGM: play battle music during game, stop otherwise
  useEffect(() => {
    if (screen === 'game') {
      BGM.playBattle();
    } else {
      BGM.stop();
    }
    return () => { BGM.stop(); };
  }, [screen]);

  // Game state
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [playerPlayed, setPlayerPlayed] = useState<Card[]>([]);
  const [aiPlayed, setAiPlayed] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [currentAttribute, setCurrentAttribute] = useState<Attribute | null>(null);
  const [round, setRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);
  const [gamePhase, setGamePhase] = useState<Phase>('dice');
  const [isRolling, setIsRolling] = useState(false);
  const [matchResult, setMatchResult] = useState<'win' | 'lose' | null>(null);
  const [activeCombo, setActiveCombo] = useState<CardCombo | null>(null);
  const [aiActiveCombo, setAiActiveCombo] = useState<CardCombo | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [deckManager, setDeckManager] = useState<DeckManager | null>(null);
  const [aiOpponent, setAiOpponent] = useState<AIOpponent | null>(null);
  const [swapCount, setSwapCount] = useState(3);
  const [redrawCount, setRedrawCount] = useState(3);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSelected, setSwapSelected] = useState<Card | null>(null);
  const [showComboPreview, setShowComboPreview] = useState(false);
  const [pendingCombo, setPendingCombo] = useState<CardCombo | null>(null);
  const [detailCard, setDetailCard] = useState<Card | null>(null);
  const [anecdoteText, setAnecdoteText] = useState('');
  const [hintText, setHintText] = useState('');
  const [rewardCard, setRewardCard] = useState<Card | null>(null);
  const [showReward, setShowReward] = useState(false);
  // Combo highlight: map of cardId -> { comboName, colorIndex }
  const [comboHighlight, setComboHighlight] = useState<Record<string, { name: string; color: string; total: number; have: number }>>({});

  // Refs for effects to avoid stale closure
  const st = useRef({
    playerWins: 0, aiWins: 0, playerHandLen: 0, aiHandLen: 0,
    deckManager: null as DeckManager | null, currentLevel: null as LevelConfig | null,
    playerPlayed: [] as Card[],
  });
  st.current.playerWins = playerWins;
  st.current.aiWins = aiWins;
  st.current.playerHandLen = playerHand.length;
  st.current.aiHandLen = aiHand.length;
  st.current.deckManager = deckManager;
  st.current.currentLevel = currentLevel;
  st.current.playerPlayed = playerPlayed;

  const nextRoundRef = useRef(() => {});

  // Resolve ref to avoid stale closure
  const resolveRef = useRef({
    playerPlayed: [] as Card[],
    activeCombo: null as CardCombo | null,
  });

  // ===== START GAME (NOT wrapped in useCallback) =====
  const startGame = (level: LevelConfig) => {
    let pool = ALL_CARDS;
    if (level.era === '秦') pool = ALL_CARDS.filter(c => c.era === '秦' || c.era === '春秋' || c.era === '周');
    else if (level.era === '汉') pool = ALL_CARDS.filter(c => c.era === '汉' || c.era === '楚' || c.era === '东汉');
    else if (level.era === '三国') pool = ALL_CARDS.filter(c => c.era === '三国' || c.tags.some(t => ['魏','蜀','吴'].includes(t)));
    else if (level.era === '唐') pool = ALL_CARDS.filter(c => c.era === '唐' || c.era === '隋');
    else if (level.era === '宋元') pool = ALL_CARDS.filter(c => c.era === '宋' || c.era === '元');
    else if (level.era === '明') pool = ALL_CARDS.filter(c => c.era === '明');
    else if (level.era === '明清') pool = ALL_CARDS.filter(c => c.era === '明' || c.era === '清');
    // 标准模式(level.era === '全时代')用全部200张

    const dm = new DeckManager(pool);
    const ai = new AIOpponent(level.aiBehavior);
    setDeckManager(dm);
    setAiOpponent(ai);
    setCurrentLevel(level);

    const pHand = dm.draw(7);
    const aHand = dm.draw(7);
    setPlayerHand(pHand);
    setAiHand(aHand);
    setPlayerPlayed([]);
    setAiPlayed([]);
    setSelectedCards([]);
    setCurrentAttribute(null);
    setRound(1);
    setPlayerWins(0);
    setAiWins(0);
    setActiveCombo(null);
    setAiActiveCombo(null);
    setMatchResult(null);
    setPlayerScore(0);
    setAiScore(0);
    resolveRef.current = { playerPlayed: [], activeCombo: null };
    setGamePhase('dice');
    setSwapCount(3);
    setRedrawCount(3);
    setIsSwapping(false);
    setSwapSelected(null);
    setScreen('game');
    playIf(audioObj.current, () => AudioFX.deal());
  };

  // ===== NEXT ROUND =====
  const nextRound = useCallback(() => {
    const s = st.current;

    if (s.playerWins >= 2 || s.aiWins >= 2) {
      const result = s.playerWins >= 2 ? 'win' : 'lose';
      setMatchResult(result);
      if (result === 'win') {
        playIf(audioObj.current, () => AudioFX.victory());
        if (s.currentLevel) {
          unlockLevel(s.currentLevel.id + 1);
          // 注意：每轮胜利已在roundEnd中奖励解锁一张新卡
          // 此处不再重复解锁，避免计数翻倍
        }
      }
      setGamePhase('matchEnd');
      return;
    }

    if (s.deckManager) {
      const newCards = s.deckManager.draw(3);
      setPlayerHand(prev => [...prev, ...newCards]);
      const aiNewCards = s.deckManager.draw(3);
      setAiHand(prev => [...prev, ...aiNewCards]);
    }

    setRound(r => r + 1);
    setSelectedCards([]);
    setPlayerPlayed([]);
    setAiPlayed([]);
    setActiveCombo(null);
    setAiActiveCombo(null);
    setCurrentAttribute(null);
    setSwapCount(3);
    setRedrawCount(3);
    setIsSwapping(false);
    setSwapSelected(null);
    setGamePhase('dice');
    playIf(audioObj.current, () => AudioFX.deal());
  }, []);

  // Keep ref in sync
  useEffect(() => { nextRoundRef.current = nextRound; }, [nextRound]);

  // ===== DICE ROLL =====
  const handleRollDice = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    playIf(audioObj.current, () => AudioFX.dice());
    let rolls = 0;
    const interval = setInterval(() => {
      setCurrentAttribute(ATTRIBUTES[Math.floor(Math.random() * 4)]);
      rolls++;
      if (rolls >= 18) {
        clearInterval(interval);
        const finalAttr = rollDice();
        setCurrentAttribute(finalAttr);
        setIsRolling(false);
        setGamePhase('playerTurn');
      }
    }, 70);
  }, [isRolling]);

  // ===== COMBO HIGHLIGHT COLORS =====
  const COMBO_HIGHLIGHT_COLORS = [
    '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
  ];

  // Compute combo highlight map for a given selected card
  // Shows progress like "贞观之治 (2/3)" when you have 2 of 3 needed cards
  const computeComboHighlight = (selectedCard: Card, hand: Card[]) => {
    const highlight: Record<string, { name: string; color: string; total: number; have: number }> = {};
    const combos = CARD_COMBOS.filter(cb => cb.cardIds.includes(selectedCard.id));
    combos.forEach((combo, idx) => {
      const color = COMBO_HIGHLIGHT_COLORS[idx % COMBO_HIGHLIGHT_COLORS.length];
      const total = combo.cardIds.length;
      // Count how many combo cards are in hand (including selected)
      const have = combo.cardIds.filter(cid => hand.find(c => c.id === cid)).length;
      combo.cardIds.forEach(cid => {
        if (cid !== selectedCard.id) {
          const targetCard = hand.find(c => c.id === cid);
          if (targetCard) {
            highlight[targetCard.id] = { name: combo.name, color, total, have };
          }
        }
      });
    });
    return highlight;
  };

  // ===== CARD SELECTION =====
  const toggleCardSelection = (card: Card) => {
    if (gamePhase !== 'playerTurn') return;
    playIf(audioObj.current, () => AudioFX.click());
    setSelectedCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) {
        const filtered = prev.filter(c => c.id !== card.id);
        const ids = filtered.map(c => c.id);
        const combo = findMatchingCombo(ids);
        setPendingCombo(combo);
        setShowComboPreview(!!combo && filtered.length >= 2);
        // Update highlight based on remaining selection
        if (filtered.length > 0) {
          setComboHighlight(computeComboHighlight(filtered[filtered.length - 1], playerHand));
        } else {
          setComboHighlight({});
        }
        return filtered;
      }
      if (prev.length >= 4) return prev;
      const newSelection = [...prev, card];
      const ids = newSelection.map(c => c.id);
      const combo = findMatchingCombo(ids);
      setPendingCombo(combo);
      setShowComboPreview(!!combo && newSelection.length >= 2);
      // Update highlight for newly selected card
      setComboHighlight(computeComboHighlight(card, playerHand));
      return newSelection;
    });
  };

  // ===== CONFIRM PLAY =====
  const confirmPlay = () => {
    if (selectedCards.length === 0 || gamePhase !== 'playerTurn') return;
    playIf(audioObj.current, () => AudioFX.play());
    if (pendingCombo) playIf(audioObj.current, () => AudioFX.combo());

    const ids = selectedCards.map(c => c.id);
    const combo = findMatchingCombo(ids);
    const played = [...selectedCards];
    setActiveCombo(combo || null);
    setPlayerPlayed(played);
    // Sync ref to avoid stale closure in aiTurn effect
    resolveRef.current.playerPlayed = played;
    resolveRef.current.activeCombo = combo || null;
    setPlayerHand(prev => prev.filter(c => !selectedCards.find(s => s.id === c.id)));
    setGamePhase('aiTurn');
    setShowComboPreview(false);
  };

  // ===== AI TURN + RESOLVE (combined, uses resolveRef for fresh player data) =====
  useEffect(() => {
    if (gamePhase === 'aiTurn' && aiOpponent && currentAttribute) {
      const timer = setTimeout(() => {
        // AI selects and plays
        const result = aiOpponent.selectCards(aiHand, currentAttribute);
        const aiCards = result.cards;
        const aiCombo = result.combos[0] || null;
        setAiPlayed(aiCards);
        setAiActiveCombo(aiCombo);
        setAiHand(prev => prev.filter(c => !aiCards.find((r: Card) => r.id === c.id)));

        // Resolve immediately using resolveRef for guaranteed-fresh player data
        const { playerPlayed: pCards, activeCombo: pCombo } = resolveRef.current;
        const pCombos = pCombo ? [pCombo] : [];
        const aCombos = aiCombo ? [aiCombo] : [];
        const pScore = calculateScore(pCards, pCombos, currentAttribute);
        const aScore = calculateScore(aiCards, aCombos, currentAttribute);
        setPlayerScore(pScore);
        setAiScore(aScore);

        if (pScore > aScore) {
          setPlayerWins(w => w + 1);
          playIf(audioObj.current, () => AudioFX.win());
          if (pCombo && ANECDOTES[pCombo.id]) {
            setAnecdoteText(ANECDOTES[pCombo.id].winText);
          } else {
            setAnecdoteText(`你以 ${pScore} 比 ${aScore} 赢得了第 ${round} 回合！`);
          }
        } else {
          setAiWins(w => w + 1);
          playIf(audioObj.current, () => AudioFX.lose());
          if (pCombo && ANECDOTES[pCombo.id]) {
            setAnecdoteText(ANECDOTES[pCombo.id].loseText);
          } else {
            setAnecdoteText(`${pScore} 比 ${aScore}，你未能在「${ATTRIBUTE_NAMES[currentAttribute]}」指标上战胜对手。`);
          }
          setHintText(getRandomHint());
        }
        // Check for victory reward on round win
        if (pScore > aScore) {
          const save = loadSaveData();
          const unlockedIds = new Set(save.collection);
          const uncollected = ALL_CARDS.filter(c => !unlockedIds.has(c.id));
          if (uncollected.length > 0) {
            const pick = uncollected[Math.floor(Math.random() * uncollected.length)];
            addToCollection([pick.id]);
            setSaveData(loadSaveData());
            setRewardCard(pick);
            setShowReward(true);
          }
        }
        setGamePhase('roundEnd');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, aiOpponent, aiHand, currentAttribute, round]);

  // ===== STEAL CARD =====
  const stealCard = () => {
    const aHand = st.current.aiHandLen;
    if (aHand > 0) {
      setAiHand(prev => {
        if (prev.length === 0) return prev;
        const stolen = prev[Math.floor(Math.random() * prev.length)];
        setPlayerHand(p => [...p, stolen]);
        playIf(audioObj.current, () => AudioFX.click());
        return prev.filter(c => c.id !== stolen.id);
      });
    }
    setTimeout(() => nextRoundRef.current(), 300);
  };

  // ===== SWAP CARD =====
  const executeSwap = () => {
    if (!swapSelected || swapCount <= 0 || !st.current.deckManager) return;
    const newCard = st.current.deckManager.draw(1)[0];
    if (!newCard) return;
    playIf(audioObj.current, () => AudioFX.deal());
    setPlayerHand(prev => {
      const filtered = prev.filter(c => c.id !== swapSelected.id);
      return [...filtered, newCard];
    });
    setSwapCount(prev => prev - 1);
    setSwapSelected(null);
    setIsSwapping(false);
  };

  const cancelSwap = () => {
    setIsSwapping(false);
    setSwapSelected(null);
  };

  // ===== REDRAW - discard current hand, draw equal number of new cards =====
  const executeRedraw = () => {
    if (redrawCount <= 0 || !st.current.deckManager) return;
    playIf(audioObj.current, () => AudioFX.deal());
    const count = playerHand.length;
    const newCards = st.current.deckManager.draw(count);
    setPlayerHand(newCards);
    setSelectedCards([]);
    setSwapSelected(null);
    setIsSwapping(false);
    setShowComboPreview(false);
    setPendingCombo(null);
    setComboHighlight({});
    setRedrawCount(prev => prev - 1);
  };
  const getAttrIcon = (attr: Attribute) => {
    switch (attr) {
      case 'political': return <Crown size={22} />;
      case 'economic': return <Coins size={22} />;
      case 'military': return <Swords size={22} />;
      case 'cultural': return <FlaskConical size={22} />;
    }
  };

  // ===== RENDER SCREENS =====

  /* ---- MENU ---- */
  if (screen === 'menu') {
    return (
      <div className="relative w-full h-screen overflow-hidden select-none">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getAssetPath('assets/backgrounds/menu_bg.jpg')})` }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute animate-float" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 4}s` }}>
              <div className="w-1 h-1 rounded-full bg-yellow-500/30" />
            </div>
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 tracking-widest"
            style={{ fontFamily: 'var(--font-title)', textShadow: '0 0 60px rgba(212,175,55,0.4)' }}>
            华夏弈典
          </h1>
          <p className="text-lg md:text-2xl text-yellow-200/70 mb-16 tracking-[0.3em]" style={{ fontFamily: 'var(--font-body)' }}>文化遗产卡牌对战</p>
          <div className="flex flex-col gap-4 w-80">
            {[
              { icon: <Swords size={24} />, label: '开始对弈', action: () => setScreen('levelSelect'), primary: true },
              { icon: <BookOpen size={20} />, label: '卡牌图鉴', action: () => setScreen('collection'), primary: false },
              { icon: <HelpCircle size={20} />, label: '玩法说明', action: () => setScreen('howToPlay'), primary: false },
            ].map((btn, i) => (
              <button key={i} onClick={() => { playIf(audioObj.current, () => AudioFX.click()); btn.action(); }}
                className={`group flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 ${
                  btn.primary
                    ? 'bg-gradient-to-r from-red-900/80 to-red-800/80 border-2 border-yellow-600/60 text-yellow-100 hover:from-red-800 hover:to-red-700 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-900/30'
                    : 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-gray-600/40 text-gray-300 hover:from-gray-700 hover:to-gray-600 hover:border-yellow-600/40'
                }`} style={{ fontFamily: 'var(--font-body)' }}>
                {btn.icon} <span>{btn.label}</span>
              </button>
            ))}
            <div className="flex gap-3">
              <button onClick={() => { playIf(audioObj.current, () => AudioFX.click()); setScreen('settings'); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-gray-600/40 rounded-xl text-gray-300 hover:from-gray-700 hover:to-gray-600 transition-all hover:scale-105" style={{ fontFamily: 'var(--font-body)' }}>
                <Settings size={18} /> <span>设置</span>
              </button>
              <button onClick={() => { const d = loadSaveData(); d.soundEnabled = !d.soundEnabled; saveAudio(d); setAudioEnabled(d.soundEnabled); }}
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-gray-600/40 rounded-xl text-gray-300 hover:from-gray-700 hover:to-gray-600 transition-all hover:scale-105">
                {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- LEVEL SELECT ---- */
  if (screen === 'levelSelect') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black select-none">
        <div className="relative z-10 flex flex-col h-full p-5">
          <div className="flex items-center gap-4 mb-5">
            <button onClick={() => setScreen('menu')} className="text-yellow-500 hover:text-yellow-300 transition-colors p-2">
              <ChevronRight size={32} className="rotate-180" />
            </button>
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-400" style={{ fontFamily: 'var(--font-title)' }}>选择战役</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 overflow-y-auto flex-1 pb-4">
            {LEVEL_CONFIGS.map(level => {
              const isUnlocked = saveData.unlockedLevels.includes(level.id);
              return (
                <button key={level.id}
                  onClick={() => { if (isUnlocked) { playIf(audioObj.current, () => AudioFX.click()); startGame(level); } }}
                  disabled={!isUnlocked}
                  className={`relative flex flex-col items-center p-5 rounded-xl border-2 transition-all ${
                    isUnlocked
                      ? 'border-yellow-700/50 bg-gradient-to-b from-gray-800/90 to-gray-900/90 hover:border-yellow-400 hover:scale-105 hover:shadow-lg hover:shadow-yellow-900/30 cursor-pointer'
                      : 'border-gray-700/30 bg-gray-900/40 opacity-50 cursor-not-allowed'
                  }`}>
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                  )}
                  <div className={`text-5xl mb-2 font-bold ${isUnlocked ? 'text-yellow-500' : 'text-gray-600'}`} style={{ fontFamily: 'var(--font-title)' }}>{level.id}</div>
                  <div className={`text-base font-bold mb-1 ${isUnlocked ? 'text-yellow-200' : 'text-gray-500'}`} style={{ fontFamily: 'var(--font-body)' }}>{level.name}</div>
                  <div className="text-xs text-gray-500">{level.era}</div>
                  <div className={`text-xs mt-2 px-2.5 py-1 rounded-full ${
                    level.difficulty === 'easy' ? 'bg-green-900/60 text-green-400' :
                    level.difficulty === 'normal' ? 'bg-blue-900/60 text-blue-400' :
                    level.difficulty === 'hard' ? 'bg-orange-900/60 text-orange-400' :
                    'bg-red-900/60 text-red-400'
                  }`} style={{ fontFamily: 'var(--font-body)' }}>
                    {level.difficulty === 'easy' ? '简单' : level.difficulty === 'normal' ? '普通' : level.difficulty === 'hard' ? '困难' : '专家'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---- HOW TO PLAY ---- */
  if (screen === 'howToPlay') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black select-none">
        <div className="relative z-10 flex flex-col h-full p-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setScreen('menu')} className="text-yellow-500 hover:text-yellow-300 transition-colors p-2"><ChevronRight size={32} className="rotate-180" /></button>
            <h2 className="text-3xl font-bold text-yellow-400" style={{ fontFamily: 'var(--font-title)' }}>玩法说明</h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {[
              { icon: <Swords size={20} />, title: '游戏目标', text: '三局两胜制卡牌对战。每回合通过掷骰子确定比拼指标（政治/经济/军事/文化），打出卡牌组合获得更高分数即可获胜。' },
              { icon: <Sparkles size={20} />, title: '四维指标', text: '每张卡牌拥有四个维度的数值。政治（紫）、经济（金）、军事（红）、文化（青）。根据掷骰结果比拼对应指标总和。' },
              { icon: <Scroll size={20} />, title: '卡牌组合', text: '选中多张卡牌可形成历史典故组合（如「秦始皇+李斯+王翦」→「秦统一六国」），获得额外加成。选中卡牌时会有金色连线提示。' },
              { icon: <Info size={20} />, title: '卡牌详情', text: '右键点击或点击卡牌右上角 i 图标可查看卡牌详情，包括完整四维属性、可参与的组合提示。' },
              { icon: <Trophy size={20} />, title: '胜负奖励', text: '胜利后可观看历史典故并从对手手中获得一张卡牌。失败则获得一条情报提示。' },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-gray-800/50 rounded-xl border border-yellow-800/20">
                <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-body)' }}>{item.icon} {item.title}</h3>
                <p className="text-gray-300 leading-relaxed text-sm" style={{ fontFamily: 'var(--font-body)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---- SETTINGS ---- */
  if (screen === 'settings') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black select-none">
        <div className="relative z-10 flex flex-col h-full p-5 max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setScreen('menu')} className="text-yellow-500 hover:text-yellow-300 transition-colors p-2"><ChevronRight size={32} className="rotate-180" /></button>
            <h2 className="text-3xl font-bold text-yellow-400" style={{ fontFamily: 'var(--font-title)' }}>游戏设置</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-5 bg-gray-800/60 rounded-xl border border-gray-700/40">
              <div className="flex items-center gap-3 text-yellow-200">
                {saveData.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                <span style={{ fontFamily: 'var(--font-body)' }}>音效</span>
              </div>
              <button onClick={() => { const d = loadSaveData(); d.soundEnabled = !d.soundEnabled; saveAudio(d); setAudioEnabled(d.soundEnabled); setSaveData(d); }}
                className={`w-14 h-7 rounded-full transition-all ${saveData.soundEnabled ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-all ${saveData.soundEnabled ? 'ml-8' : 'ml-1'}`} />
              </button>
            </div>
            <button onClick={() => { if (confirm('确定要重置所有进度吗？')) { localStorage.removeItem('cultural_heritage_save'); setSaveData(loadSaveData()); } }}
              className="p-5 bg-red-900/30 border border-red-700/40 rounded-xl text-red-400 hover:bg-red-800/50 transition-colors mt-4 text-center" style={{ fontFamily: 'var(--font-body)' }}>
              重置全部进度
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- COLLECTION ---- */
  if (screen === 'collection') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black select-none">
        <div className="relative z-10 flex flex-col h-full p-5">
          <div className="flex items-center gap-4 mb-5">
            <button onClick={() => setScreen('menu')} className="text-yellow-500 hover:text-yellow-300 transition-colors p-2"><ChevronRight size={32} className="rotate-180" /></button>
            <h2 className="text-3xl font-bold text-yellow-400" style={{ fontFamily: 'var(--font-title)' }}>卡牌图鉴</h2>
            <span className="text-gray-500 ml-4 text-sm" style={{ fontFamily: 'var(--font-body)' }}>已收集 {saveData.collection.length} / {ALL_CARDS.length}</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2.5 overflow-y-auto flex-1 pb-4">
            {ALL_CARDS.map(card => {
              const isCollected = saveData.collection.includes(card.id);
              const img = getCardImage(card.id);
              return (
                <div key={card.id}
                  className={`relative aspect-[2/3] rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                    isCollected ? 'border-yellow-600/60 hover:border-yellow-400 hover:scale-105' : 'border-gray-700/30'
                  }`}
                  onClick={() => isCollected && setDetailCard(card)}>
                  {isCollected ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 relative"
                      style={{ backgroundImage: `url(${getAssetPath('assets/backgrounds/card_texture.jpg')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <div className="absolute inset-0" style={{ background: 'rgba(20,10,5,0.55)' }} />
                      <div className="relative z-10 flex flex-col items-center w-full">
                        {img ? (
                          <img src={img} alt={card.name} className="w-full h-12 object-contain rounded mb-1" />
                        ) : (
                          <div className="w-full h-12 rounded flex items-center justify-center text-xl font-bold" style={{ color: getCardTypeColor(card.type), fontFamily: 'var(--font-title)' }}>{card.name.charAt(0)}</div>
                        )}
                        <div className="text-[9px] font-bold text-center" style={{ fontFamily: 'var(--font-body)', color: '#fde68a', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{card.name}</div>
                        <div className="text-[7px] font-bold px-1 rounded mt-0.5" style={{ color: '#fbbf24', background: 'rgba(120,50,0,0.45)', border: '1px solid rgba(251,191,36,0.3)' }}>{card.era}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-900/60 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {detailCard && <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />}
        </div>
      </div>
    );
  }

  // ===== GAME BOARD =====
  return (
    <div className="relative w-full h-screen overflow-hidden select-none">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getAssetPath('assets/backgrounds/battle_bg.jpg')})` }} />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Detail Modal */}
      {detailCard && <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />}

      {/* ===== VICTORY REWARD CARD (per round) ===== */}
      {showReward && rewardCard && gamePhase === 'roundEnd' && (
        <div className="absolute inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative flex flex-col items-center">
            {/* 旋转闪光背景 */}
            <div className="absolute w-[300px] h-[300px] animate-spin-slow opacity-30"
              style={{ background: 'conic-gradient(from 0deg, transparent, rgba(212,175,55,0.6), transparent, rgba(212,175,55,0.3), transparent)', borderRadius: '50%', top: '-45px' }} />
            <div className="absolute w-[260px] h-[260px] animate-spin-reverse opacity-20"
              style={{ background: 'conic-gradient(from 180deg, transparent, rgba(251,191,36,0.5), transparent)', borderRadius: '50%', top: '-25px' }} />
            {/* 卡牌容器 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-yellow-400 text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-title)', textShadow: '0 0 15px rgba(212,175,55,0.8)' }}>胜利奖励</div>
              <div className="text-yellow-200 text-sm mb-4" style={{ fontFamily: 'var(--font-body)' }}>恭喜获得新卡牌！</div>
              {/* 卡牌 - 带旋转闪光 */}
              <div className="relative mb-6 animate-cardReveal">
                <div className="absolute inset-0 rounded-xl animate-pulseGlow" style={{ boxShadow: '0 0 40px rgba(212,175,55,0.6), 0 0 80px rgba(212,175,55,0.3)' }} />
                <div className="relative rounded-xl border-2 overflow-hidden flex flex-col" style={{ width: '180px', height: '252px', borderColor: getCardTypeColor(rewardCard.type) + '80', backgroundImage: `url(${getAssetPath('assets/backgrounds/card_texture.jpg')})`, backgroundSize: 'cover', boxShadow: '0 0 30px rgba(212,175,55,0.4)' }}>
                  <div className="flex flex-col h-full" style={{ background: 'rgba(20,10,5,0.55)' }}>
                    <div className="flex justify-between items-center px-2 pt-2 pb-1 shrink-0">
                      <span className="text-[11px] px-1.5 py-0.5 rounded font-bold leading-none" style={{ color: getCardTypeColor(rewardCard.type), background: getCardTypeColor(rewardCard.type) + '20', fontFamily: 'var(--font-body)' }}>{rewardCard.type === 'character' ? '人物' : rewardCard.type === 'item' ? '物品' : rewardCard.type === 'scenario' ? '情景' : '事件'}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded leading-none" style={{ color: '#fbbf24', background: 'rgba(120,50,0,0.45)', border: '1px solid rgba(251,191,36,0.3)' }}>{rewardCard.era}</span>
                    </div>
                    {getCardImage(rewardCard.id) ? (
                      <div className="shrink-0 h-[110px] flex items-center justify-center px-2">
                        <img src={getCardImage(rewardCard.id)!} alt={rewardCard.name} className="max-h-[105px] max-w-full object-contain rounded drop-shadow-lg" />
                      </div>
                    ) : (
                      <div className="shrink-0 h-[110px] flex items-center justify-center px-2">
                        <span className="text-5xl drop-shadow-lg" style={{ fontFamily: 'var(--font-title)', color: getCardTypeColor(rewardCard.type) }}>{rewardCard.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="shrink-0 px-2 pt-1 pb-0.5">
                      <div className="text-sm font-bold text-center leading-tight" style={{ fontFamily: 'var(--font-body)', color: '#fde68a', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{rewardCard.name}</div>
                    </div>
                    <div className="shrink-0 px-2 pb-1">
                      <div className="text-[9px] text-center leading-tight truncate" style={{ fontFamily: 'var(--font-body)', color: '#e8d5b5', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{getTagline(rewardCard.id)}</div>
                    </div>
                    <div className="shrink-0 grid grid-cols-2 gap-x-1.5 gap-y-0.5 px-2 pb-2 pt-1">
                      {rewardCard.attributes.political > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#c7d2fe', background: 'rgba(30,20,80,0.35)', border: '1px solid rgba(100,80,200,0.25)' }}>政 {rewardCard.attributes.political}</span>}
                      {rewardCard.attributes.economic > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#fde68a', background: 'rgba(120,90,0,0.35)', border: '1px solid rgba(200,150,0,0.25)' }}>经 {rewardCard.attributes.economic}</span>}
                      {rewardCard.attributes.military > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#fecaca', background: 'rgba(100,10,10,0.35)', border: '1px solid rgba(180,40,40,0.25)' }}>军 {rewardCard.attributes.military}</span>}
                      {rewardCard.attributes.cultural > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#bfdbfe', background: 'rgba(10,40,100,0.35)', border: '1px solid rgba(50,100,200,0.25)' }}>文 {rewardCard.attributes.cultural}</span>}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => { playIf(audioObj.current, () => AudioFX.click()); setShowReward(false); }}
                className="px-8 py-3 bg-gradient-to-r from-yellow-700 to-yellow-600 border-2 border-yellow-400/60 rounded-xl text-white font-bold hover:from-yellow-600 hover:to-yellow-500 transition-all hover:scale-105 animate-pulseGlow text-lg"
                style={{ fontFamily: 'var(--font-body)' }}>
                <Crown size={20} className="inline mr-2" />收下卡牌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ROUND RESULT FULLSCREEN PANEL ===== */}
      {gamePhase === 'roundEnd' && (playerScore > 0 || aiScore > 0) && (
        <div className="absolute inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getAssetPath('assets/backgrounds/result_bg.jpg')})` }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-4xl mx-4 p-6 md:p-8 bg-gradient-to-b from-gray-900/95 to-gray-950/95 border-2 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ borderColor: playerScore > aiScore ? 'rgba(212,175,55,0.5)' : 'rgba(220,20,60,0.5)' }}>

            {/* Title */}
            <div className="text-center mb-6">
              <div className={`text-3xl md:text-4xl font-bold mb-2 ${playerScore > aiScore ? 'text-yellow-400' : 'text-red-400'}`}
                style={{ fontFamily: 'var(--font-title)' }}>
                {playerScore > aiScore ? '回合胜利' : '回合失败'}
              </div>
              <div className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                比拼指标：{currentAttribute ? ATTRIBUTE_NAMES[currentAttribute] : '-'} · 第 {round} 回合
              </div>
            </div>

            {/* Score Big Display */}
            <div className="flex items-center justify-center gap-6 md:gap-12 mb-8">
              <div className="flex flex-col items-center">
                <div className="text-yellow-500 text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-body)' }}>玩家</div>
                <div className="text-5xl md:text-7xl font-bold text-yellow-400 animate-scorePop" style={{ fontFamily: 'var(--font-title)' }}>{playerScore}</div>
              </div>
              <div className="text-3xl md:text-5xl font-bold text-gray-600" style={{ fontFamily: 'var(--font-title)' }}>VS</div>
              <div className="flex flex-col items-center">
                <div className="text-red-400 text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-body)' }}>AI</div>
                <div className="text-5xl md:text-7xl font-bold text-red-400 animate-scorePop" style={{ fontFamily: 'var(--font-title)' }}>{aiScore}</div>
              </div>
            </div>

            {/* Cards Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              {/* Player Side */}
              <div className="p-4 rounded-xl border border-yellow-700/30 bg-gradient-to-b from-yellow-950/30 to-transparent">
                <div className="text-yellow-400 font-bold text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-body)' }}>
                  <Crown size={16} /> 我方出牌
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {playerPlayed.map((card, i) => (
                    <div key={i} className="w-16 h-24 rounded-lg border border-yellow-600/40 bg-gray-900 flex flex-col items-center justify-center p-1">
                      <span className="text-[10px] text-yellow-300 font-bold text-center" style={{ fontFamily: 'var(--font-body)' }}>{card.name}</span>
                      {currentAttribute && (
                        <span className="text-xs font-bold mt-1" style={{ color: ATTRIBUTE_COLORS[currentAttribute], fontFamily: 'var(--font-title)' }}>
                          {card.attributes[currentAttribute]}点
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {activeCombo && (
                  <div className="p-3 rounded-lg bg-yellow-900/30 border border-yellow-600/30">
                    <div className="text-yellow-300 font-bold text-sm" style={{ fontFamily: 'var(--font-title)' }}>{activeCombo.name}</div>
                    <div className="text-yellow-200/60 text-xs mt-1" style={{ fontFamily: 'var(--font-body)' }}>{activeCombo.description}</div>
                    {/* Full anecdote text */}
                    <div className="text-gray-300 text-xs mt-2 leading-relaxed border-t border-yellow-700/20 pt-2" style={{ fontFamily: 'var(--font-body)' }}>
                      {getAnecdoteByComboName(activeCombo.name) || (ANECDOTES[activeCombo.id] ? (playerScore > aiScore ? ANECDOTES[activeCombo.id].winText : ANECDOTES[activeCombo.id].loseText) : '')}
                    </div>
                  </div>
                )}
                {/* Single card detailed descriptions */}
                {!activeCombo && playerPlayed.length > 0 && (
                  <div className="space-y-2">
                    {playerPlayed.map((card, idx) => {
                      const detailText = getCardDetailById(card.id);
                      const cardAnecdote = getAnecdoteByCardName(card.name);
                      return detailText || cardAnecdote ? (
                        <div key={idx} className="p-2 rounded-lg bg-yellow-900/20 border border-yellow-700/20">
                          <div className="text-yellow-400 text-xs font-bold" style={{ fontFamily: 'var(--font-body)' }}>{card.name}</div>
                          {detailText && (
                            <div className="text-gray-300/80 text-xs leading-relaxed mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>{detailText}</div>
                          )}
                          {!detailText && cardAnecdote && (
                            <div className="text-gray-300/80 text-xs leading-relaxed mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>{cardAnecdote}</div>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* AI Side */}
              <div className="p-4 rounded-xl border border-red-700/30 bg-gradient-to-b from-red-950/30 to-transparent">
                <div className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-body)' }}>
                  <Shield size={16} /> AI出牌
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {aiPlayed.map((card, i) => (
                    <div key={i} className="w-16 h-24 rounded-lg border border-red-600/40 bg-gray-900 flex flex-col items-center justify-center p-1">
                      <span className="text-[10px] text-red-300 font-bold text-center" style={{ fontFamily: 'var(--font-body)' }}>{card.name}</span>
                      {currentAttribute && (
                        <span className="text-xs font-bold mt-1" style={{ color: ATTRIBUTE_COLORS[currentAttribute], fontFamily: 'var(--font-title)' }}>
                          {card.attributes[currentAttribute]}点
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {aiActiveCombo && (
                  <div className="p-3 rounded-lg bg-red-900/30 border border-red-600/30">
                    <div className="text-red-300 font-bold text-sm" style={{ fontFamily: 'var(--font-title)' }}>{aiActiveCombo.name}</div>
                    <div className="text-red-200/60 text-xs mt-1" style={{ fontFamily: 'var(--font-body)' }}>{aiActiveCombo.description}</div>
                    <div className="text-gray-300 text-xs mt-2 leading-relaxed border-t border-red-700/20 pt-2" style={{ fontFamily: 'var(--font-body)' }}>
                      {getAnecdoteByComboName(aiActiveCombo.name) || (ANECDOTES[aiActiveCombo.id] ? (playerScore <= aiScore ? ANECDOTES[aiActiveCombo.id].winText : ANECDOTES[aiActiveCombo.id].loseText) : '')}
                    </div>
                  </div>
                )}
                {/* AI single card detailed descriptions */}
                {!aiActiveCombo && aiPlayed.length > 0 && (
                  <div className="space-y-2">
                    {aiPlayed.map((card, idx) => {
                      const detailText = getCardDetailById(card.id);
                      const cardAnecdote = getAnecdoteByCardName(card.name);
                      return detailText || cardAnecdote ? (
                        <div key={idx} className="p-2 rounded-lg bg-red-900/20 border border-red-700/20">
                          <div className="text-red-400 text-xs font-bold" style={{ fontFamily: 'var(--font-body)' }}>{card.name}</div>
                          {detailText && (
                            <div className="text-gray-300/80 text-xs leading-relaxed mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>{detailText}</div>
                          )}
                          {!detailText && cardAnecdote && (
                            <div className="text-gray-300/80 text-xs leading-relaxed mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>{cardAnecdote}</div>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Anecdote text */}
            <div className="text-center mb-4">
              <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{anecdoteText}</p>
            </div>

            {/* Hint text (on lose) */}
            {playerScore <= aiScore && hintText && (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Scroll size={14} className="text-blue-400" />
                  <span className="text-blue-400 text-xs font-bold" style={{ fontFamily: 'var(--font-body)' }}>情报提示</span>
                </div>
                <p className="text-blue-200/70 text-xs" style={{ fontFamily: 'var(--font-body)' }}>{hintText}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              {playerScore > aiScore && aiHand.length > 0 && (
                <button onClick={stealCard}
                  className="px-6 py-3 bg-gradient-to-r from-purple-800 to-purple-700 border border-purple-500/50 rounded-xl text-white font-bold hover:from-purple-700 hover:to-purple-600 transition-all"
                  style={{ fontFamily: 'var(--font-body)' }}>夺取一张 AI 卡牌</button>
              )}
              <button onClick={() => nextRoundRef.current()}
                className="px-8 py-3 bg-gradient-to-r from-yellow-800 to-yellow-700 border border-yellow-500/50 rounded-xl text-white font-bold hover:from-yellow-700 hover:to-yellow-600 transition-all"
                style={{ fontFamily: 'var(--font-body)' }}>继续</button>
            </div>
          </div>
        </div>
      )}

      {/* Top - AI Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-black/60 border-b border-red-900/30 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-800 to-red-950 border-2 border-red-600 flex items-center justify-center shadow-lg"><Shield size={20} className="text-red-300" /></div>
          <div>
            <div className="text-red-300 text-sm font-bold" style={{ fontFamily: 'var(--font-body)' }}>AI 对手</div>
            <div className="text-gray-400 text-xs">{aiHand.length} 张手牌</div>
          </div>
        </div>
        <div className="flex gap-2">
          {[1,2,3].map(i => (
            <div key={i} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-md ${i <= aiWins ? 'border-red-500 bg-red-950 text-red-300' : 'border-gray-700 bg-gray-900 text-gray-600'}`}>{i <= aiWins ? '胜' : i}</div>
          ))}
        </div>
      </div>

      {/* AI Played Cards */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {aiPlayed.map((card, i) => (
          <div key={`ai-${card.id}-${i}`} className="rounded-lg border flex flex-col items-center justify-center p-1 animate-cardAppear shadow-lg border-red-700/50 bg-gray-900"
            style={{ width: '70px', height: '100px', animationDelay: `${i * 0.1}s` }}>
            <span className="text-[10px] text-red-300 font-bold text-center leading-tight" style={{ fontFamily: 'var(--font-body)' }}>{card.name}</span>
            {currentAttribute && (
              <span className="text-xs font-bold mt-0.5" style={{ color: ATTRIBUTE_COLORS[currentAttribute], fontFamily: 'var(--font-title)' }}>{card.attributes[currentAttribute]}</span>
            )}
          </div>
        ))}
        {aiActiveCombo && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-red-950 border border-red-500/40 rounded-full text-xs text-red-200 animate-pulse" style={{ fontFamily: 'var(--font-body)' }}>{aiActiveCombo.name}</div>
        )}
      </div>

      {/* Center - Dice / Attribute */}
      <div className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
        {gamePhase === 'dice' && (
          <div className="flex flex-col items-center gap-5">
            <div className={`w-28 h-28 rounded-2xl border-4 flex items-center justify-center transition-all duration-100 ${isRolling ? 'border-yellow-400 bg-gradient-to-br from-yellow-900/80 to-amber-950/90 animate-spin-slow' : 'border-yellow-600 bg-gray-900/80'}`}
              style={{ boxShadow: isRolling ? '0 0 50px rgba(212,175,55,0.6)' : '0 0 20px rgba(0,0,0,0.8)' }}>
              {currentAttribute ? (
                <span style={{ color: ATTRIBUTE_COLORS[currentAttribute], filter: 'drop-shadow(0 0 8px currentColor)' }}>{getAttrIcon(currentAttribute)}</span>
              ) : (
                <span className="text-yellow-500 text-4xl" style={{ fontFamily: 'var(--font-title)' }}>?</span>
              )}
            </div>
            {!isRolling && (
              <button onClick={handleRollDice}
                className="px-8 py-3 bg-gradient-to-r from-yellow-700 to-yellow-600 border-2 border-yellow-400/60 rounded-xl text-yellow-50 text-lg font-bold hover:from-yellow-600 hover:to-yellow-500 transition-all hover:scale-105 hover:border-yellow-300 shadow-lg shadow-yellow-900/30"
                style={{ fontFamily: 'var(--font-body)' }}>掷骰子</button>
            )}
            {isRolling && <div className="text-yellow-300 animate-pulse text-lg font-bold" style={{ fontFamily: 'var(--font-body)', textShadow: '0 0 10px rgba(212,175,55,0.5)' }}>掷骰中...</div>}
          </div>
        )}

        {currentAttribute && gamePhase !== 'dice' && (
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            {/* Attribute Badge - white text with colored glow */}
            <div className="px-6 py-2.5 rounded-full border-2 flex items-center gap-3 shadow-lg"
              style={{ 
                borderColor: ATTRIBUTE_COLORS[currentAttribute], 
                backgroundColor: 'rgba(0,0,0,0.7)',
                boxShadow: `0 0 15px ${ATTRIBUTE_COLORS[currentAttribute]}40, inset 0 0 10px ${ATTRIBUTE_COLORS[currentAttribute]}20`
              }}>
              <span style={{ color: ATTRIBUTE_COLORS[currentAttribute], filter: 'drop-shadow(0 0 6px currentColor)' }}>{getAttrIcon(currentAttribute)}</span>
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-body)', textShadow: `0 0 10px ${ATTRIBUTE_COLORS[currentAttribute]}` }}>
                比拼：{ATTRIBUTE_NAMES[currentAttribute]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Round Indicator */}
      <div className="absolute top-[32%] right-4 flex flex-col items-center gap-1.5 z-10">
        <div className="text-xs text-gray-400 font-bold" style={{ fontFamily: 'var(--font-body)' }}>第 {round} 回合</div>
        <div className="flex gap-1">
          {(['政','经','军','文'] as const).map((a, i) => {
            const attr = ATTRIBUTES[i] as Attribute;
            const isActive = currentAttribute === attr;
            return (
              <div key={a} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${isActive ? 'ring-2 ring-white scale-110' : ''}`}
                style={{ 
                  backgroundColor: isActive ? `${ATTRIBUTE_COLORS[attr]}30` : 'rgba(0,0,0,0.5)', 
                  color: isActive ? '#fff' : ATTRIBUTE_COLORS[attr],
                  fontFamily: 'var(--font-body)',
                  textShadow: isActive ? `0 0 8px ${ATTRIBUTE_COLORS[attr]}` : 'none',
                  border: `1px solid ${isActive ? ATTRIBUTE_COLORS[attr] : 'transparent'}`
                }}>{a}</div>
            );
          })}
        </div>
      </div>

      {/* Player Played Cards */}
      <div className="absolute bottom-[44%] left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {playerPlayed.map((card, i) => (
          <div key={`pp-${card.id}-${i}`} className="rounded-lg border flex flex-col items-center justify-center p-1 animate-cardAppear shadow-lg border-yellow-600/50 bg-gray-900"
            style={{ width: '70px', height: '100px', animationDelay: `${i * 0.1}s` }}>
            <span className="text-[10px] text-yellow-300 font-bold text-center leading-tight" style={{ fontFamily: 'var(--font-body)' }}>{card.name}</span>
            {currentAttribute && (
              <span className="text-xs font-bold mt-0.5" style={{ color: ATTRIBUTE_COLORS[currentAttribute], fontFamily: 'var(--font-title)' }}>{card.attributes[currentAttribute]}</span>
            )}
          </div>
        ))}
        {activeCombo && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-yellow-950 border border-yellow-500/40 rounded-full text-xs text-yellow-200 animate-pulse" style={{ fontFamily: 'var(--font-body)' }}>{activeCombo.name}</div>
        )}
      </div>

      {/* Combo Preview */}
      {showComboPreview && pendingCombo && (
        <div className="absolute bottom-[44%] left-1/2 -translate-x-1/2 -translate-y-2 px-5 py-3 bg-gray-950 border-2 border-yellow-500/60 rounded-xl z-30 animate-fadeIn shadow-2xl">
          <div className="text-yellow-300 font-bold text-sm text-center mb-1" style={{ fontFamily: 'var(--font-title)' }}>{pendingCombo.name}</div>
          <div className="text-yellow-200/60 text-xs text-center mb-2" style={{ fontFamily: 'var(--font-body)' }}>{pendingCombo.description}</div>
          <div className="flex gap-3 justify-center">
            {pendingCombo.bonusAttributes.political !== undefined && pendingCombo.bonusAttributes.political !== 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: '#c084fc', background: 'rgba(138,43,226,0.2)' }}>政 +{pendingCombo.bonusAttributes.political}</span>
            )}
            {pendingCombo.bonusAttributes.economic !== undefined && pendingCombo.bonusAttributes.economic !== 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: '#facc15', background: 'rgba(255,215,0,0.15)' }}>经 +{pendingCombo.bonusAttributes.economic}</span>
            )}
            {pendingCombo.bonusAttributes.military !== undefined && pendingCombo.bonusAttributes.military !== 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: '#f87171', background: 'rgba(220,20,60,0.15)' }}>军 +{pendingCombo.bonusAttributes.military}</span>
            )}
            {pendingCombo.bonusAttributes.cultural !== undefined && pendingCombo.bonusAttributes.cultural !== 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: '#60a5fa', background: 'rgba(0,191,255,0.15)' }}>文 +{pendingCombo.bonusAttributes.cultural}</span>
            )}
          </div>
        </div>
      )}

      {/* Player Hand - Fixed layout, no text squishing */}
      <div className="absolute bottom-28 left-0 right-0 z-20">
        <div className="flex justify-center" style={{ paddingLeft: '28px' }}>
          {playerHand.map((card, i) => {
            const isSelected = selectedCards.find(s => s.id === card.id);
            const isSwapTarget = swapSelected?.id === card.id;
            const img = getCardImage(card.id);
            const typeColor = getCardTypeColor(card.type);
            const cardCombos = CARD_COMBOS.filter(cb => cb.cardIds.includes(card.id)).slice(0, 3);
            const tagline = getTagline(card.id);

            if (gamePhase === 'dice') {
              return (
                <div key={`hand-${card.id}-${i}`} style={{ marginLeft: i === 0 ? 0 : '-26px', zIndex: i }}>
                  <CardBack width="150px" height="210px" />
                </div>
              );
            }

            // Click handler: swapping mode vs normal selection
            const handleClick = () => {
              if (isSwapping) {
                if (swapSelected?.id === card.id) {
                  setSwapSelected(null);
                } else {
                  setSwapSelected(card);
                }
              } else {
                toggleCardSelection(card);
              }
            };

            return (
              <button key={`hand-${card.id}-${i}`}
                onClick={handleClick}
                onContextMenu={(e) => { e.preventDefault(); setDetailCard(card); }}
                onMouseEnter={() => playIf(audioObj.current, () => AudioFX.hover())}
                className={`group relative rounded-xl border-2 transition-all duration-200 flex flex-col overflow-hidden ${
                  isSwapping && isSwapTarget
                    ? 'border-blue-400 -translate-y-3 shadow-xl z-50'
                    : isSwapping
                      ? 'border-gray-600/40 hover:border-blue-500/60 z-30'
                      : isSelected
                        ? 'border-yellow-300 -translate-y-5 shadow-xl card-selected z-50'
                        : gamePhase === 'playerTurn'
                          ? (comboHighlight[card.id] ? '' : 'border-yellow-700/60 hover:-translate-y-2 hover:border-yellow-400/80 hover:shadow-lg z-30')
                          : 'border-yellow-900/20 opacity-50'
                }`}
                style={{ 
                  width: '150px', 
                  height: '210px', 
                  marginLeft: i === 0 ? 0 : '-26px', 
                  zIndex: (isSelected || isSwapTarget || comboHighlight[card.id]) ? 50 : i,
                  backgroundImage: `url(${getAssetPath('assets/backgrounds/card_texture.jpg')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderColor: comboHighlight[card.id] && !isSelected ? comboHighlight[card.id].color : undefined,
                  borderWidth: comboHighlight[card.id] && !isSelected ? '3px' : undefined,
                  boxShadow: isSelected ? '0 0 25px rgba(212,175,55,0.4), inset 0 0 20px rgba(0,0,0,0.3)' : 
                    isSwapTarget ? '0 0 20px rgba(96,165,250,0.4)' : 
                    comboHighlight[card.id] && !isSelected ? `0 0 15px ${comboHighlight[card.id].color}80, inset 0 0 10px ${comboHighlight[card.id].color}30` : 
                    'inset 0 0 15px rgba(0,0,0,0.2)',
                  transform: comboHighlight[card.id] && !isSelected ? 'translateY(-4px)' : undefined
                }}>

                {/* Card inner - fixed height sections with dark overlay for text readability */}
                <div className="flex flex-col h-full" style={{ background: 'rgba(20,10,5,0.55)' }}>
                  {/* Top bar: type + era */}
                  <div className="flex justify-between items-center px-2 pt-2 pb-1 shrink-0">
                    <span className="text-[11px] px-1.5 py-0.5 rounded font-bold leading-none"
                      style={{ color: typeColor, background: typeColor + '20', fontFamily: 'var(--font-body)' }}>
                      {card.type === 'character' ? '人物' : card.type === 'item' ? '物品' : card.type === 'scenario' ? '情景' : '事件'}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded leading-none"
                      style={{ 
                        color: '#fbbf24', 
                        background: 'rgba(120,50,0,0.45)', 
                        fontFamily: 'var(--font-body)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        textShadow: '0 0 6px rgba(251,191,36,0.5)'
                      }}>
                      {card.era}
                    </span>
                  </div>

                  {/* Image - constrained height */}
                  <div className="shrink-0 h-[90px] flex items-center justify-center px-2">
                    {img ? (
                      <img src={img} alt={card.name} className="max-h-[85px] max-w-full object-contain rounded drop-shadow-lg" draggable={false} />
                    ) : (
                      <div className="flex items-center justify-center h-full" style={{ color: typeColor }}>
                        <span className="text-5xl drop-shadow-lg" style={{ fontFamily: 'var(--font-title)' }}>{card.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="shrink-0 px-2 pt-1 pb-0.5">
                    <div className="text-sm font-bold text-center leading-tight" style={{ fontFamily: 'var(--font-body)', color: '#fde68a', textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)' }}>
                      {card.name}
                    </div>
                  </div>

                  {/* Tagline */}
                  {tagline && (
                    <div className="shrink-0 px-2 pb-1">
                      <div className="text-[9px] text-center leading-tight truncate" style={{ fontFamily: 'var(--font-body)', color: '#e8d5b5', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                        {tagline}
                      </div>
                    </div>
                  )}

                  {/* Combo highlight label with progress */}
                  {comboHighlight[card.id] && !isSelected && (
                    <div className="shrink-0 px-1.5 pb-1">
                      <div className="text-[8px] text-center font-bold px-1 py-0.5 rounded truncate" style={{ color: '#fff', background: comboHighlight[card.id].color + '90', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {comboHighlight[card.id].name} ({comboHighlight[card.id].have}/{comboHighlight[card.id].total})
                      </div>
                    </div>
                  )}

                  {/* Attributes - 2x2 grid to avoid overlap */}
                  <div className="shrink-0 grid grid-cols-2 gap-x-1.5 gap-y-0.5 px-2 pb-2 pt-1">
                    {card.attributes.political > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#c7d2fe', background: 'rgba(30,20,80,0.35)', textShadow: '0 1px 2px rgba(0,0,0,0.8)', border: '1px solid rgba(100,80,200,0.25)' }}>政 {card.attributes.political}</span>}
                    {card.attributes.economic > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#fde68a', background: 'rgba(120,90,0,0.35)', textShadow: '0 1px 2px rgba(0,0,0,0.8)', border: '1px solid rgba(200,150,0,0.25)' }}>经 {card.attributes.economic}</span>}
                    {card.attributes.military > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#fecaca', background: 'rgba(100,10,10,0.35)', textShadow: '0 1px 2px rgba(0,0,0,0.8)', border: '1px solid rgba(180,40,40,0.25)' }}>军 {card.attributes.military}</span>}
                    {card.attributes.cultural > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#bfdbfe', background: 'rgba(10,40,100,0.35)', textShadow: '0 1px 2px rgba(0,0,0,0.8)', border: '1px solid rgba(50,100,200,0.25)' }}>文 {card.attributes.cultural}</span>}
                  </div>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-gray-950/95 border border-yellow-700/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-2xl backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-yellow-400 font-bold text-base" style={{ fontFamily: 'var(--font-title)' }}>{card.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ color: typeColor, background: typeColor + '25', fontFamily: 'var(--font-body)' }}>
                      {card.type === 'character' ? '人物' : card.type === 'item' ? '物品' : card.type === 'scenario' ? '情景' : '事件'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'var(--font-body)' }}>{card.description} · {card.era}</div>
                  {tagline && <div className="text-xs text-yellow-500/70 mb-2 italic" style={{ fontFamily: 'var(--font-body)' }}>「{tagline}」</div>}
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {ATTRIBUTES.map(attr => (
                      <div key={attr} className="flex flex-col items-center py-1 rounded" style={{ background: `${ATTRIBUTE_COLORS[attr]}15` }}>
                        <span className="text-[9px] font-bold" style={{ color: ATTRIBUTE_COLORS[attr] }}>{ATTRIBUTE_NAMES[attr]}</span>
                        <span className="text-base font-bold" style={{ color: ATTRIBUTE_COLORS[attr], fontFamily: 'var(--font-title)' }}>{card.attributes[attr]}</span>
                      </div>
                    ))}
                  </div>
                  {cardCombos.length > 0 && (
                    <div className="border-t border-yellow-800/30 pt-1.5">
                      <div className="text-[10px] text-yellow-500 mb-1" style={{ fontFamily: 'var(--font-body)' }}>可参与组合:</div>
                      {cardCombos.map(cb => (
                        <div key={cb.id} className="text-[10px] text-gray-300 mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                          <span className="text-yellow-400 font-bold">{cb.name}</span>
                          <span className="text-gray-500"> (需: {cb.cardIds.filter(id => id !== card.id).map(id => ALL_CARDS.find(c => c.id === id)?.name || '?').join('+')})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-black/60 border-t border-yellow-900/20 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-700 to-yellow-950 border-2 border-yellow-500 flex items-center justify-center shadow-lg"><Crown size={20} className="text-yellow-300" /></div>
          <div>
            <div className="text-yellow-300 text-sm font-bold" style={{ fontFamily: 'var(--font-body)' }}>玩家</div>
            <div className="flex gap-1.5">
              {[1,2,3].map(i => (
                <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-md ${i <= playerWins ? 'border-yellow-500 bg-yellow-950 text-yellow-300' : 'border-gray-700 bg-gray-900 text-gray-600'}`}>{i <= playerWins ? '胜' : i}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {gamePhase === 'playerTurn' && !isSwapping && selectedCards.length > 0 && (
            <button onClick={confirmPlay}
              className="px-6 py-2.5 bg-gradient-to-r from-yellow-700 to-yellow-600 border-2 border-yellow-400/60 rounded-xl text-white font-bold hover:from-yellow-600 hover:to-yellow-500 transition-all hover:scale-105 animate-pulseGlow text-base"
              style={{ fontFamily: 'var(--font-body)' }}>确认打出</button>
          )}
          {gamePhase === 'playerTurn' && !isSwapping && selectedCards.length === 0 && (
            <>
              <div className="flex items-center gap-2">
                {swapCount > 0 && (
                  <button onClick={() => { playIf(audioObj.current, () => AudioFX.click()); setIsSwapping(true); setSelectedCards([]); setShowComboPreview(false); }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-700 border border-blue-400/50 rounded-xl text-blue-100 font-bold hover:from-blue-700 hover:to-blue-600 transition-all hover:scale-105 text-sm flex items-center gap-1.5"
                    style={{ fontFamily: 'var(--font-body)' }}>
                    <Sparkles size={14} /> 换卡 <span className="text-blue-300">({swapCount})</span>
                  </button>
                )}
                {redrawCount > 0 ? (
                  <button onClick={() => { playIf(audioObj.current, () => AudioFX.click()); executeRedraw(); }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-800 to-emerald-700 border border-emerald-400/50 rounded-xl text-emerald-100 font-bold hover:from-emerald-700 hover:to-emerald-600 transition-all hover:scale-105 text-sm flex items-center gap-1.5"
                    style={{ fontFamily: 'var(--font-body)' }}>
                    <Shuffle size={14} /> 重抽 <span className="text-emerald-300">({redrawCount})</span>
                  </button>
                ) : (
                  <div className="text-gray-500 text-xs px-2" style={{ fontFamily: 'var(--font-body)' }}>重抽次数已用完</div>
                )}
              </div>
            </>
          )}
          {gamePhase === 'playerTurn' && isSwapping && (
            <div className="flex items-center gap-2">
              {swapSelected ? (
                <button onClick={executeSwap}
                  className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 border-2 border-blue-400/60 rounded-xl text-white font-bold hover:from-blue-600 hover:to-blue-500 transition-all hover:scale-105 text-sm animate-pulseGlow"
                  style={{ fontFamily: 'var(--font-body)' }}>确认换卡</button>
              ) : (
                <div className="text-blue-300 text-sm px-2" style={{ fontFamily: 'var(--font-body)' }}>请选择要替换的卡牌</div>
              )}
              <button onClick={cancelSwap}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-300 font-bold hover:bg-gray-700 transition-all text-sm"
                style={{ fontFamily: 'var(--font-body)' }}>取消</button>
            </div>
          )}
          {gamePhase === 'aiTurn' && (
            <div className="text-red-400 text-sm animate-pulse flex items-center gap-2" style={{ fontFamily: 'var(--font-body)' }}>
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /> AI 思考中...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { const d = loadSaveData(); d.soundEnabled = !d.soundEnabled; saveAudio(d); setAudioEnabled(d.soundEnabled); }}
            className="w-9 h-9 rounded-full bg-gray-800/80 border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:border-yellow-500 transition-all">
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={() => setScreen('levelSelect')}
            className="w-9 h-9 rounded-full bg-gray-800/80 border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:border-yellow-500 transition-all">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Victory Reward Card */}
      {showReward && rewardCard && (
        <div className="absolute inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getAssetPath('assets/backgrounds/result_bg.jpg')})` }} />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative max-w-sm mx-4 p-6 border-2 rounded-2xl shadow-2xl text-center overflow-hidden"
            style={{ borderColor: 'rgba(212,175,55,0.6)', backgroundImage: `url(${getAssetPath('assets/backgrounds/card_texture.jpg')})`, backgroundSize: 'cover' }}>
            <div className="absolute inset-0" style={{ background: 'rgba(15,8,3,0.75)' }} />
            <div className="relative z-10">
              <div className="text-yellow-400 text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-body)' }}>胜利奖励</div>
              <h3 className="text-2xl font-bold mb-3 text-yellow-300" style={{ fontFamily: 'var(--font-title)' }}>获得新卡牌</h3>
              <div className="mx-auto mb-4 rounded-xl border-2 overflow-hidden flex flex-col" style={{ width: '150px', height: '210px', borderColor: getCardTypeColor(rewardCard.type) + '60', backgroundImage: `url(${getAssetPath('assets/backgrounds/card_texture.jpg')})`, backgroundSize: 'cover', boxShadow: '0 0 25px rgba(212,175,55,0.3)' }}>
                <div className="flex flex-col h-full" style={{ background: 'rgba(20,10,5,0.55)' }}>
                  <div className="flex justify-between items-center px-2 pt-2 pb-1 shrink-0">
                    <span className="text-[11px] px-1.5 py-0.5 rounded font-bold leading-none" style={{ color: getCardTypeColor(rewardCard.type), background: getCardTypeColor(rewardCard.type) + '20', fontFamily: 'var(--font-body)' }}>{rewardCard.type === 'character' ? '人物' : rewardCard.type === 'item' ? '物品' : rewardCard.type === 'scenario' ? '情景' : '事件'}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded leading-none" style={{ color: '#fbbf24', background: 'rgba(120,50,0,0.45)', border: '1px solid rgba(251,191,36,0.3)' }}>{rewardCard.era}</span>
                  </div>
                  {getCardImage(rewardCard.id) ? (
                    <div className="shrink-0 h-[90px] flex items-center justify-center px-2">
                      <img src={getCardImage(rewardCard.id)!} alt={rewardCard.name} className="max-h-[85px] max-w-full object-contain rounded drop-shadow-lg" />
                    </div>
                  ) : (
                    <div className="shrink-0 h-[90px] flex items-center justify-center px-2">
                      <span className="text-5xl drop-shadow-lg" style={{ fontFamily: 'var(--font-title)', color: getCardTypeColor(rewardCard.type) }}>{rewardCard.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="shrink-0 px-2 pt-1 pb-0.5">
                    <div className="text-sm font-bold text-center leading-tight" style={{ fontFamily: 'var(--font-body)', color: '#fde68a', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{rewardCard.name}</div>
                  </div>
                  <div className="shrink-0 grid grid-cols-2 gap-x-1.5 gap-y-0.5 px-2 pb-2 pt-1">
                    {rewardCard.attributes.political > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#c7d2fe', background: 'rgba(30,20,80,0.35)', border: '1px solid rgba(100,80,200,0.25)' }}>政 {rewardCard.attributes.political}</span>}
                    {rewardCard.attributes.economic > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#fde68a', background: 'rgba(120,90,0,0.35)', border: '1px solid rgba(200,150,0,0.25)' }}>经 {rewardCard.attributes.economic}</span>}
                    {rewardCard.attributes.military > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#fecaca', background: 'rgba(100,10,10,0.35)', border: '1px solid rgba(180,40,40,0.25)' }}>军 {rewardCard.attributes.military}</span>}
                    {rewardCard.attributes.cultural > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded text-center" style={{ color: '#bfdbfe', background: 'rgba(10,40,100,0.35)', border: '1px solid rgba(50,100,200,0.25)' }}>文 {rewardCard.attributes.cultural}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => { playIf(audioObj.current, () => AudioFX.click()); setShowReward(false); }}
                className="w-full py-3 bg-gradient-to-r from-yellow-700 to-yellow-600 border-2 border-yellow-400/60 rounded-xl text-white font-bold hover:from-yellow-600 hover:to-yellow-500 transition-all hover:scale-105"
                style={{ fontFamily: 'var(--font-body)' }}>
                <Crown size={18} className="inline mr-2" />收下卡牌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match End */}
      {matchResult && !showReward && (
        <div className="absolute inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getAssetPath('assets/backgrounds/result_bg.jpg')})` }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative max-w-sm mx-4 p-8 bg-gradient-to-b from-gray-900/95 to-black/95 border-2 rounded-2xl shadow-2xl text-center"
            style={{ borderColor: matchResult === 'win' ? 'rgba(212,175,55,0.6)' : 'rgba(220,20,60,0.6)' }}>
            <div className={`text-6xl mb-5 ${matchResult === 'win' ? 'text-yellow-400' : 'text-red-400'}`}>
              {matchResult === 'win' ? <Trophy size={72} className="mx-auto" /> : <Swords size={72} className="mx-auto" />}
            </div>
            <h3 className={`text-4xl font-bold mb-3 ${matchResult === 'win' ? 'text-yellow-400' : 'text-red-400'}`} style={{ fontFamily: 'var(--font-title)' }}>
              {matchResult === 'win' ? '胜利！' : '失败'}</h3>
            <p className="text-gray-400 mb-2 text-sm" style={{ fontFamily: 'var(--font-body)' }}>{currentLevel?.name}</p>
            <p className="text-gray-300 mb-8 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              {matchResult === 'win' ? `以 ${playerWins} 比 ${aiWins} 赢得了这场对弈！` : `以 ${playerWins} 比 ${aiWins} 惜败。不要气馁，再试一次！`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => { playIf(audioObj.current, () => AudioFX.click()); currentLevel && startGame(currentLevel); }}
                className="flex-1 py-3.5 bg-gradient-to-r from-yellow-800 to-yellow-700 border border-yellow-500/50 rounded-xl text-white font-bold hover:from-yellow-700 hover:to-yellow-600 transition-all"
                style={{ fontFamily: 'var(--font-body)' }}>再来一局</button>
              <button onClick={() => { playIf(audioObj.current, () => AudioFX.click()); setScreen('levelSelect'); }}
                className="flex-1 py-3.5 bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500/50 rounded-xl text-white font-bold hover:from-gray-600 hover:to-gray-500 transition-all"
                style={{ fontFamily: 'var(--font-body)' }}>返回</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
