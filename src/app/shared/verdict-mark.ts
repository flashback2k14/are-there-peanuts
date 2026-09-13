import { Component, input } from '@angular/core';
import { HistoryVerdict } from '../core/history';

export type MarkKind = HistoryVerdict | 'error';

/**
 * A shape per verdict (✕ ! ✓ ? –) so the result never depends on colour alone.
 * The glyph takes its colour from `--mark-glyph`, set by the surrounding surface.
 */
@Component({
  selector: 'app-verdict-mark',
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      @switch (verdict()) {
        @case ('contains') {
          <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" />
        }
        @case ('may-contain') {
          <path d="M12 5.5v8" />
          <circle cx="12" cy="18" r="0.6" fill="currentColor" />
        }
        @case ('not-declared') {
          <path d="M6.5 12.5l3.8 3.8L17.5 8.5" />
        }
        @case ('unknown') {
          <path d="M9 9.2a3 3 0 1 1 4.3 2.7c-.8.4-1.3 1.1-1.3 2v.3" />
          <circle cx="12" cy="18" r="0.6" fill="currentColor" />
        }
        @case ('error') {
          <path d="M12 5.5v8" />
          <circle cx="12" cy="18" r="0.6" fill="currentColor" />
        }
        @default {
          <path d="M7 12h10" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      --size: var(--mark-size, 3.5rem);
      display: inline-grid;
      place-items: center;
      flex: none;
      inline-size: var(--size);
      block-size: var(--size);
      border-radius: 50%;
      background: var(--color-ink);
      color: var(--mark-glyph, var(--color-paper));
    }
    svg {
      inline-size: 58%;
      block-size: 58%;
    }
  `,
})
export class VerdictMark {
  /** `loading` renders the neutral dash, like `not-found`. */
  readonly verdict = input.required<MarkKind | 'loading'>();
}
