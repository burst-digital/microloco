import * as debug from "debug";
import {
  APP_LOG_ID,
  DEFAULT_LANG,
  FALLBACK_DEFAULT,
  INTERPOLATE_REGEX,
  NONE,
  PLURAL,
  SINGULAR
} from "./constants";
import { flattenTranslations, isObject, isPluralized } from "./helpers";

function deepFindTranslation(
  lookupKey: string,
  translations: Translations
): TranslationValue {
  if (translations === null) {
    return null;
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

      return null;
    }, translations);
}

function interpolate(
  translation: string,
  interpolationValues: InterpolationValues,
  fallback: string
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
            `${APP_LOG_ID}: Interpolation value ${preprocessedMatch} is invalid.`
          );

          return fallback;
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

function getTranslationValue(
  lookupKey: string,
  mainTranslations: Translations,
  defaultTranslations: Translations
): TranslationValue {
  if (typeof lookupKey !== "string") {
    debug(`${APP_LOG_ID}: Lookup key ${String(lookupKey)} is not a string.`);

    return null;
  }

  const mainTranslation = deepFindTranslation(lookupKey, mainTranslations);

  if (mainTranslation !== null) {
    return mainTranslation;
  }

  const defaultTranslation = deepFindTranslation(
    lookupKey,
    defaultTranslations
  );

  if (defaultTranslation !== null) {
    return defaultTranslation;
  }

  debug(
    `${APP_LOG_ID}: Translation for ${String(
      lookupKey
    )} could not be found in either main or default translations.`
  );

  return null;
}

function t(
  lookupKey: string,
  interpolationValues: InterpolationValues,
  mainTranslations: Translations,
  defaultTranslations: Translations,
  initOptions: InitOptions
) {
  if (mainTranslations === null && defaultTranslations === null) {
    return initOptions.fallback;
  }

  const translation = getTranslationValue(
    lookupKey,
    mainTranslations,
    defaultTranslations
  );

  if (
    isObject(translation) &&
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
      initOptions.fallback
    );
  } else if (typeof translation === "string") {
    return interpolate(
      translation as string,
      interpolationValues,
      initOptions.fallback
    );
  }

  return initOptions.fallback;
}

function localizeT(translations: Translations, initOptions: InitOptions) {
  if (!(initOptions.lang in translations) && !("defaultLang" in initOptions)) {
    debug(`${APP_LOG_ID}: No translations available.`);
  }

  const mainTranslations =
    initOptions.lang in translations ? translations[initOptions.lang] : null;
  const defaultTranslations =
    initOptions.defaultLang in translations
      ? translations[initOptions.defaultLang]
      : null;

  return (lookupKey: string, interpolationValues: InterpolationValues) =>
    t(
      lookupKey,
      interpolationValues,
      mainTranslations,
      defaultTranslations,
      initOptions
    );
}

function processInitOptions(options: UserInitOptions): InitOptions {
  return {
    ...options,
    defaultLang:
      typeof options.defaultLang === "string"
        ? (options.defaultLang as string)
        : DEFAULT_LANG,
    fallback:
      typeof options.fallback === "string"
        ? (options.fallback as string)
        : FALLBACK_DEFAULT
  };
}

export default function init(
  translations: TranslationInput,
  options: InitOptions
) {
  const fallback =
    typeof options.fallback === "string" ? options.fallback : FALLBACK_DEFAULT;

  const preprocessedOptions = processInitOptions(options);

  if (Array.isArray(translations)) {
    if (translations.some(translation => !isObject(translation))) {
      debug(
        `${APP_LOG_ID}: Some translation objects in the array were not an object, these values will be skipped.`
      );
    }

    const flattenedTranslations = flattenTranslations(translations);

    return localizeT(flattenedTranslations, preprocessedOptions);
  } else if (isObject(translations)) {
    return localizeT(translations, preprocessedOptions);
  }

  return fallback;
}
