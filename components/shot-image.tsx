"use client";

import { useState } from "react";
import { Icon } from "./icons";

export function ShotImage({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!src || failedSource === src) return <div className={`image-fallback ${className}`} role="img" aria-label={`${alt}. Image unavailable.`}><Icon name="image" size={25}/><span>Image unavailable</span></div>;
  // The API may return public Storage URLs from any configured provider; native images avoid a remote-host allowlist.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} decoding="async" onError={() => setFailedSource(src)}/>;
}
