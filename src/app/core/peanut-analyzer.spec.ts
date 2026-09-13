import { analyze, findPeanutMentions, segmentIngredients } from './peanut-analyzer';
import { OffProduct } from './product';

const product = (fields: Partial<OffProduct>): OffProduct => ({ code: '0', ...fields });

describe('analyze', () => {
  it('marks Nutella as not declared', () => {
    const result = analyze(
      product({
        allergens_tags: ['en:milk', 'en:nuts', 'en:soybeans'],
        traces_tags: [],
        ingredients_text_de:
          'Zucker, Palmöl, HASELNÜSSE 13 %, MAGERMILCHPULVER 8,7 %, fettarmer Kakao, Emulgator Lecithine (Soja), Vanillin',
      }),
    );
    expect(result.verdict).toBe('not-declared');
    expect(result.reasons).toEqual([]);
  });

  it('marks Toffifee as containing peanuts because of its allergen tag', () => {
    const result = analyze(
      product({
        allergens_tags: ['en:milk', 'en:nuts', 'en:peanuts', 'en:soybeans'],
        traces_tags: ['en:nuts', 'en:peanuts'],
        ingredients_text_de:
          'Zucker, pflanzliche Fette (Palm, Shea), Haselnüsse, Glukosesirup. Kann auch Mandel, Erdnuss und andere Nüsse enthalten.',
      }),
    );
    expect(result.verdict).toBe('contains');
    expect(result.reasons).toContainEqual({ kind: 'allergen-tag' });
    expect(result.reasons).toContainEqual({ kind: 'trace-tag' });
    expect(result.reasons).toContainEqual({ kind: 'text', level: 'may-contain', term: 'Erdnuss' });
  });

  it('reads a trace warning from the ingredient text', () => {
    const result = analyze(
      product({ ingredients_text: 'Zucker, Kakaobutter. Kann Spuren von Erdnüssen enthalten.' }),
    );
    expect(result.verdict).toBe('may-contain');
  });

  it('treats compound words like Erdnussöl as an ingredient', () => {
    const result = analyze(product({ ingredients_text_de: 'Erdnussöl, Salz' }));
    expect(result.verdict).toBe('contains');
    expect(result.reasons).toContainEqual({ kind: 'text', level: 'contains', term: 'Erdnussöl' });
  });

  it('keeps the ingredient sentence separate from a later trace sentence', () => {
    const result = analyze(
      product({ ingredients_text_en: 'Peanuts (25%), sugar 1.5%, salt. May contain traces of other nuts.' }),
    );
    expect(result.verdict).toBe('contains');
  });

  it('ignores negated mentions', () => {
    expect(analyze(product({ ingredients_text: 'Hergestellt ohne Erdnüsse.' })).verdict).toBe(
      'not-declared',
    );
    expect(analyze(product({ ingredients_text: 'Oats, honey. Peanut-free.' })).verdict).toBe(
      'not-declared',
    );
  });

  it('does not confuse arachidonic acid with peanuts', () => {
    const result = analyze(product({ ingredients_text_de: 'Magermilch, Arachidonsäure, Vitamin D' }));
    expect(result.verdict).toBe('not-declared');
  });

  it('recognises French and English words', () => {
    expect(analyze(product({ ingredients_text: 'Sucre, arachides grillées' })).verdict).toBe(
      'contains',
    );
    expect(analyze(product({ ingredients_text: 'sugar, groundnut oil' })).verdict).toBe('contains');
  });

  it('reports unknown when there is no data at all', () => {
    const result = analyze(product({}));
    expect(result.verdict).toBe('unknown');
    expect(result.incomplete).toBe(true);
  });

  it('flags ingredient lists that Open Food Facts marks as unfinished', () => {
    const result = analyze(
      product({ ingredients_text: 'Zucker', states_tags: ['en:ingredients-to-be-completed'] }),
    );
    expect(result.incomplete).toBe(true);
  });
});

describe('segmentIngredients', () => {
  it('splits the text around highlighted peanut words', () => {
    expect(segmentIngredients('Zucker, Erdnüsse 20 %. Kann Spuren von Erdnuss enthalten.')).toEqual([
      { text: 'Zucker, ' },
      { text: 'Erdnüsse', mark: 'contains' },
      { text: ' 20 %. Kann Spuren von ' },
      { text: 'Erdnuss', mark: 'may-contain' },
      { text: ' enthalten.' },
    ]);
  });

  it('returns the whole text when nothing matches', () => {
    expect(findPeanutMentions('Wasser, Salz')).toEqual([]);
    expect(segmentIngredients('Wasser, Salz')).toEqual([{ text: 'Wasser, Salz' }]);
  });
});
