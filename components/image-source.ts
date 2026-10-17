import { imageRendition } from "../lib/image-renditions";
export type ImageVariant = "thumbnail" | "review";

/** Display copies only: never include an original in the browser's responsive candidates. */
export function displayImageSource(
  src: string,
  variant: ImageVariant = "review",
  sizes?: string,
) {
  const rendition = imageRendition(src);
  if (!rendition) return { src };
  if (variant === "thumbnail")
    return {
      src: rendition.thumbnailUrl,
      srcSet: `${rendition.thumbnailUrl} 480w`,
      sizes: sizes ?? "480px",
    };
  return {
    src: rendition.reviewUrl,
    srcSet: `${rendition.thumbnailUrl} 480w, ${rendition.reviewUrl} 1200w`,
    sizes: sizes ?? "(max-width: 650px) calc(100vw - 24px), 1200px",
  };
}

/** Call only from an explicit full-resolution/loupe interaction. */
export function originalImageSource(src: string) {
  return imageRendition(src)?.originalUrl ?? src;
}
