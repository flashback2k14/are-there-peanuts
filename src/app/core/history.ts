import { Service, effect, signal } from '@angular/core';
import { Verdict } from './product';

export type HistoryVerdict = Verdict | 'not-found';

export interface HistoryEntry {
  code: string;
  name?: string;
  brand?: string;
  verdict: HistoryVerdict;
  checkedAt: number;
}

const STORAGE_KEY = 'atp.history';
const MAX_ENTRIES = 50;

function load(): HistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter(
          (entry): entry is HistoryEntry =>
            typeof entry?.code === 'string' && typeof entry?.verdict === 'string',
        )
      : [];
  } catch {
    return [];
  }
}

/** The locally stored list of recently checked products, newest first. */
@Service()
export class ScanHistory {
  private readonly state = signal<HistoryEntry[]>(load());
  readonly entries = this.state.asReadonly();

  constructor() {
    effect(() => {
      const entries = this.state();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch {
        // Without storage the history simply lives for this visit.
      }
    });
  }

  record(entry: HistoryEntry): void {
    this.state.update((entries) =>
      [entry, ...entries.filter((existing) => existing.code !== entry.code)].slice(0, MAX_ENTRIES),
    );
  }

  /** Removes one entry and returns a function that puts it back where it was. */
  remove(code: string): () => void {
    const before = this.state();
    this.state.set(before.filter((entry) => entry.code !== code));
    return () => this.state.set(before);
  }

  /** Empties the history and returns a function that restores it. */
  clear(): () => void {
    const before = this.state();
    this.state.set([]);
    return () => this.state.set(before);
  }
}
