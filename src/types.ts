export interface DefaultedGlobalOptions {
  lang: string;
  defaultLang: string;
  fallback: string;
}

export interface GlobalOptions {
  lang: string;
  defaultLang?: string;
  fallback?: string;
}

export interface DefaultedTranslationOptions {
  interpolations: InterpolationValues;
  postprocessors: Postprocessor[];
}

export interface TranslationOptions {
  interpolations?: InterpolationValues;
  postprocessors?: Postprocessor[];
}

export type TranslationInput = [Translations] | Translations;
export interface Translations {
  [key: string]: any;
}
export type TranslationValue = Translations | string | null;

export type PluralizeKey = "plural" | "singular" | "none";

export type InterpolationValue = string | number;
export interface InterpolationValues {
  [key: string]: InterpolationValue;
}

export type Postprocessor = (translation: string) => string;
