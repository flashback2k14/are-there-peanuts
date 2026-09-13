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

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

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
    expect(element.querySelector('.lang-notice__box')).toBeNull();
  });

  it('tells the user when the language choice cannot be remembered', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    element.querySelector<HTMLButtonElement>('button[lang="en"]')?.click();
    await fixture.whenStable();

    const notice = element.querySelector('[role="status"]');
    expect(notice?.textContent).toContain('only applies to this visit');

    notice?.querySelector('button')?.click();
    await fixture.whenStable();

    expect(element.querySelector('.lang-notice__box')).toBeNull();
    expect(document.activeElement).toBe(element.querySelector('button[lang="en"]'));
  });
});
