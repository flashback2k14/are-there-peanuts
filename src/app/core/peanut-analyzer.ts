import { INGREDIENT_FIELDS, OffProduct, Verdict } from './product';

export type MatchLevel = 'contains' | 'may-contain';

export type Reason =
  | { kind: 'allergen-tag' }
  | { kind: 'trace-tag' }
  | { kind: 'text'; level: MatchLevel; term: string };

export interface Analysis {
  verdict: Verdict;
  reasons: Reason[];
  /** Open Food Facts marks the ingredient data as unfinished, or there is none. */
  incomplete: boolean;
}

export interface TextMatch {
  start: number;
  end: number;
  term: string;
  level: MatchLevel;
}

export interface Segment {
  text: string;
  mark?: MatchLevel;
}

/**
 * Peanut words in the languages that show up on German shelves.
 * The trailing \p{L}* swallows compounds such as "Erdnussöl" or "peanuts".
 * "arachid" is limited to the real words so "Arachidonsäure" (a fatty acid
 * in infant formula) does not trigger a false alarm.
 */
const PEANUT_TERM =
  /(?:erdn(?:uss|üss|uß)|peanut|groundnut|cacahu[eèa]te|pinda|amendoim|arachid(?:es|e|i)(?!\p{L})|arachis(?!\p{L}))\p{L}*/giu;

/** A sentence containing one of these talks about possible traces, not a recipe ingredient. */
const TRACE_MARKER =
  /spuren|\bk(?:ann|önnen)\b[^.]*\benthalten|verarbeitet|hergestellt in einem betrieb|may (?:also )?contain|traces?\b|processe[sd]|facility|peut contenir|traces? éventuelles|puede contener|pu[oò] contenere|tracce|kan sporen|sporen/iu;

const NEGATION_BEFORE =
  /(?:ohne|frei von|free (?:from|of)|without|sans|kein\p{L}*|no)\s+(?:\p{L}+\s+)?$/iu;
const NEGATION_AFTER = /^\s*-?\s*(?:frei|free)\b/iu;
const NEGATED_WORD = /(?:frei|free)$/iu;

const PEANUT_TAG = /^en:peanuts?$/;
const INCOMPLETE_STATES = ['en:ingredients-to-be-completed'];

/** Splits text into sentences, keeping offsets. A dot inside "1.5" is not a boundary. */
function sentences(text: string): { start: number; end: number }[] {
  const result: { start: number; end: number }[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isBoundary =
      char === ';' ||
      char === '!' ||
      char === '?' ||
      char === '\n' ||
      (char === '.' && (i + 1 === text.length || /\s/.test(text[i + 1])));
    if (isBoundary) {
      result.push({ start, end: i + 1 });
      start = i + 1;
    }
  }
  if (start < text.length) {
    result.push({ start, end: text.length });
  }
  return result;
}

/** Finds peanut mentions in a free-text ingredient list. */
export function findPeanutMentions(text: string): TextMatch[] {
  const matches: TextMatch[] = [];
  for (const { start, end } of sentences(text)) {
    const sentence = text.slice(start, end);
    const level: MatchLevel = TRACE_MARKER.test(sentence) ? 'may-contain' : 'contains';
    for (const match of sentence.matchAll(PEANUT_TERM)) {
      const term = match[0];
      const offset = match.index;
      const before = sentence.slice(0, offset);
      const after = sentence.slice(offset + term.length);
      if (NEGATED_WORD.test(term) || NEGATION_AFTER.test(after) || NEGATION_BEFORE.test(before)) {
        continue;
      }
      matches.push({ start: start + offset, end: start + offset + term.length, term, level });
    }
  }
  return matches;
}

/** Cuts an ingredient list into plain and highlighted pieces for rendering. */
export function segmentIngredients(text: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  for (const match of findPeanutMentions(text)) {
    if (match.start > cursor) {
      segments.push({ text: text.slice(cursor, match.start) });
    }
    segments.push({ text: text.slice(match.start, match.end), mark: match.level });
    cursor = match.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }
  return segments;
}

const SEVERITY: Record<Verdict, number> = {
  contains: 3,
  'may-contain': 2,
  'not-declared': 1,
  unknown: 0,
};

/** Decides whether a product contains peanuts. The strongest signal wins. */
export function analyze(product: OffProduct): Analysis {
  const reasons: Reason[] = [];
  let verdict: Verdict = 'unknown';
  const raise = (candidate: Verdict) => {
    if (SEVERITY[candidate] > SEVERITY[verdict]) {
      verdict = candidate;
    }
  };

  const allergens = product.allergens_tags ?? [];
  const traces = product.traces_tags ?? [];
  if (allergens.some((tag) => PEANUT_TAG.test(tag))) {
    reasons.push({ kind: 'allergen-tag' });
    raise('contains');
  }
  if (traces.some((tag) => PEANUT_TAG.test(tag))) {
    reasons.push({ kind: 'trace-tag' });
    raise('may-contain');
  }

  const texts = INGREDIENT_FIELDS.map((field) => product[field]?.trim()).filter(
    (text): text is string => !!text,
  );
  const seen = new Set<string>();
  for (const match of texts.flatMap(findPeanutMentions)) {
    const key = `${match.level}:${match.term.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      reasons.push({ kind: 'text', level: match.level, term: match.term });
    }
    raise(match.level);
  }

  const hasData = texts.length > 0 || allergens.length > 0 || traces.length > 0;
  if (hasData) {
    raise('not-declared');
  }

  const incomplete =
    texts.length === 0 ||
    (product.states_tags ?? []).some((state) => INCOMPLETE_STATES.includes(state));

  return { verdict, reasons, incomplete };
}
