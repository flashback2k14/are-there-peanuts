import { TestBed } from '@angular/core/testing';
import { HistoryEntry, ScanHistory } from './history';

const entry = (code: string, checkedAt = 0): HistoryEntry => ({ code, verdict: 'not-declared', checkedAt });

describe('ScanHistory', () => {
  let history: ScanHistory;

  beforeEach(() => {
    localStorage.clear();
    history = TestBed.inject(ScanHistory);
  });

  it('puts the newest entry first and drops duplicates', () => {
    history.record(entry('1'));
    history.record(entry('2'));
    history.record(entry('1', 5));
    expect(history.entries().map((e) => e.code)).toEqual(['1', '2']);
    expect(history.entries()[0].checkedAt).toBe(5);
  });

  it('keeps at most 50 entries', () => {
    for (let i = 0; i < 60; i++) {
      history.record(entry(String(i)));
    }
    expect(history.entries().length).toBe(50);
    expect(history.entries()[0].code).toBe('59');
  });

  it('undoes a removal', () => {
    history.record(entry('1'));
    history.record(entry('2'));
    const undo = history.remove('1');
    expect(history.entries().map((e) => e.code)).toEqual(['2']);
    undo();
    expect(history.entries().map((e) => e.code)).toEqual(['2', '1']);
  });

  it('undoes clearing the history', () => {
    history.record(entry('1'));
    const undo = history.clear();
    expect(history.entries()).toEqual([]);
    undo();
    expect(history.entries().length).toBe(1);
  });

  afterEach(() => vi.restoreAllMocks());

  it('persists entries to localStorage', () => {
    history.record(entry('42'));
    expect(JSON.parse(localStorage.getItem('atp.history') ?? '[]')[0].code).toBe('42');
    expect(history.changesUnsaved()).toBe(false);
  });

  it('keeps entries in memory but flags them as unsaved when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    history.record(entry('42'));
    expect(history.entries().map((e) => e.code)).toEqual(['42']);
    expect(history.changesUnsaved()).toBe(true);
  });

  it('does not flag anything before the history changes', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    expect(history.changesUnsaved()).toBe(false);
  });
});
