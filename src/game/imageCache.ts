// ===== 图片缓存与预加载系统 =====

const imageCache: Map<string, HTMLImageElement> = new Map();
const loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

/**
 * 预加载单张图片
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  // 已缓存直接返回
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  // 正在加载中
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }
  
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load: ${src}`));
    };
    img.src = src;
  });
  
  loadingPromises.set(src, promise);
  return promise;
}

/**
 * 批量预加载图片
 */
export function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(src => preloadImage(src).catch(() => null)))
    .then(results => results.filter((img): img is HTMLImageElement => img !== null));
}

/**
 * 检查图片是否已缓存
 */
export function isImageCached(src: string): boolean {
  return imageCache.has(src);
}

/**
 * 获取缓存的图片
 */
export function getCachedImage(src: string): HTMLImageElement | undefined {
  return imageCache.get(src);
}

/**
 * 预加载当前关卡可能用到的卡牌图片
 * @param cardIds 卡牌ID列表
 * @param getImageFn 获取图片路径的函数
 */
export async function preloadLevelCards(
  cardIds: string[], 
  getImageFn: (id: string) => string | undefined
): Promise<void> {
  const srcs = cardIds
    .map(id => getImageFn(id))
    .filter((src): src is string => !!src);
  
  // 分批预加载，避免一次性请求过多
  const batchSize = 10;
  for (let i = 0; i < srcs.length; i += batchSize) {
    const batch = srcs.slice(i, i + batchSize);
    await Promise.all(batch.map(src => preloadImage(src).catch(() => null)));
    // 小延迟让UI有机会更新
    if (i + batchSize < srcs.length) {
      await new Promise(r => setTimeout(r, 50));
    }
  }
}

/**
 * 清理缓存（切换关卡时调用）
 */
export function clearImageCache(): void {
  imageCache.clear();
  loadingPromises.clear();
}
