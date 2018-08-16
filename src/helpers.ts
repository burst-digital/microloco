import { NONE, PLURAL, SINGULAR } from "./constants";

export function isObject(o: any): boolean {
  return o !== null && typeof o === "object";
}

export function isPluralized(translations: Translations) {
  return (
    NONE in translations && SINGULAR in translations && PLURAL in translations
  );
}

export function flattenTranslations(
  translations: Translations[]
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
