import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n';
import { DICTIONARIES } from './translations';

describe('I18n', () => {
  beforeEach(() => localStorage.setItem('atp.lang', 'de'));
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('fills placeholders', () => {
    const i18n = TestBed.inject(I18n);
    expect(i18n.t('scan.found', { code: '123' })).toBe('Code 123 erkannt.');
  });

  it('switches language, updates <html lang> and remembers the choice', () => {
    const i18n = TestBed.inject(I18n);
    i18n.select('en');
    TestBed.tick();
    expect(i18n.t('verdict.contains')).toBe('Contains peanuts.');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    expect(localStorage.getItem('atp.lang')).toBe('en');
    expect(i18n.choiceUnsaved()).toBe(false);
  });

  it('still switches but flags the choice as unsaved when storage is unavailable', () => {
    const i18n = TestBed.inject(I18n);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    i18n.select('en');
    expect(i18n.lang()).toBe('en');
    expect(i18n.choiceUnsaved()).toBe(true);
  });

  it('has an English text for every German key', () => {
    expect(Object.keys(DICTIONARIES.en).sort()).toEqual(Object.keys(DICTIONARIES.de).sort());
  });
});
