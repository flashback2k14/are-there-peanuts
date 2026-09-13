import { Component, inject } from '@angular/core';
import { Mascot } from '../core/mascot';

/** The one character on the page: a peanut built from two overlapping circles. */
@Component({
  selector: 'app-peanut-mark',
  template: `<span class="lobe"></span><span class="lobe"></span>`,
  host: { 'aria-hidden': 'true', '[attr.data-mood]': 'mascot.mood()' },
  styles: `
    :host {
      position: relative;
      display: inline-block;
      inline-size: 1.02em;
      block-size: 0.6em;
      vertical-align: -0.02em;
      rotate: -10deg;
    }
    .lobe {
      position: absolute;
      inset-block-start: 0;
      inline-size: 0.6em;
      block-size: 0.6em;
      border-radius: 50%;
      background-color: var(--color-accent);
      background-image:
        radial-gradient(circle at 32% 34%, var(--color-accent-deep) 0 0.035em, transparent 0.05em),
        radial-gradient(circle at 66% 64%, var(--color-accent-deep) 0 0.035em, transparent 0.05em);
      box-shadow: inset 0 0 0 0.055em var(--color-ink);
    }
    .lobe:first-child {
      inset-inline-start: 0;
    }
    .lobe:last-child {
      inset-inline-end: 0;
      inset-block-start: 0.03em;
      inline-size: 0.54em;
      block-size: 0.54em;
    }
    :host([data-mood='searching']) {
      animation: breathe 4s var(--ease-in-out) infinite;
    }
    :host([data-mood='found']) {
      animation: wiggle var(--dur-long) var(--ease-out) 1;
    }
    @keyframes breathe {
      50% {
        scale: 1.08;
      }
    }
    @keyframes wiggle {
      30% {
        rotate: -24deg;
        scale: 1.18;
      }
      65% {
        rotate: 6deg;
      }
      100% {
        rotate: -10deg;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none !important;
      }
    }
  `,
})
export class PeanutMark {
  protected readonly mascot = inject(Mascot);
}
