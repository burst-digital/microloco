"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = __importDefault(require("../lib/index.js"));
var en_1 = __importDefault(require("./translations/en"));
var tEn = index_js_1.default(en_1.default, {
    lang: 'en',
    defaultLang: 'dev'
});
var small = 'small';
var medium = 'medium';
var large = 'large';
console.log('---Regular calls---');
console.log(tEn('products.strawberry.name'));
console.log(tEn(function (_) { return _.hello; }));
