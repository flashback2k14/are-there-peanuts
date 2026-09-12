import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Signal, computed } from '@angular/core';
import { OFF_FIELDS, OffProduct } from './product';

interface OffResponse {
  status: 0 | 1;
  product?: OffProduct;
}

export type LookupState =
  | { kind: 'loading' }
  | { kind: 'found'; product: OffProduct }
  | { kind: 'not-found' }
  | { kind: 'error'; rateLimited: boolean };

/** Base path of the Open Food Facts v2 API, proxied by nginx (prod) or the dev server. */
export const OFF_API = '/api/off';

export function offProductUrl(code: string): string {
  return `https://world.openfoodfacts.org/product/${encodeURIComponent(code)}`;
}

/**
 * Looks up a product by barcode. Must be called in an injection context
 * (e.g. a component field initializer).
 */
export function productLookup(code: Signal<string | undefined>) {
  const resource = httpResource<OffResponse>(() => {
    const value = code();
    return value
      ? `${OFF_API}/product/${encodeURIComponent(value)}.json?fields=${OFF_FIELDS.join(',')}`
      : undefined;
  });

  const state = computed<LookupState>(() => {
    const error = resource.error();
    if (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      if (status === 404) {
        return { kind: 'not-found' };
      }
      return { kind: 'error', rateLimited: status === 429 || status === 503 };
    }
    if (resource.isLoading() || !resource.hasValue()) {
      return { kind: 'loading' };
    }
    const response = resource.value();
    return response?.status === 1 && response.product
      ? { kind: 'found', product: response.product }
      : { kind: 'not-found' };
  });

  return { state, reload: () => resource.reload() };
}
