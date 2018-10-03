import * as constants from "./constants";
import * as debug from "debug";
import * as helpers from "./helpers";
import {
  DefaultedGlobalOptions,
  DefaultedTranslationOptions,
  GlobalOptions,
  InterpolationValues,
  LookupFunction,
  LookupKey,
  LookupMethod,
  Postprocessor,
  TFunction,
  TranslationInput,
  TranslationOptions,
  Translations,
  TranslationValue
} from "./types";

export {
  DefaultedGlobalOptions,
  DefaultedTranslationOptions,
  GlobalOptions,
  InterpolationValues,
  Postprocessor,
  TFunction,
  TranslationInput,
  TranslationOptions,
  Translations,
  TranslationValue
};

export default function init(
  translations: TranslationInput,
  globalOptions: GlobalOptions
) {
  if (Array.isArray(translations) && translations.every(helpers.isObject)) {
    const flattenedTranslations = helpers.flattenTranslations(translations);

    return setupT(flattenedTranslations, globalOptions);
  } else if (helpers.isObject(translations)) {
    return setupT(translations, globalOptions);
  }

  throw new Error(
    `${constants.APP_LOG_ID}: Translations are invalid, use a valid format.`
  );
}

function setupT(
  translations: Translations,
  globalOptions: GlobalOptions
): TFunction {
  const defaultedGlobalOptions: DefaultedGlobalOptions = {
    ...constants.DEFAULT_INIT_OPTIONS,
    ...globalOptions
  };

  const activeTranslations = getActiveTranslations(
    translations,
    defaultedGlobalOptions.lang,
    defaultedGlobalOptions.defaultLang
  );

  return (
    lookupMethod: LookupMethod,
    translationOptions?: TranslationOptions
  ) => {
    const defaultedTranslationOptions: DefaultedTranslationOptions = {
      ...constants.DEFAULT_TRANSLATION_OPTIONS,
      ...translationOptions
    };

    return t(
      lookupMethod,
      activeTranslations,
      defaultedGlobalOptions,
      defaultedTranslationOptions
    );
  };
}

function getActiveTranslations(
  translations: Translations,
  lang: string,
  defaultLang: string
): Translations {
  return {
    [constants.MAIN_TRANSLATION_KEY]: translations[lang] || null,
    [constants.DEFAULT_TRANSLATION_KEY]: translations[defaultLang] || null
  };
}

function t(
  lookupMethod: LookupMethod,
  activeTranslations: Translations,
  defaultedGlobalOptions: DefaultedGlobalOptions,
  defaultedTranslationOptions: DefaultedTranslationOptions
) {
  let translation = handleLookupMethod(lookupMethod, activeTranslations);

  if (
    helpers.isObject(translation) &&
    helpers.isPluralized(translation as Translations)
  ) {
    const pluralizeKey = helpers.determinePluralizedTranslationKey(
      defaultedTranslationOptions.interpolations[
        constants.PLURALIZATION_INTERPOLATION_KEY
      ] as number
    );

    translation = (translation as Translations)[pluralizeKey];
  }

  if (typeof translation === "string") {
    return postprocessTranslation(translation, [
      createInterpolationPostprocessor(
        defaultedTranslationOptions.interpolations
      ),
      ...(Array.isArray(defaultedTranslationOptions.postprocessors)
        ? [...defaultedTranslationOptions.postprocessors]
        : [])
    ]);
  }

  return defaultedGlobalOptions.fallback;
}

function handleLookupMethod(
  lookupMethod: LookupMethod,
  activeTranslations: Translations
) {
  if (typeof lookupMethod === "string") {
    return getTranslationValueByLookupKey(lookupMethod, activeTranslations);
  } else if (typeof lookupMethod === "function") {
    return getTranslationValueByLookupFunction(
      lookupMethod,
      activeTranslations
    );
  }

  return null;
}

function getTranslationValueByLookupFunction<P>(
  lookupFunction: LookupFunction,
  translations: Translations
) {
  const mainTranslation = lookupFunction(
    translations[constants.MAIN_TRANSLATION_KEY]
  );

  if (mainTranslation !== null) {
    return mainTranslation;
  }

  const defaultTranslation = lookupFunction(
    translations[constants.DEFAULT_TRANSLATION_KEY]
  );

  if (defaultTranslation !== null) {
    return defaultTranslation;
  }

  debug(
    `${
      constants.APP_LOG_ID
    }: Translation in lookup function could not be found in either main or default translations.`
  );

  return null;
}

function getTranslationValueByLookupKey(
  lookupKey: LookupKey,
  translations: Translations
): TranslationValue {
  if (!constants.LOOKUP_KEY_REGEX.test(lookupKey)) {
    debug(
      `${constants.APP_LOG_ID}: Lookup key ${String(lookupKey)} is not valid.`
    );

    return null;
  }

  const mainTranslation = deepFindTranslation(
    lookupKey,
    translations[constants.MAIN_TRANSLATION_KEY]
  );

  if (mainTranslation !== null) {
    return mainTranslation;
  }

  const defaultTranslation = deepFindTranslation(
    lookupKey,
    translations[constants.DEFAULT_TRANSLATION_KEY]
  );

  if (defaultTranslation !== null) {
    return defaultTranslation;
  }

  debug(
    `${constants.APP_LOG_ID}: Translation for ${String(
      lookupKey
    )} could not be found in either main or default translations.`
  );

  return null;
}

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
      if (
        helpers.isObject(translation) &&
        key in (translation as Translations)
      ) {
        return (translation as Translations)[key];
      }

      debug(
        `${
          constants.APP_LOG_ID
        }: Translation lookup key ${lookupKey} has no translation value.`
      );

      return null;
    }, translations);
}

function postprocessTranslation(
  translation: string,
  postprocessors: Postprocessor[]
): string {
  return postprocessors.reduce((p: string, n: Postprocessor) => {
    if (typeof n !== "function") {
      return p;
    }

    const postprocessedTranslation = n(p);

    if (typeof postprocessedTranslation !== "string") {
      return p;
    }

    return postprocessedTranslation;
  }, translation);
}

function createInterpolationPostprocessor(
  interpolations: InterpolationValues
): Postprocessor {
  return (translation: string) => {
    return translation
      .replace(
        constants.INTERPOLATE_REGEX,
        (match: string): string => {
          const preprocessedMatch = match.replace(/[{}]/g, () => "");

          if (
            helpers.isObject(interpolations) &&
            interpolations[preprocessedMatch] !== null &&
            (typeof interpolations[preprocessedMatch] === "string" ||
              typeof interpolations[preprocessedMatch] === "number")
          ) {
            return String(interpolations[preprocessedMatch]);
          }

          debug(
            `${
              constants.APP_LOG_ID
            }: Interpolation value ${preprocessedMatch} is invalid.`
          );

          return "";
        }
      )
      .replace(/[{}]/g, () => "");
  };
}
