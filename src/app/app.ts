import { Component, inject } from '@angular/core';
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
}
