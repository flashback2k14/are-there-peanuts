import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.setItem('atp.lang', 'de');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('names the wordmark link for assistive technology', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const wordmark = (fixture.nativeElement as HTMLElement).querySelector('.wordmark');
    expect(wordmark?.getAttribute('aria-label')).toContain('Are there peanuts?');
  });

  it('switches the interface language', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.foot__line')?.textContent).toContain('Im Zweifel zählt die Packung.');

    element.querySelector<HTMLButtonElement>('button[lang="en"]')?.click();
    await fixture.whenStable();

    expect(element.querySelector('.foot__line')?.textContent).toContain('When in doubt, trust the label.');
    expect(element.querySelector('button[lang="en"]')?.getAttribute('aria-pressed')).toBe('true');
  });
});
