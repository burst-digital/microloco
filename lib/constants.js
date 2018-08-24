"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_LOG_ID = "microloco";
exports.NONE = "none";
exports.SINGULAR = "singular";
exports.PLURAL = "plural";
exports.MAIN_TRANSLATION_KEY = "MAIN";
exports.DEFAULT_TRANSLATION_KEY = "DEFAULT";
exports.PLURALIZATION_INTERPOLATION_KEY = "num";
exports.LOOKUP_KEY_REGEX = /^([\w\d]+)(\.[\w\d]+)*$/;
exports.INTERPOLATE_REGEX = /{([^}]+)}/g;
exports.DEFAULT_LANG = "dev";
exports.FALLBACK_DEFAULT = "";
exports.DEFAULT_INIT_OPTIONS = {
    defaultLang: exports.DEFAULT_LANG,
    fallback: exports.FALLBACK_DEFAULT
};
exports.DEFAULT_TRANSLATION_OPTIONS = {
    interpolations: {},
    postprocessors: []
};
