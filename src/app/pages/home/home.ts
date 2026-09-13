import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, form, required, submit, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { normalizeBarcode } from '../../core/barcode';
import { HistoryEntry, HistoryVerdict, ScanHistory } from '../../core/history';
import { I18n } from '../../core/i18n/i18n';
import { Scanner } from '../../scanner/scanner';
import { VerdictMark } from '../../shared/verdict-mark';

interface Toast {
  message: string;
  undo: () => void;
}

const TOAST_MS = 8000;

@Component({
  selector: 'app-home',
  imports: [Scanner, VerdictMark, RouterLink, FormField],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly t = inject(I18n).t;
  private readonly router = inject(Router);
  private readonly history = inject(ScanHistory);
  private readonly injector = inject(Injector);
  private readonly undoButton = viewChild<ElementRef<HTMLButtonElement>>('undoButton');

  protected readonly entries = this.history.entries;
  protected readonly historyUnsaved = this.history.changesUnsaved;
  protected readonly countLabel = computed(() =>
    this.t(this.entries().length === 1 ? 'history.countLabelOne' : 'history.countLabel'),
  );

  protected readonly model = signal({ code: '' });
  protected readonly manualForm = form(this.model, (path) => {
    required(path.code);
    validate(path.code, ({ value }) =>
      value().trim() && !normalizeBarcode(value()) ? { kind: 'invalid' } : undefined,
    );
  });
  protected readonly showError = computed(() => {
    const field = this.manualForm.code();
    return field.touched() && field.invalid();
  });
  protected readonly helpText = computed(() => {
    if (!this.showError()) {
      return this.t('manual.helper');
    }
    return this.manualForm
      .code()
      .errors()
      .some((error) => error.kind === 'required')
      ? this.t('manual.required')
      : this.t('manual.invalid');
  });

  protected readonly toast = signal<Toast | undefined>(undefined);
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.toastTimer));
  }

  protected open(code: string): void {
    void this.router.navigate(['/product', code]);
  }

  protected submitManual(event: Event): void {
    event.preventDefault();
    void submit(this.manualForm, async () => {
      const code = normalizeBarcode(this.model().code);
      if (code) {
        await this.router.navigate(['/product', code]);
      }
    });
  }

  protected label(entry: HistoryEntry): string {
    return entry.name || this.t('history.unnamed', { code: entry.code });
  }

  protected verdictShort(verdict: HistoryVerdict): string {
    return this.t(`verdictShort.${verdict}` as const);
  }

  protected remove(entry: HistoryEntry): void {
    const undo = this.history.remove(entry.code);
    this.showToast({ message: this.t('history.removed', { name: this.label(entry) }), undo });
  }

  protected clear(): void {
    const undo = this.history.clear();
    this.showToast({ message: this.t('history.cleared'), undo });
  }

  protected undo(): void {
    this.toast()?.undo();
    this.dismissToast();
  }

  protected holdToast(): void {
    clearTimeout(this.toastTimer);
  }

  protected releaseToast(): void {
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.dismissToast(), TOAST_MS);
  }

  private showToast(toast: Toast): void {
    this.toast.set(toast);
    this.releaseToast();
    // The removed button took focus with it; hand it to Undo so keyboard users keep their place.
    afterNextRender(() => this.undoButton()?.nativeElement.focus(), { injector: this.injector });
  }

  private dismissToast(): void {
    clearTimeout(this.toastTimer);
    this.toast.set(undefined);
  }
}
