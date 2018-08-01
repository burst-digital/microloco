import * as debug from "debug";
import {
  APP_LOG_ID,
  INTERPOLATE_REGEX,
  INVALID_INTERPOLATION_VALUE_FALLBACK,
  INVALID_LOOKUP_KEY_FALLBACK,
  INVALID_TRANSLATION_VALUE_FALLBACK,
  LOOKUP_KEY_REGEX,
  NONE,
  PLURAL,
  SINGULAR
} from "./constants";
import { flattenTranslations, isObject, isPluralized } from "./helpers";

function deepFindTranslation(
  lookupKey: string,
  translations: Translations,
  invalidLookupKey: string
): TranslationValue {
  if (LOOKUP_KEY_REGEX.test(lookupKey)) {
    return invalidLookupKey;
  }

  return lookupKey
    .split(".")
    .reduce((translation: TranslationValue, key: string): TranslationValue => {
      if (isObject(translation) && key in (translation as Translations)) {
        return (translation as Translations)[key];
      }

      debug(
        `${APP_LOG_ID}: Translation lookup key ${lookupKey} has no translation value.`
      );

      return invalidLookupKey;
    }, translations);
}

function interpolate(
  translation: string,
  interpolationValues: InterpolationValues,
  invalidInterpolationValueFallback: string
) {
  if (isObject(interpolationValues)) {
    return translation
      .replace(
        INTERPOLATE_REGEX,
        (match: string): string => {
          // Workaround for matching this content of the regex

          //  @TODO: return to positive lookbehind regex after ECMAScript 2018
          const preprocessedMatch = match.replace(/[{}]/g, () => "");

          if (
            interpolationValues[preprocessedMatch] !== null &&
            interpolationValues[preprocessedMatch] !== undefined &&
            (typeof interpolationValues[preprocessedMatch] !== "string" ||
              typeof interpolationValues[preprocessedMatch] !== "number")
          ) {
            return String(interpolationValues[preprocessedMatch]);
          }

          debug(
            `${APP_LOG_ID}: Translation value ${preprocessedMatch} is an invalid interpolation value.`
          );

          return invalidInterpolationValueFallback;
        }
      )
      .replace(/[{}]/g, () => "");
  }

  return translation;
}

function determinePluralizedTranslation(num: number): PluralizeKey {
  if (num > 1) {
    return PLURAL;
  } else if (num === 1) {
    return SINGULAR;
  }
  return NONE;
}

function t(
  lookupKey: string,
  interpolationValues: InterpolationValues,
  translations: Translations,
  options: InitOptions
) {
  const invalidLookupKeyFallback =
    typeof options.invalidLookupKeyFallback === "string"
      ? options.invalidLookupKeyFallback
      : INVALID_LOOKUP_KEY_FALLBACK;
  const invalidTranslationValueFallback =
    typeof options.invalidTranslationValueFallback === "string"
      ? options.invalidTranslationValueFallback
      : INVALID_TRANSLATION_VALUE_FALLBACK;
  const invalidInterpolationValueFallback =
    typeof options.invalidInterpolationValueFallback === "string"
      ? options.invalidInterpolationValueFallback
      : INVALID_INTERPOLATION_VALUE_FALLBACK;

  const translation = deepFindTranslation(
    lookupKey,
    translations,
    invalidLookupKeyFallback
  );

  if (!isObject(translation) && typeof translation !== "string") {
    debug(
      `${APP_LOG_ID}: Translation lookup key ${lookupKey} has no translation value.`
    );

    return invalidTranslationValueFallback;
  }

  if (isObject(translation)) {
    if (
      isPluralized(translation as Translations) &&
      "num" in interpolationValues &&
      !isNaN(interpolationValues.num as number)
    ) {
      const pluralizeKey = determinePluralizedTranslation(
        interpolationValues.num as number
      );
      const pluralizedTranslation: TranslationValue = (translation as Translations)[
        pluralizeKey
      ];

      return interpolate(
        pluralizedTranslation as string,
        interpolationValues,
        invalidInterpolationValueFallback
      );
    }

    return invalidTranslationValueFallback;
  }

  return interpolate(
    translation as string,
    interpolationValues,
    invalidInterpolationValueFallback
  );
}

function localizeT(translations: Translations, options: InitOptions) {
  const lang = options.lang;
  const defaultLang = options.defaultLang;

  if (typeof lang !== "string") {
    if (typeof defaultLang !== "string") {
      throw new Error(
        `${APP_LOG_ID}: No language and fallback language available`
      );
    }

    if (defaultLang in translations) {
      return (lookupKey: string, interpolationValues: InterpolationValues) =>
        t(lookupKey, interpolationValues, translations[defaultLang], options);
    }

    throw new Error(
      `${APP_LOG_ID}: Fallback language '${defaultLang}' is not available in translations.`
    );
  }

  if (lang in translations) {
    return (lookupKey: string, interpolationValues: InterpolationValues) =>
      t(lookupKey, interpolationValues, translations[lang], options);
  }

  throw new Error(
    `${APP_LOG_ID}: Language '${lang} is not available in translations.'`
  );
}

export default function init(
  translations: TranslationInput,
  options: InitOptions
) {
  if (Array.isArray(translations)) {
    if (translations.some(translation => !isObject(translation))) {
      debug(
        `${APP_LOG_ID}: Some translation objects in the array were not an object, these values will be skipped.`
      );
    }

    const flattenedTranslations = flattenTranslations(translations);

    return localizeT(flattenedTranslations, options);
  } else if (isObject(translations)) {
    return localizeT(translations, options);
  }

  throw new Error("Translations are invalid");
}
