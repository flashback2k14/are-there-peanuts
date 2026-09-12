import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n';
import { DICTIONARIES } from './translations';

describe('I18n', () => {
  beforeEach(() => localStorage.setItem('atp.lang', 'de'));
  afterEach(() => localStorage.clear());

  it('fills placeholders', () => {
    const i18n = TestBed.inject(I18n);
    expect(i18n.t('scan.found', { code: '123' })).toBe('Code 123 erkannt.');
  });

  it('switches language, updates <html lang> and remembers the choice', () => {
    const i18n = TestBed.inject(I18n);
    i18n.lang.set('en');
    TestBed.tick();
    expect(i18n.t('verdict.contains')).toBe('Contains peanuts.');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    expect(localStorage.getItem('atp.lang')).toBe('en');
  });

  it('has an English text for every German key', () => {
    expect(Object.keys(DICTIONARIES.en).sort()).toEqual(Object.keys(DICTIONARIES.de).sort());
  });
});
