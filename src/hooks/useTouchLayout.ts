'use client';

import { useEffect, useState } from 'react';

/** Phones and tablets: a touch pointer, or a narrow window. */
const TOUCH_LAYOUT_QUERY = '(pointer: coarse), (max-width: 767px)';

/**
 * True when the touch editing UI should be used (formatting bar above the
 * keyboard instead of the floating selection menu).
 */
export function isTouchLayout(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(TOUCH_LAYOUT_QUERY).matches;
}

export function useTouchLayout(): boolean {
  const [matches, setMatches] = useState(isTouchLayout);

  useEffect(() => {
    const query = window.matchMedia(TOUCH_LAYOUT_QUERY);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return matches;
}
