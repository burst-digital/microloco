import * as debug from "debug";
import {
  APP_LOG_ID,
  DEFAULT_INIT_OPTIONS,
  DEFAULT_LANG,
  DEFAULT_TRANSLATION_OPTIONS,
  FALLBACK_DEFAULT,
  INTERPOLATE_REGEX,
  NONE,
  PLURAL,
  PLURALIZATION_INTERPOLATION_KEY,
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
  interpolationValues: InterpolationValues
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

          return "";
        }
      )
      .replace(/[{}]/g, () => "");
  }

  return translation;
}

function determinePluralizedTranslationKey(value: number): PluralizeKey {
  if (value > 1) {
    return PLURAL;
  } else if (value === 1) {
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
  mainTranslations: Translations,
  defaultTranslations: Translations,
  processedInitOptions: ProcessedInitOptions,
  processedTranslationOptions: ProcessedTranslationOptions
) {
  if (mainTranslations === null && defaultTranslations === null) {
    return processedInitOptions.fallback;
  }

  const translation = getTranslationValue(
    lookupKey,
    mainTranslations,
    defaultTranslations
  );

  if (isObject(translation) && isPluralized(translation as Translations)) {
    const pluralizeKey = determinePluralizedTranslationKey(
      processedTranslationOptions.interpolationValues[
        processedInitOptions.pluralizationInterpolationKey
      ] as number
    );

    const pluralizedTranslation: TranslationValue = (translation as Translations)[
      pluralizeKey
    ];

    return interpolate(
      pluralizedTranslation as string,
      processedTranslationOptions.interpolationValues
    );
  } else if (typeof translation === "string") {
    return interpolate(
      translation as string,
      processedTranslationOptions.interpolationValues
    );
  }

  return processedInitOptions.fallback;
}

function setupT(translations: Translations, initOptions: InitOptions) {
  const processedInitOptions: ProcessedInitOptions = {
    ...DEFAULT_INIT_OPTIONS,
    ...initOptions
  };

  const mainTranslations =
    processedInitOptions.lang in translations
      ? translations[processedInitOptions.lang]
      : null;

  const defaultTranslations =
    processedInitOptions.defaultLang in translations
      ? translations[processedInitOptions.defaultLang]
      : null;

  return (lookupKey: string, translationOptions?: TranslationOptions) => {
    const processedTranslationOptions: ProcessedTranslationOptions = {
      ...DEFAULT_TRANSLATION_OPTIONS,
      ...translationOptions
    };

    return t(
      lookupKey,
      mainTranslations,
      defaultTranslations,
      processedInitOptions,
      processedTranslationOptions
    );
  };
}

export default function init(
  translations: TranslationInput,
  initOptions: InitOptions
) {
  const processedInitOptions = { ...DEFAULT_INIT_OPTIONS, ...initOptions };

  if (Array.isArray(translations) && translations.every(isObject)) {
    const flattenedTranslations = flattenTranslations(translations);

    return setupT(flattenedTranslations, processedInitOptions);
  } else if (isObject(translations)) {
    return setupT(translations, processedInitOptions);
  }

  throw new Error(
    `${APP_LOG_ID}: Translations are invalid, use a valid format.`
  );
}
