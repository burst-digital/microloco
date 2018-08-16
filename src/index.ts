import * as debug from "debug";
import {
  APP_LOG_ID,
  DEFAULT_INIT_OPTIONS,
  DEFAULT_TRANSLATION_KEY,
  DEFAULT_TRANSLATION_OPTIONS,
  INTERPOLATE_REGEX,
  MAIN_TRANSLATION_KEY,
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
  return translation
    .replace(
      INTERPOLATE_REGEX,
      (match: string): string => {
        const preprocessedMatch = match.replace(/[{}]/g, () => "");

        if (
          isObject(interpolationValues) &&
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
  translations: Translations
): TranslationValue {
  if (typeof lookupKey !== "string") {
    debug(`${APP_LOG_ID}: Lookup key ${String(lookupKey)} is not a string.`);

    return null;
  }

  const mainTranslation = deepFindTranslation(
    lookupKey,
    translations[MAIN_TRANSLATION_KEY]
  );

  if (mainTranslation !== null) {
    return mainTranslation;
  }

  const defaultTranslation = deepFindTranslation(
    lookupKey,
    translations[DEFAULT_TRANSLATION_KEY]
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
  activeTranslations: Translations,
  processedGlobalOptions: ProcessedGlobalOptions,
  processedTranslationOptions: ProcessedTranslationOptions
) {
  const translation = getTranslationValue(lookupKey, activeTranslations);

  if (isObject(translation) && isPluralized(translation as Translations)) {
    const pluralizeKey = determinePluralizedTranslationKey(
      processedTranslationOptions.interpolationValues[
        PLURALIZATION_INTERPOLATION_KEY
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

  return processedGlobalOptions.fallback;
}

function getActiveTranslations(
  translations: Translations,
  lang: string,
  defaultLang: string
): Translations {
  return {
    [MAIN_TRANSLATION_KEY]: translations[lang] || null,
    [DEFAULT_TRANSLATION_KEY]: translations[defaultLang] || null
  };
}

function setupT(translations: Translations, globalOptions: GlobalOptions) {
  const processedGlobalOptions: ProcessedGlobalOptions = {
    ...DEFAULT_INIT_OPTIONS,
    ...globalOptions
  };

  const activeTranslations = getActiveTranslations(
    translations,
    processedGlobalOptions.lang,
    processedGlobalOptions.defaultLang
  );

  return (lookupKey: string, translationOptions?: TranslationOptions) => {
    const processedTranslationOptions: ProcessedTranslationOptions = {
      ...DEFAULT_TRANSLATION_OPTIONS,
      ...translationOptions
    };

    return t(
      lookupKey,
      activeTranslations,
      processedGlobalOptions,
      processedTranslationOptions
    );
  };
}

export default function init(
  translations: TranslationInput,
  globalOptions: GlobalOptions
) {
  if (Array.isArray(translations) && translations.every(isObject)) {
    const flattenedTranslations = flattenTranslations(translations);

    return setupT(flattenedTranslations, globalOptions);
  } else if (isObject(translations)) {
    return setupT(translations, globalOptions);
  }

  throw new Error(
    `${APP_LOG_ID}: Translations are invalid, use a valid format.`
  );
}
