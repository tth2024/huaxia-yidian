// ===== 游戏音效系统 =====
import { getAssetPath } from './assetPath';

const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(name: string): HTMLAudioElement {
  const path = getAssetPath(`assets/audio/${name}.mp3`);
  if (!audioCache[path]) {
    audioCache[path] = new Audio(path);
  }
  return audioCache[path];
}

export function playSound(name: string, volume = 0.6) {
  try {
    const audio = getAudio(name);
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // 忽略音频错误
  }
}

// BGM 管理器
let currentBgm: HTMLAudioElement | null = null;

export function playBGM(name: string, volume = 0.25) {
  try {
    // 停止之前的 BGM
    if (currentBgm) {
      currentBgm.pause();
      currentBgm.currentTime = 0;
    }
    const audio = new Audio(getAssetPath(`assets/audio/${name}.mp3`));
    audio.volume = volume;
    audio.loop = true;
    audio.play().catch(() => {});
    currentBgm = audio;
  } catch {
    // 忽略
  }
}

export function stopBGM() {
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
    currentBgm = null;
  }
}

// 预加载所有音效
export function preloadSounds() {
  const sounds = ['hover', 'click', 'dice', 'play', 'combo', 'win', 'lose', 'victory', 'deal', 'hint'];
  sounds.forEach(name => {
    const audio = new Audio(getAssetPath(`assets/audio/${name}.mp3`));
    audio.preload = 'auto';
    audioCache[name] = audio;
  });
}

// 快捷音效函数
export const AudioFX = {
  hover: () => playSound('hover', 0.3),
  click: () => playSound('click', 0.5),
  dice: () => playSound('dice', 0.5),
  play: () => playSound('play', 0.6),
  combo: () => playSound('combo', 0.7),
  win: () => playSound('win', 0.6),
  lose: () => playSound('lose', 0.5),
  victory: () => playSound('victory', 0.7),
  deal: () => playSound('deal', 0.4),
  hint: () => playSound('hint', 0.5),
};

export const BGM = {
  playBattle: () => playBGM('bgm_battle', 0.2),
  stop: () => stopBGM(),
};
