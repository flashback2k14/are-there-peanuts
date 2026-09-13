import type { BarcodeFormat, DetectedBarcode } from 'barcode-detector/ponyfill';

export interface Detector {
  detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
}

interface NativeDetectorConstructor {
  new (options: { formats: string[] }): Detector;
  getSupportedFormats(): Promise<string[]>;
}

const FORMATS: BarcodeFormat[] = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

/**
 * Uses the browser's own BarcodeDetector when it reads EAN/UPC (Chrome on Android),
 * otherwise loads the zxing WebAssembly ponyfill from this app's own /wasm/ folder.
 */
export async function createDetector(win: Window, baseUri: string): Promise<Detector> {
  const Native = (win as Window & { BarcodeDetector?: NativeDetectorConstructor }).BarcodeDetector;
  if (Native) {
    try {
      const supported = await Native.getSupportedFormats();
      if (FORMATS.every((format) => supported.includes(format))) {
        return new Native({ formats: FORMATS });
      }
    } catch {
      // Fall through to the ponyfill.
    }
  }

  const { BarcodeDetector, prepareZXingModule } = await import('barcode-detector/ponyfill');
  prepareZXingModule({
    overrides: {
      locateFile: (path: string, prefix: string) =>
        path.endsWith('.wasm') ? new URL(`wasm/${path}`, baseUri).href : prefix + path,
    },
  });
  return new BarcodeDetector({ formats: FORMATS });
}
