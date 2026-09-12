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

  readonly lang = signal<Lang>(
    readStoredLang() ??
      (this.document.defaultView?.navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'),
  );

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
      const lang = this.lang();
      this.document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Storage can be unavailable (private mode); the choice then lasts for this visit.
      }
    });
  }
}
