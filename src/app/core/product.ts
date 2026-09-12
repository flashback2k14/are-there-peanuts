/** The subset of an Open Food Facts product this app reads. */
export interface OffProduct {
  code: string;
  product_name?: string;
  product_name_de?: string;
  product_name_en?: string;
  brands?: string;
  image_front_small_url?: string;
  allergens_tags?: string[];
  traces_tags?: string[];
  ingredients_text?: string;
  ingredients_text_de?: string;
  ingredients_text_en?: string;
  states_tags?: string[];
}

export const OFF_FIELDS = [
  'code',
  'product_name',
  'product_name_de',
  'product_name_en',
  'brands',
  'image_front_small_url',
  'allergens_tags',
  'traces_tags',
  'ingredients_text',
  'ingredients_text_de',
  'ingredients_text_en',
  'states_tags',
] as const;

export const INGREDIENT_FIELDS = [
  'ingredients_text_de',
  'ingredients_text_en',
  'ingredients_text',
] as const satisfies readonly (keyof OffProduct)[];

export type IngredientField = (typeof INGREDIENT_FIELDS)[number];

/** Ordered from most to least severe. */
export type Verdict = 'contains' | 'may-contain' | 'not-declared' | 'unknown';

export type Lang = 'de' | 'en';

export function productName(product: OffProduct, lang: Lang): string | undefined {
  const localized = lang === 'de' ? product.product_name_de : product.product_name_en;
  return (localized || product.product_name || product.product_name_de || product.product_name_en)?.trim() || undefined;
}

/** Picks the ingredient list in the UI language, falling back to whatever exists. */
export function ingredientsText(product: OffProduct, lang: Lang): string | undefined {
  const order: IngredientField[] =
    lang === 'de'
      ? ['ingredients_text_de', 'ingredients_text', 'ingredients_text_en']
      : ['ingredients_text_en', 'ingredients_text', 'ingredients_text_de'];
  return order.map((field) => product[field]?.trim()).find((text) => !!text);
}
