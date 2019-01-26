
import enLocale from './translations/en';
import microloco from '../lib'; 

const t = microloco<typeof import('./translations/en').default>(enLocale, {
  lang: 'en',
  defaultLang: 'dev'
});

console.log('---Regular calls---')
console.log(t('products.strawberry.name'));
