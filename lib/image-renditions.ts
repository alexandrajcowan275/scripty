import manifest from './image-renditions.json';
export type ImageRendition = { originalUrl: string; thumbnailUrl: string; reviewUrl: string; width: number; height: number; originalSha256: string; thumbnailBytes: number; reviewBytes: number };
const renditions: Record<string, ImageRendition> = manifest;
/** Offline-generated, content-addressed display copies. Unknown uploads stay untouched. */
export function imageRendition(src: string): ImageRendition | undefined {
  if (!Object.hasOwn(renditions, src)) return undefined;
  return renditions[src];
}
