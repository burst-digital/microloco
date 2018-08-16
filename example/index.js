const microloco = require('../lib/index.js').default; 
const enLocale = require('./translations/en.json');
const nlLocale = require('./translations/nl.json');
console.log(microloco);
const tNl = microloco([enLocale, nlLocale], {
  lang: 'nl',
  defaultLang: 'en'
});

const tEn = microloco([enLocale, nlLocale], {
  defaultLang: 'en',
  options: {
    fallback: 'INVALID KEY USED!!!' 
  }
});

const small = 'small';
const medium = 'medium';
const large = 'large';

console.log('---DUTCH---');

console.log('');

console.log(tNl('products.strawberry.name'));

console.log('');

console.log('---Computed numbered calls---')
console.log(tNl('products.strawberry.numbered', { num: 0 }));
console.log(tNl('products.strawberry.numbered', { num: 1 }));
console.log(tNl('products.strawberry.numbered', { num: 42 }));

console.log('');

console.log('---Individual numbered calls---')
console.log(tNl('products.strawberry.numbered.none'));
console.log(tNl('products.strawberry.numbered.singular'));
console.log(tNl('products.strawberry.numbered.plural', { num: 42 }));

console.log('');

console.log('---Numbered calls with extra values---');
console.log(tNl('products.strawberry.extraNumbered', { num: 0, extra: 'super' }));
console.log(tNl('products.strawberry.extraNumbered', { num: 1, extra: 'mega'}));
console.log(tNl('products.strawberry.extraNumbered', { num: 42, extra: 'super mega' }));
console.log('');

console.log('---Enum calls---')
console.log(tNl(`products.strawberry.size.${small}`));
console.log(tNl(`products.strawberry.size.${medium}`));
console.log(tNl(`products.strawberry.size.${large}`));

console.log('');

console.log('---ENGLISH---')

console.log('');

console.log(tEn('products.strawberry.name'));

console.log('');

console.log('---Computed numbered calls---')
console.log(tEn('products.strawberry.numbered', { num: 0 }));
console.log(tEn('products.strawberry.numbered', { num: 1 }));
console.log(tEn('products.strawberry.numbered', { num: 42 }));

console.log('');

console.log('---Individual numbered calls---')
console.log(tEn('products.strawberry.numbered.none'));
console.log(tEn('products.strawberry.numbered.singular'));
console.log(tEn('products.strawberry.numbered.plural', { num: 42 }));

console.log('');

console.log('---Numbered calls with extra values---');
console.log(tEn('products.strawberry.extraNumbered', { num: 0, extra: 'super' }));
console.log(tEn('products.strawberry.extraNumbered', { num: 1, extra: 'mega'}));
console.log(tEn('products.strawberry.extraNumbered', { num: 42, extra: 'super mega' }));

console.log('');

console.log('---Enum calls---')
console.log(tEn(`products.strawberry.size.${small}`));
console.log(tEn(`products.strawberry.size.${medium}`));
console.log(tEn(`products.strawberry.size.${large}`));