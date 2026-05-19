// ===== 资源路径工具 =====
// 自动适配部署路径，解决 GitHub Pages 子目录部署问题

/**
 * 获取正确的资源路径
 * 使用 Vite 的 BASE_URL 自动适配部署路径
 * 例如：
 *   getAssetPath('/assets/audio/click.mp3') → './assets/audio/click.mp3'
 *   getAssetPath('assets/audio/click.mp3') → './assets/audio/click.mp3'
 */
export function getAssetPath(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // 移除路径开头的 /，因为 BASE_URL 已包含末尾 /
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}

/**
 * 批量转换资源路径对象
 */
export function mapAssetPaths(paths: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, path] of Object.entries(paths)) {
    result[key] = getAssetPath(path);
  }
  return result;
}
