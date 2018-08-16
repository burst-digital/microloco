const microloco = require('../lib/index.js').default; 
const enLocale = require('./translations/en.json');
const nlLocale = require('./translations/nl.json');

const tNl = microloco([enLocale, nlLocale], {
  lang: 'nl',
  defaultLang: 'en'
});

const small = 'small';
const medium = 'medium';
const large = 'large';

console.log('---Regular calls---')
console.log(tNl('products.strawberry.name'));

console.log('');

console.log('---Preprocessed calls---')
console.log(tNl('products.strawberry.name', {
  postprocessors: [
    s => s.toUpperCase(),
    s => `${s}.`
  ]
}));

console.log('');

console.log('---Computed numbered calls---')
console.log(tNl('products.strawberry.numbered', { interpolationValues: { num: 0 }}));
console.log(tNl('products.strawberry.numbered', { interpolationValues: { num: 1 }}));
console.log(tNl('products.strawberry.numbered', { interpolationValues: { num: 42 }}));

console.log('');

console.log('---Individual numbered calls---')
console.log(tNl('products.strawberry.numbered.none'));
console.log(tNl('products.strawberry.numbered.singular'));
console.log(tNl('products.strawberry.numbered.plural', { interpolationValues: { num: 42 }}));

console.log('');

console.log('---Numbered calls with extra values---');
console.log(tNl('products.strawberry.extraNumbered', { interpolationValues: { num: 0, extra: 'super' }}));
console.log(tNl('products.strawberry.extraNumbered', { interpolationValues: { num: 1, extra: 'mega'}}));
console.log(tNl('products.strawberry.extraNumbered', { interpolationValues: { num: 42, extra: 'super mega' }}));
console.log('');

console.log('---Enum calls---')
console.log(tNl(`products.strawberry.size.${small}`));
console.log(tNl(`products.strawberry.size.${medium}`));
console.log(tNl(`products.strawberry.size.${large}`));