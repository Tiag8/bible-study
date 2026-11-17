'use client';

import { useEffect, useState } from 'react';

/**
 * True while a top bar should be tucked away: the reader scrolled down the page.
 * It comes back on any scroll up and near the top of the page. `locked` keeps it
 * visible (for example while a sheet is open).
 */
export function useHideOnScrollDown(locked = false): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (locked) {
      setHidden(false);
      return;
    }

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      // Ignore tiny movements (finger jitter, elastic bounce at the edges).
      if (Math.abs(delta) < 8) return;
      setHidden(delta > 0 && y > 96);
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [locked]);

  return hidden;
}
