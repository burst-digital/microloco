# Setup

In order to use the library, the library needs to be set up with translations and several options. This is done by calling microloco as a function.

**Example**

`microloco(translations: Translations, options: GlobalOptions);`

Microloco then returns a so-called `t` function which can be used to do translations. This function is automatically wrapped with the provided active translations based on the languages used in the options.

##  Loading translations

Microloco expects the first argument to be either an object which contains top level language keys with strings or objects with strings as values or an array of the former. 

An example of valid translations would be either:

*As an object*

```json
{
    "en": {
        "key": {
            "value": "foo"
        },
        "bar": "baz"
    },
    "nl": "..."
}
```

*As an array*

```json
[
    {
        "en": {
            "key": {
                "value": "foo"
            },
            "bar": "baz"
        },
    },
    {
        "nl": "..."
    }
]
```

## Available global options

Microloco expects the second argument to be an options object with settings needed to actually translate.

|Key|Description|Required|Default value|
|---|---|---|---|
|lang|A string that defines the main language to be used in looking up translations (should be equal to the top level key in a translation).|Yes|N/A|
|defaultLang|A string that defines the language default to if a lookup for a translation in the main language could not be found.|No|`'dev'`|
|fallback|A string that defines what to return if looking up a translation fails (not found at all or errors)|No|`''`|

## Setup example

```
import microloco from 'microloco';

const enLocale = {
    en: {
        cookie: 'Cookie'
        //...
    } 
};

const frLocale = {
    fr: {
        cookie: 'Le cookie'
        //...
    } 
};

let translations = { ...enLocale, ...frLocale };
// or
translations = [enLocale, frLocale]

const t = microloco(translations, {
    lang: 'fr',
    defaultLang: 'en',
    fallback: '?'
});
```
