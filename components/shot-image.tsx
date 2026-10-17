"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "./icons";
import { displayImageSource, type ImageVariant } from "./image-source";

export function ShotImage({
  src,
  alt,
  className = "",
  priority = false,
  style,
  variant = "review",
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
  variant?: ImageVariant;
  sizes?: string;
}) {
  const display = displayImageSource(src, variant, sizes);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!display.src || failedSource === display.src)
    return (
      <div
        className={`image-fallback ${className}`}
        role="img"
        aria-label={`${alt}. Image unavailable.`}
      >
        <Icon name="image" size={25} />
        <span>Image unavailable</span>
      </div>
    );
  // Unknown live uploads keep their existing URL; known sample/study sources use offline WebP copies.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      {...display}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedSource(display.src)}
    />
  );
}
