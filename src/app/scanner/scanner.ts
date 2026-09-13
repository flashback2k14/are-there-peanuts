import {
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { normalizeBarcode } from '../core/barcode';
import { I18n } from '../core/i18n/i18n';
import { Mascot } from '../core/mascot';
import { Detector, createDetector } from './detector';

type ScannerState = 'idle' | 'starting' | 'scanning' | 'denied' | 'no-camera' | 'insecure' | 'failed';

type TorchConstraint = MediaTrackConstraintSet & { torch: boolean };

const SCAN_INTERVAL_MS = 150;
const BURST_DELAY_MS = 320;

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss',
  host: { '[attr.data-state]': 'state()' },
})
export class Scanner {
  /** Emits a normalised barcode once it was read in two consecutive frames. */
  readonly detected = output<string>();

  protected readonly t = inject(I18n).t;
  private readonly mascot = inject(Mascot);
  private readonly document = inject(DOCUMENT);
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  protected readonly state = signal<ScannerState>('idle');
  protected readonly torchAvailable = signal(false);
  protected readonly torchOn = signal(false);
  protected readonly burst = signal<{ x: number; y: number } | undefined>(undefined);
  protected readonly announcement = signal('');

  protected readonly canStart = computed(() => !['insecure', 'no-camera', 'scanning'].includes(this.state()));
  protected readonly message = computed(() => {
    switch (this.state()) {
      case 'denied':
        return this.t('scan.denied');
      case 'no-camera':
        return this.t('scan.noCamera');
      case 'insecure':
        return this.t('scan.insecure');
      case 'failed':
        return this.t('scan.failed');
      default:
        return this.t('scan.idle');
    }
  });

  private stream?: MediaStream;
  private detector?: Detector;
  private timer?: ReturnType<typeof setTimeout>;
  private candidate?: string;
  private resumeWhenVisible = false;
  private destroyed = false;

  constructor() {
    const onVisibilityChange = () => {
      if (this.document.hidden && this.state() === 'scanning') {
        this.resumeWhenVisible = true;
        this.stop();
      } else if (!this.document.hidden && this.resumeWhenVisible) {
        this.resumeWhenVisible = false;
        void this.start();
      }
    };
    this.document.addEventListener('visibilitychange', onVisibilityChange);

    afterNextRender(() => void this.startIfAllowed());

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.document.removeEventListener('visibilitychange', onVisibilityChange);
      this.stop();
      this.mascot.mood.set('rest');
    });
  }

  async start(): Promise<void> {
    const win = this.document.defaultView;
    if (!win?.isSecureContext) {
      this.state.set('insecure');
      return;
    }
    const media = win.navigator.mediaDevices;
    if (!media?.getUserMedia) {
      this.state.set('no-camera');
      return;
    }

    this.state.set('starting');
    try {
      const stream = await media.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (this.destroyed) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream = stream;
      const video = this.video().nativeElement;
      video.srcObject = stream;
      await video.play();

      const track = stream.getVideoTracks()[0];
      const capabilities = track?.getCapabilities?.() as { torch?: boolean } | undefined;
      this.torchAvailable.set(!!capabilities?.torch);
      this.state.set('scanning');
      this.mascot.mood.set('searching');

      this.detector ??= await createDetector(win, this.document.baseURI);
      this.scheduleScan();
    } catch (error) {
      this.stop();
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        this.state.set('denied');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        this.state.set('no-camera');
      } else {
        this.state.set('failed');
      }
    }
  }

  stop(): void {
    clearTimeout(this.timer);
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    this.candidate = undefined;
    this.torchOn.set(false);
    const video = this.video().nativeElement;
    video.srcObject = null;
    if (this.state() === 'scanning' || this.state() === 'starting') {
      this.state.set('idle');
    }
    if (this.mascot.mood() === 'searching') {
      this.mascot.mood.set('rest');
    }
  }

  protected async toggleTorch(): Promise<void> {
    const track = this.stream?.getVideoTracks()[0];
    if (!track) {
      return;
    }
    const next = !this.torchOn();
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as TorchConstraint] });
      this.torchOn.set(next);
    } catch {
      this.torchAvailable.set(false);
    }
  }

  /** Starts right away when the camera permission was granted before. */
  private async startIfAllowed(): Promise<void> {
    const win = this.document.defaultView;
    if (!win?.isSecureContext) {
      this.state.set('insecure');
      return;
    }
    try {
      const status = await win.navigator.permissions?.query({ name: 'camera' as PermissionName });
      if (status?.state === 'granted' && !this.destroyed) {
        await this.start();
      }
    } catch {
      // Permissions API without camera support (Firefox): wait for the button.
    }
  }

  private scheduleScan(): void {
    this.timer = setTimeout(async () => {
      if (this.state() !== 'scanning') {
        return;
      }
      const code = await this.scanFrame();
      if (!code && this.state() === 'scanning') {
        this.scheduleScan();
      }
    }, SCAN_INTERVAL_MS);
  }

  private async scanFrame(): Promise<string | undefined> {
    const video = this.video().nativeElement;
    if (!this.detector || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return undefined;
    }
    let results;
    try {
      results = await this.detector.detect(video);
    } catch {
      return undefined;
    }
    const hit = results
      .map((result) => ({ code: normalizeBarcode(result.rawValue), box: result.boundingBox }))
      .find((result) => result.code);
    if (!hit?.code) {
      this.candidate = undefined;
      return undefined;
    }
    if (hit.code !== this.candidate) {
      this.candidate = hit.code;
      return undefined;
    }
    this.confirm(hit.code, hit.box, video);
    return hit.code;
  }

  private confirm(code: string, box: DOMRectReadOnly, video: HTMLVideoElement): void {
    const win = this.document.defaultView;
    const reducedMotion = win?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;

    this.burst.set(this.burstPosition(box, video));
    this.mascot.mood.set('found');
    this.announcement.set(this.t('scan.found', { code }));
    win?.navigator.vibrate?.(60);

    setTimeout(() => {
      this.stop();
      this.detected.emit(code);
    }, reducedMotion ? 0 : BURST_DELAY_MS);
  }

  /** Maps the barcode's box from video pixels to percentages of the object-fit: cover element. */
  private burstPosition(box: DOMRectReadOnly, video: HTMLVideoElement): { x: number; y: number } {
    const { clientWidth: width, clientHeight: height, videoWidth, videoHeight } = video;
    if (!videoWidth || !videoHeight || !width || !height) {
      return { x: 50, y: 50 };
    }
    const scale = Math.max(width / videoWidth, height / videoHeight);
    const offsetX = (width - videoWidth * scale) / 2;
    const offsetY = (height - videoHeight * scale) / 2;
    const clamp = (value: number) => Math.min(100, Math.max(0, value));
    return {
      x: clamp(((offsetX + (box.x + box.width / 2) * scale) / width) * 100),
      y: clamp(((offsetY + (box.y + box.height / 2) * scale) / height) * 100),
    };
  }
}
