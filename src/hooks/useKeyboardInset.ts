'use client';

import { useEffect, useState } from 'react';
import { keyboardInset } from '@/lib/keyboard-inset';

/**
 * Tracks how far a bottom-fixed element must be lifted to sit above the
 * on-screen keyboard. Returns 0 where the browser already resizes the layout
 * viewport or has no VisualViewport API.
 *
 * While `active`, it also re-measures every animation frame: the keyboard's
 * predictive-text strip can change its height without firing a viewport event.
 */
export function useKeyboardInset(active: boolean): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const measure = () => {
      const next = keyboardInset(window.innerHeight, viewport.height, viewport.offsetTop);
      setInset((current) => (current === next ? current : next));
    };

    measure();
    viewport.addEventListener('resize', measure);
    viewport.addEventListener('scroll', measure);

    let frame = 0;
    if (active) {
      const loop = () => {
        measure();
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      viewport.removeEventListener('resize', measure);
      viewport.removeEventListener('scroll', measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [active]);

  return inset;
}
