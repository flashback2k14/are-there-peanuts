import { expandUpcE, hasValidCheckDigit, normalizeBarcode } from './barcode';

describe('barcode', () => {
  it('accepts valid EAN-13 and EAN-8 check digits', () => {
    expect(hasValidCheckDigit('3017620422003')).toBe(true);
    expect(hasValidCheckDigit('4014400400007')).toBe(true);
    expect(hasValidCheckDigit('20005733')).toBe(true);
  });

  it('rejects a wrong check digit', () => {
    expect(hasValidCheckDigit('3017620422004')).toBe(false);
  });

  it('expands UPC-E to UPC-A', () => {
    expect(expandUpcE('04252614')).toBe('042100005264');
  });

  it('normalises UPC-A and UPC-E to EAN-13', () => {
    expect(normalizeBarcode('036000291452')).toBe('0036000291452');
    expect(normalizeBarcode('04252614')).toBe('0042100005264');
  });

  it('keeps EAN-13 and EAN-8 and strips spaces', () => {
    expect(normalizeBarcode('3017 6204 2200 3')).toBe('3017620422003');
    expect(normalizeBarcode('20005733')).toBe('20005733');
  });

  it('rejects anything that is not a product barcode', () => {
    expect(normalizeBarcode('')).toBeUndefined();
    expect(normalizeBarcode('abc')).toBeUndefined();
    expect(normalizeBarcode('12345')).toBeUndefined();
    expect(normalizeBarcode('3017620422004')).toBeUndefined();
  });
});
