/**
 * GTIN helpers for the barcodes printed on food packaging
 * (EAN-13, EAN-8, UPC-A, UPC-E).
 */

const DIGITS_ONLY = /^\d+$/;

/** Validates the trailing check digit of a GTIN-8/12/13/14. */
export function hasValidCheckDigit(code: string): boolean {
  if (!DIGITS_ONLY.test(code) || ![8, 12, 13, 14].includes(code.length)) {
    return false;
  }
  const digits = [...code].map(Number);
  const check = digits.pop()!;
  const sum = digits
    .reverse()
    .reduce((acc, digit, index) => acc + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

/** Expands a zero-suppressed UPC-E code (8 digits, number system 0 or 1) to UPC-A. */
export function expandUpcE(code: string): string | undefined {
  if (!/^[01]\d{7}$/.test(code)) {
    return undefined;
  }
  const [system, d1, d2, d3, d4, d5, d6, check] = [...code];
  let body: string;
  switch (d6) {
    case '0':
    case '1':
    case '2':
      body = `${d1}${d2}${d6}0000${d3}${d4}${d5}`;
      break;
    case '3':
      body = `${d1}${d2}${d3}00000${d4}${d5}`;
      break;
    case '4':
      body = `${d1}${d2}${d3}${d4}00000${d5}`;
      break;
    default:
      body = `${d1}${d2}${d3}${d4}${d5}0000${d6}`;
  }
  return `${system}${body}${check}`;
}

/**
 * Turns raw scanner or keyboard input into the code Open Food Facts expects,
 * or `undefined` if the input is not a valid product barcode.
 * UPC-A and UPC-E are normalised to EAN-13.
 */
export function normalizeBarcode(raw: string): string | undefined {
  const code = raw.replace(/[\s-]/g, '');
  if (!DIGITS_ONLY.test(code)) {
    return undefined;
  }
  if (code.length === 8) {
    if (hasValidCheckDigit(code)) {
      return code;
    }
    const upcA = expandUpcE(code);
    return upcA && hasValidCheckDigit(upcA) ? `0${upcA}` : undefined;
  }
  if (code.length === 12) {
    return hasValidCheckDigit(code) ? `0${code}` : undefined;
  }
  if (code.length === 13) {
    return hasValidCheckDigit(code) ? code : undefined;
  }
  if (code.length === 14) {
    return hasValidCheckDigit(code) ? code.replace(/^0/, '') : undefined;
  }
  return undefined;
}
