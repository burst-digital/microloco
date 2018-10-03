
import enLocale from './translations/en';
import microloco from 'microloco'; 

const t = microloco(enLocale, {
  lang: 'en',
  defaultLang: 'dev'
});

const small = 'small';
const medium = 'medium';
const large = 'large';


console.log('---Regular calls---')
console.log(t('products.strawberry.name'));
