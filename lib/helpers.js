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
var constants_1 = require("./constants");
function flattenTranslations(translations) {
    return translations.reduce(function (p, n) {
        if (isObject(n)) {
            return __assign({}, p, n);
        }
        return p;
    }, {});
}
exports.flattenTranslations = flattenTranslations;
function isObject(o) {
    return o !== null && typeof o === "object";
}
exports.isObject = isObject;
function isPluralized(translations) {
    return (constants_1.NONE in translations || constants_1.SINGULAR in translations || constants_1.PLURAL in translations);
}
exports.isPluralized = isPluralized;
function determinePluralizedTranslationKey(value) {
    if (value > 1) {
        return constants_1.PLURAL;
    }
    else if (value === 1) {
        return constants_1.SINGULAR;
    }
    return constants_1.NONE;
}
exports.determinePluralizedTranslationKey = determinePluralizedTranslationKey;
