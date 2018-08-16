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
function interpolate(translation, interpolationValues) {
    return translation
        .replace(constants_1.INTERPOLATE_REGEX, function (match) {
        var preprocessedMatch = match.replace(/[{}]/g, function () { return ""; });
        if (helpers_1.isObject(interpolationValues) &&
            interpolationValues[preprocessedMatch] !== null &&
            interpolationValues[preprocessedMatch] !== undefined &&
            (typeof interpolationValues[preprocessedMatch] !== "string" ||
                typeof interpolationValues[preprocessedMatch] !== "number")) {
            return String(interpolationValues[preprocessedMatch]);
        }
        debug(constants_1.APP_LOG_ID + ": Interpolation value " + preprocessedMatch + " is invalid.");
        return "";
    })
        .replace(/[{}]/g, function () { return ""; });
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
function getTranslationValue(lookupKey, translations) {
    if (typeof lookupKey !== "string") {
        debug(constants_1.APP_LOG_ID + ": Lookup key " + String(lookupKey) + " is not a string.");
        return null;
    }
    var mainTranslation = deepFindTranslation(lookupKey, translations[constants_1.MAIN_TRANSLATION_KEY]);
    if (mainTranslation !== null) {
        return mainTranslation;
    }
    var defaultTranslation = deepFindTranslation(lookupKey, translations[constants_1.DEFAULT_TRANSLATION_KEY]);
    if (defaultTranslation !== null) {
        return defaultTranslation;
    }
    debug(constants_1.APP_LOG_ID + ": Translation for " + String(lookupKey) + " could not be found in either main or default translations.");
    return null;
}
function t(lookupKey, activeTranslations, processedInitOptions, processedTranslationOptions) {
    var translation = getTranslationValue(lookupKey, activeTranslations);
    if (helpers_1.isObject(translation) && helpers_1.isPluralized(translation)) {
        var pluralizeKey = determinePluralizedTranslationKey(processedTranslationOptions.interpolationValues[constants_1.PLURALIZATION_INTERPOLATION_KEY]);
        console.log([processedTranslationOptions.interpolationValues], constants_1.PLURALIZATION_INTERPOLATION_KEY);
        var pluralizedTranslation = translation[pluralizeKey];
        return interpolate(pluralizedTranslation, processedTranslationOptions.interpolationValues);
    }
    else if (typeof translation === "string") {
        return interpolate(translation, processedTranslationOptions.interpolationValues);
    }
    return processedInitOptions.fallback;
}
function getActiveTranslations(translations, lang, defaultLang) {
    var _a;
    return _a = {},
        _a[constants_1.MAIN_TRANSLATION_KEY] = translations[lang] || null,
        _a[constants_1.DEFAULT_TRANSLATION_KEY] = translations[defaultLang] || null,
        _a;
}
function setupT(translations, initOptions) {
    var processedInitOptions = __assign({}, constants_1.DEFAULT_INIT_OPTIONS, initOptions);
    var activeTranslations = getActiveTranslations(translations, processedInitOptions.lang, processedInitOptions.defaultLang);
    return function (lookupKey, translationOptions) {
        var processedTranslationOptions = __assign({}, constants_1.DEFAULT_TRANSLATION_OPTIONS, translationOptions);
        return t(lookupKey, activeTranslations, processedInitOptions, processedTranslationOptions);
    };
}
function init(translations, initOptions) {
    if (Array.isArray(translations) && translations.every(helpers_1.isObject)) {
        var flattenedTranslations = helpers_1.flattenTranslations(translations);
        return setupT(flattenedTranslations, initOptions);
    }
    else if (helpers_1.isObject(translations)) {
        return setupT(translations, initOptions);
    }
    throw new Error(constants_1.APP_LOG_ID + ": Translations are invalid, use a valid format.");
}
exports.default = init;
