"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require("debug");
var constants_1 = require("./constants");
var helpers_1 = require("./helpers");
function deepFindTranslation(lookupKey, translations) {
    if (translations === null) {
        return null;
    }
    return lookupKey
        .split(".")
        .reduce(function (translation, key) {
        if (helpers_1.isObject(translation) && key in translation) {
            return translation[key];
        }
        debug(constants_1.APP_LOG_ID + ": Translation lookup key " + lookupKey + " has no translation value.");
        return null;
    }, translations);
}
function interpolate(translation, interpolationValues, fallback) {
    if (helpers_1.isObject(interpolationValues)) {
        return translation
            .replace(constants_1.INTERPOLATE_REGEX, function (match) {
            // Workaround for matching this content of the regex
            //  @TODO: return to positive lookbehind regex after ECMAScript 2018
            var preprocessedMatch = match.replace(/[{}]/g, function () { return ""; });
            if (interpolationValues[preprocessedMatch] !== null &&
                interpolationValues[preprocessedMatch] !== undefined &&
                (typeof interpolationValues[preprocessedMatch] !== "string" ||
                    typeof interpolationValues[preprocessedMatch] !== "number")) {
                return String(interpolationValues[preprocessedMatch]);
            }
            debug(constants_1.APP_LOG_ID + ": Interpolation value " + preprocessedMatch + " is invalid.");
            return fallback;
        })
            .replace(/[{}]/g, function () { return ""; });
    }
    return translation;
}
function determinePluralizedTranslationKey(value) {
    if (value > 1) {
        return constants_1.PLURAL;
    }
    else if (value === 1) {
        return constants_1.SINGULAR;
    }
    return constants_1.NONE;
}
function getTranslationValue(lookupKey, mainTranslations, defaultTranslations) {
    if (typeof lookupKey !== "string") {
        debug(constants_1.APP_LOG_ID + ": Lookup key " + String(lookupKey) + " is not a string.");
        return null;
    }
    var mainTranslation = deepFindTranslation(lookupKey, mainTranslations);
    if (mainTranslation !== null) {
        return mainTranslation;
    }
    var defaultTranslation = deepFindTranslation(lookupKey, defaultTranslations);
    if (defaultTranslation !== null) {
        return defaultTranslation;
    }
    debug(constants_1.APP_LOG_ID + ": Translation for " + String(lookupKey) + " could not be found in either main or default translations.");
    return null;
}
function t(lookupKey, mainTranslations, defaultTranslations, initOptions, translationOptions) {
    var mergedOptions = __assign({}, initOptions, processTranslationOptions(translationOptions));
    if (mainTranslations === null && defaultTranslations === null) {
        return mergedOptions.fallback;
    }
    var translation = getTranslationValue(lookupKey, mainTranslations, defaultTranslations);
    if (helpers_1.isObject(translation) &&
        helpers_1.isPluralized(translation)) {
        var pluralizeKey = determinePluralizedTranslationKey(mergedOptions.interpolationValues[mergedOptions.pluralizationInterpolationKey]);
        var pluralizedTranslation = translation[pluralizeKey];
        return interpolate(pluralizedTranslation, mergedOptions.interpolationValues, mergedOptions.fallback);
    }
    else if (typeof translation === "string") {
        return interpolate(translation, mergedOptions.interpolationValues, mergedOptions.fallback);
    }
    return mergedOptions.fallback;
}
function localizeT(translations, processedInitOptions) {
    if (!(processedInitOptions.lang in translations) && !("defaultLang" in processedInitOptions)) {
        debug(constants_1.APP_LOG_ID + ": No translations available.");
    }
    var mainTranslations = processedInitOptions.lang in translations ? translations[processedInitOptions.lang] : null;
    var defaultTranslations = processedInitOptions.defaultLang in translations
        ? translations[processedInitOptions.defaultLang]
        : null;
    return function (lookupKey, translationOptions) {
        return t(lookupKey, mainTranslations, defaultTranslations, processedInitOptions, translationOptions);
    };
}
function processInitOptions(options) {
    return {
        lang: typeof options.lang === "string"
            ? options.lang
            : constants_1.DEFAULT_LANG,
        defaultLang: typeof options.defaultLang === "string"
            ? options.defaultLang
            : constants_1.DEFAULT_LANG,
        fallback: typeof options.fallback === "string"
            ? options.fallback
            : constants_1.FALLBACK_DEFAULT,
        pluralizationInterpolationKey: typeof options.pluralizationInterpolationKey === "string"
            ? options.pluralizationInterpolationKey
            : constants_1.PLURALIZATION_INTERPOLATION_KEY
    };
}
function processTranslationOptions(options) {
    return {
        interpolationValues: helpers_1.isObject(options.interpolationValues)
            ? options.interpolationValues
            : {},
        fallback: typeof options.fallback === "string"
            ? options.fallback
            : constants_1.FALLBACK_DEFAULT
    };
}
function init(translations, options) {
    var processedInitOptions = processInitOptions(options);
    if (Array.isArray(translations)) {
        if (translations.some(function (translation) { return !helpers_1.isObject(translation); })) {
            debug(constants_1.APP_LOG_ID + ": Some translation objects in the array were not an object, these values will be skipped.");
        }
        var flattenedTranslations = helpers_1.flattenTranslations(translations);
        return localizeT(flattenedTranslations, processedInitOptions);
    }
    else if (helpers_1.isObject(translations)) {
        return localizeT(translations, processedInitOptions);
    }
    return processedInitOptions.fallback;
}
exports.default = init;
