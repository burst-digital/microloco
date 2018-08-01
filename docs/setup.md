# Setup

In order to use the library, the library needs to be set up with translations, a language and a default language. This is done by calling microloco as a function. 
Microloco then returns a so-called `t()` function which can be used to do translations. This function is automatically wrapped with the provided language.

```js
import microloco from 'microloco';

// Translations *must* be objects with unique base key and ideally identical content, these can be JavaScript objects or (imported) JSON files.
const enLocale = {
    en: {
        cookie: 'Cookie'
        //...
    } 
};

const frLocale = {
    fr: {
        name: 'Le cookie'
        //...
    } 
};

// Translations can be passed to the microloco function as a large object of translation objects or as an array of objects.
let translations = { ...enLocale, ...frLocale };
translations = [enLocale, frLocale]

const t = microloco(translations, {
    // Language that is used in the returned function. Required.
    lang: 'fr',
    // Language that is used as a fallback if the base language cannot be found. Required.
    defaultLang: 'en',
    // String that is returned if a lookup key for a translation is invalid. Defaults to '?'.
    invalidLookupKeyFallback: 'unknown', // Defaults to '?'
    // String that is returned if a translation value cannot be found/used. Defaults to '?'.
    invalidTranslationValueFallback: 'unknown',  // Defaults to '?'
    // String that is used to interpolate a certain value if the value is not currently passed as in the interpolation values. Defaults to '?'.
    invalidInterpolationValueFallback: 'unknown'  // Defaults to '?'
});
```
