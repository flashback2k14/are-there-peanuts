import { Service, signal } from '@angular/core';

export type MascotMood = 'rest' | 'searching' | 'found';

/** Mood of the little peanut in the wordmark; the scanner drives it. */
@Service()
export class Mascot {
  readonly mood = signal<MascotMood>('rest');
}
