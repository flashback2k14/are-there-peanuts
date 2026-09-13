import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { normalizeBarcode } from '../../core/barcode';
import { ScanHistory } from '../../core/history';
import { I18n } from '../../core/i18n/i18n';
import { offProductUrl, productLookup } from '../../core/open-food-facts';
import { Reason, analyze, segmentIngredients } from '../../core/peanut-analyzer';
import { Verdict, ingredientsText, productName } from '../../core/product';
import { VerdictMark } from '../../shared/verdict-mark';

type Surface = Verdict | 'not-found' | 'loading' | 'error';

const APP_NAME = 'Are there peanuts?';

@Component({
  selector: 'app-product',
  imports: [RouterLink, VerdictMark],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductPage {
  /** Bound from the `:code` route parameter. */
  readonly code = input.required<string>();

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  private readonly history = inject(ScanHistory);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('verdictHeading');

  protected readonly normalized = computed(() => normalizeBarcode(this.code()));
  private readonly lookup = productLookup(this.normalized);
  protected readonly state = this.lookup.state;

  protected readonly product = computed(() => {
    const state = this.state();
    return state.kind === 'found' ? state.product : undefined;
  });
  protected readonly analysis = computed(() => {
    const product = this.product();
    return product ? analyze(product) : undefined;
  });

  protected readonly surface = computed<Surface>(() => {
    if (!this.normalized()) {
      return 'not-found';
    }
    const state = this.state();
    switch (state.kind) {
      case 'found':
        return this.analysis()?.verdict ?? 'unknown';
      default:
        return state.kind;
    }
  });

  protected readonly headline = computed(() => {
    const surface = this.surface();
    const state = this.state();
    if (surface === 'loading') {
      return this.t('product.loading', { code: this.normalized() ?? this.code() });
    }
    if (surface === 'error') {
      return this.t(state.kind === 'error' && state.rateLimited ? 'product.rateLimited' : 'product.error');
    }
    return this.t(`verdict.${surface}` as const);
  });

  protected readonly note = computed(() => {
    const surface = this.surface();
    if (surface === 'loading' || surface === 'error') {
      return undefined;
    }
    if (surface === 'not-found') {
      const code = this.normalized();
      return code
        ? this.t('note.not-found', { code })
        : this.t('note.invalid', { code: this.code() });
    }
    return this.t(`note.${surface}` as const);
  });

  protected readonly name = computed(() => {
    const product = this.product();
    return product ? productName(product, this.i18n.lang()) : undefined;
  });
  protected readonly brand = computed(() => this.product()?.brands?.split(',')[0]?.trim() || undefined);

  protected readonly segments = computed(() => {
    const product = this.product();
    const text = product ? ingredientsText(product, this.i18n.lang()) : undefined;
    return text ? segmentIngredients(text) : undefined;
  });
  protected readonly hasMarks = computed(() => this.segments()?.some((segment) => segment.mark) ?? false);

  protected readonly offUrl = computed(() => {
    const code = this.normalized();
    return code ? offProductUrl(code) : undefined;
  });
  protected readonly needsData = computed(() => ['unknown', 'not-found'].includes(this.surface()));

  private focusedFor?: string;

  constructor() {
    const title = inject(Title);

    effect(() => {
      const code = this.normalized();
      const state = this.state();
      if (!code) {
        return;
      }
      untracked(() => {
        if (state.kind === 'found') {
          this.history.record({
            code,
            name: productName(state.product, this.i18n.lang()),
            brand: this.brand(),
            verdict: analyze(state.product).verdict,
            checkedAt: Date.now(),
          });
        } else if (state.kind === 'not-found') {
          this.history.record({ code, verdict: 'not-found', checkedAt: Date.now() });
        }
      });
    });

    effect(() => {
      const surface = this.surface();
      title.setTitle(surface === 'loading' ? APP_NAME : `${this.headline()} · ${APP_NAME}`);
    });

    // Once the verdict is on screen, move focus to it so screen readers announce the result.
    afterRenderEffect(() => {
      const surface = this.surface();
      const element = this.heading()?.nativeElement;
      const key = `${this.code()}:${surface}`;
      if (element && surface !== 'loading' && this.focusedFor !== key) {
        this.focusedFor = key;
        element.focus({ preventScroll: true });
      }
    });
  }

  protected retry(): void {
    this.lookup.reload();
  }

  protected reasonText(reason: Reason): string {
    return reason.kind === 'text'
      ? this.t(`reason.text-${reason.level}` as const, { term: reason.term })
      : this.t(`reason.${reason.kind}` as const);
  }
}
