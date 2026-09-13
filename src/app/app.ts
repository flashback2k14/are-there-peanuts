import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { I18n } from './core/i18n/i18n';
import { PeanutMark } from './shared/peanut-mark';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, PeanutMark],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  private readonly langDe = viewChild.required<ElementRef<HTMLButtonElement>>('langDe');
  private readonly langEn = viewChild.required<ElementRef<HTMLButtonElement>>('langEn');

  /** Once dismissed, the notice stays away for the rest of the visit. */
  private readonly langNoticeDismissed = signal(false);
  protected readonly showLangNotice = computed(
    () => this.i18n.choiceUnsaved() && !this.langNoticeDismissed(),
  );

  protected dismissLangNotice(): void {
    this.langNoticeDismissed.set(true);
    // The OK button disappears with the notice; hand focus back to the language the user picked.
    (this.i18n.lang() === 'de' ? this.langDe() : this.langEn()).nativeElement.focus();
  }
}
