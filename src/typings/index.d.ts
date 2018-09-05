type DefaultedGlobalOptions = {
  lang: string;
  defaultLang: string;
  fallback: string;
};

type GlobalOptions = {
  lang: string;
  defaultLang?: string;
  fallback?: string;
};

type DefaultedTranslationOptions = {
  interpolations: InterpolationValues;
  postprocessors: Postprocessor[];
};

type TranslationOptions = {
  interpolations?: InterpolationValues;
  postprocessors?: Postprocessor[];
};

type TranslationInput = [Translations] | Translations;
type Translations = { [key: string]: any };
type TranslationValue = Translations | string | null;

type PluralizeKey = "plural" | "singular" | "none";

type InterpolationValue = string | number;
type InterpolationValues = {
  [key: string]: InterpolationValue;
};

type Postprocessor = (translation: string) => string;
