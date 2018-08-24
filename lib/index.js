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
function createInterpolationPostprocessor(interpolations) {
    return function (translation) {
        return translation
            .replace(constants_1.INTERPOLATE_REGEX, function (match) {
            var preprocessedMatch = match.replace(/[{}]/g, function () { return ""; });
            if (helpers_1.isObject(interpolations) &&
                interpolations[preprocessedMatch] !== null &&
                (typeof interpolations[preprocessedMatch] === "string" ||
                    typeof interpolations[preprocessedMatch] === "number")) {
                return String(interpolations[preprocessedMatch]);
            }
            debug(constants_1.APP_LOG_ID + ": Interpolation value " + preprocessedMatch + " is invalid.");
            return "";
        })
            .replace(/[{}]/g, function () { return ""; });
    };
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
function postprocessTranslation(translation, postprocessors) {
    return postprocessors.reduce(function (p, n) {
        if (typeof n !== "function") {
            return p;
        }
        var postprocessedTranslation = n(p);
        if (typeof postprocessedTranslation !== "string") {
            return p;
        }
        return postprocessedTranslation;
    }, translation);
}
function t(lookupKey, activeTranslations, defaultedGlobalOptions, defaultedTranslationOptions) {
    var translation = getTranslationValue(lookupKey, activeTranslations);
    if (helpers_1.isObject(translation) && helpers_1.isPluralized(translation)) {
        var pluralizeKey = determinePluralizedTranslationKey(defaultedTranslationOptions.interpolations[constants_1.PLURALIZATION_INTERPOLATION_KEY]);
        translation = translation[pluralizeKey];
    }
    if (typeof translation === "string") {
        return postprocessTranslation(translation, [
            createInterpolationPostprocessor(defaultedTranslationOptions.interpolations)
        ].concat((Array.isArray(defaultedTranslationOptions.postprocessors)
            ? defaultedTranslationOptions.postprocessors.slice() : [])));
    }
    return defaultedGlobalOptions.fallback;
}
function getActiveTranslations(translations, lang, defaultLang) {
    var _a;
    return _a = {},
        _a[constants_1.MAIN_TRANSLATION_KEY] = translations[lang] || null,
        _a[constants_1.DEFAULT_TRANSLATION_KEY] = translations[defaultLang] || null,
        _a;
}
function setupT(translations, globalOptions) {
    var defaultedGlobalOptions = __assign({}, constants_1.DEFAULT_INIT_OPTIONS, globalOptions);
    var activeTranslations = getActiveTranslations(translations, defaultedGlobalOptions.lang, defaultedGlobalOptions.defaultLang);
    return function (lookupKey, translationOptions) {
        var defaultedTranslationOptions = __assign({}, constants_1.DEFAULT_TRANSLATION_OPTIONS, translationOptions);
        return t(lookupKey, activeTranslations, defaultedGlobalOptions, defaultedTranslationOptions);
    };
}
function init(translations, globalOptions) {
    if (Array.isArray(translations) && translations.every(helpers_1.isObject)) {
        var flattenedTranslations = helpers_1.flattenTranslations(translations);
        return setupT(flattenedTranslations, globalOptions);
    }
    else if (helpers_1.isObject(translations)) {
        return setupT(translations, globalOptions);
    }
    throw new Error(constants_1.APP_LOG_ID + ": Translations are invalid, use a valid format.");
}
exports.default = init;
