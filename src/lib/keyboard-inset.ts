/**
 * Distance, in CSS pixels, between the bottom of the layout viewport and the
 * bottom of the visual viewport. On iOS Safari (and Android Chrome without
 * `interactive-widget=resizes-content`) the on-screen keyboard shrinks only the
 * visual viewport, so a `position: fixed; bottom: 0` element ends up under the
 * keyboard. Lifting it by this value keeps it right above the keyboard.
 */
export function keyboardInset(
  layoutHeight: number,
  visualHeight: number,
  visualOffsetTop: number
): number {
  const inset = layoutHeight - visualHeight - visualOffsetTop;
  // Sub-pixel noise and overscroll bounce can give tiny or negative values.
  return inset > 1 ? Math.round(inset) : 0;
}
