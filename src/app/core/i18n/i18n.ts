import { DOCUMENT, Service, computed, effect, inject, signal } from '@angular/core';
import { Lang } from '../product';
import { DICTIONARIES, TranslationKey } from './translations';

const STORAGE_KEY = 'atp.lang';

function readStoredLang(): Lang | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'de' || stored === 'en' ? stored : undefined;
  } catch {
    return undefined;
  }
}

@Service()
export class I18n {
  private readonly document = inject(DOCUMENT);

  private readonly current = signal<Lang>(
    readStoredLang() ??
      (this.document.defaultView?.navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'),
  );
  readonly lang = this.current.asReadonly();

  private readonly unsaved = signal(false);
  /** True when the last choice couldn't be stored (e.g. private mode), so it only lasts for this visit. */
  readonly choiceUnsaved = this.unsaved.asReadonly();

  private readonly dictionary = computed(() => DICTIONARIES[this.lang()]);

  /** Bound so templates can use `t('key')` after `protected readonly t = inject(I18n).t`. */
  readonly t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const template = this.dictionary()[key];
    return params
      ? template.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? ''))
      : template;
  };

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.lang();
    });
  }

  /** Switches the language and remembers it for the next visit, if the browser lets us. */
  select(lang: Lang): void {
    this.current.set(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      this.unsaved.set(false);
    } catch {
      this.unsaved.set(true);
    }
  }
}
