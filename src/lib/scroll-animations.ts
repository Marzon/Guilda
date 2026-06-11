import type { CSSProperties } from "react";

export const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const scrollViewport = { once: true, amount: 0.15 };

const tr = (delay = 0, duration = 0.7) => ({
  duration, delay, ease: smoothEase,
});

export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: scrollViewport,
  transition: tr(delay),
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const fadeUp = (y = 25, delay = 0) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: scrollViewport,
  transition: tr(delay),
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const fadeX = (x: number, delay = 0) => ({
  initial: { opacity: 0, x },
  whileInView: { opacity: 1, x: 0 },
  viewport: scrollViewport,
  transition: tr(delay),
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const fadeScale = (scale = 0.92, delay = 0, duration = 0.7) => ({
  initial: { opacity: 0, scale },
  whileInView: { opacity: 1, scale: 1 },
  viewport: scrollViewport,
  transition: tr(delay, duration),
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const fadeUpScale = (y = 20, scale = 0.97, delay = 0) => ({
  initial: { opacity: 0, y, scale },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: scrollViewport,
  transition: tr(delay),
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const fadeRotate = (x: number, rotate: number, delay = 0) => ({
  initial: { opacity: 0, x, rotate },
  whileInView: { opacity: 1, x: 0, rotate: 0 },
  viewport: scrollViewport,
  transition: tr(delay),
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const onLoadFadeScale = (scale = 0.92, delay = 0, duration = 0.5) => ({
  initial: { opacity: 0, scale },
  animate: { opacity: 1, scale: 1 },
  transition: { duration, delay, ease: smoothEase },
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const onLoadFadeUp = (y = 40, delay = 0, duration = 0.7) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: smoothEase },
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const onLoadFadeUpScale = (y = 20, scale = 0.97, delay = 0) => ({
  initial: { opacity: 0, y, scale },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.7, delay, ease: smoothEase },
  style: { willChange: 'transform, opacity' } as CSSProperties,
});

export const onLoadFadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.7, delay, ease: smoothEase },
  style: { willChange: 'opacity' } as CSSProperties,
});
