"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type ResilientImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  /** Same-origin fallback when the primary (often Firebase) URL fails to load. */
  fallbackSrc?: string | null;
};

/**
 * next/image wrapper that swaps to a bundled asset if the primary URL 404s
 * or Firebase Storage is unreachable in the browser.
 */
export function ResilientImage({ src, fallbackSrc, alt, ...rest }: ResilientImageProps) {
  const fallback = String(fallbackSrc || "").trim();
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <Image
      {...rest}
      alt={alt}
      src={current || fallback || src}
      onError={() => {
        if (fallback && current !== fallback) setCurrent(fallback);
      }}
    />
  );
}

type ResilientImgProps = {
  src: string;
  fallbackSrc?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
};

/** Plain <img> with the same fallback behavior (SVGs, menu marks, etc.). */
export function ResilientImg({
  src,
  fallbackSrc,
  alt = "",
  className,
  width,
  height,
}: ResilientImgProps) {
  const fallback = String(fallbackSrc || "").trim();
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(src);
    setFailed(false);
  }, [src]);

  if (failed && !fallback) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed && fallback ? fallback : current || fallback || src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => {
        if (fallback && current !== fallback && !failed) {
          setCurrent(fallback);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
