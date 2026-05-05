const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/api$/, '');

export function resolveImg(src: string | null | undefined): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_ORIGIN}${src}`;
}

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}
