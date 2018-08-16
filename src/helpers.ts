import { DEFAULT_INIT_OPTIONS, NONE, PLURAL, SINGULAR } from "./constants";

export function isObject(o: any): boolean {
  return o !== null && typeof o === "object";
}

export function flattenTranslations(
  translations: [Translations]
): Translations {
  return translations.reduce((p, n) => {
    if (isObject(n)) {
      return {
        ...p,
        ...n
      };
    }

    return p;
  }, {});
}

export function isPluralized(translations: Translations) {
  return (
    NONE in translations && SINGULAR in translations && PLURAL in translations
  );
}
