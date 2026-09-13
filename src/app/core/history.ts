import { Service, signal } from '@angular/core';
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

  private readonly unsaved = signal(false);
  /** True when the last change couldn't be stored (e.g. private mode), so the history only lasts for this visit. */
  readonly changesUnsaved = this.unsaved.asReadonly();

  record(entry: HistoryEntry): void {
    this.commit(
      [entry, ...this.state().filter((existing) => existing.code !== entry.code)].slice(0, MAX_ENTRIES),
    );
  }

  /** Removes one entry and returns a function that puts it back where it was. */
  remove(code: string): () => void {
    const before = this.state();
    this.commit(before.filter((entry) => entry.code !== code));
    return () => this.commit(before);
  }

  /** Empties the history and returns a function that restores it. */
  clear(): () => void {
    const before = this.state();
    this.commit([]);
    return () => this.commit(before);
  }

  private commit(entries: HistoryEntry[]): void {
    this.state.set(entries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      this.unsaved.set(false);
    } catch {
      this.unsaved.set(true);
    }
  }
}
