# Usage 

## Looking up translations using `t`

Using the earlier created `t` function, we can retrieve translations based on a dotted string lookup key which forms a path to the translation from the base key. The function also accepts translation options as a second argument.

```js
t(lookupKey: string, translationOptions?: TranslationOptions): string
```

## Using the lookup key

The lookup key is a string path that is used to (deep) traverse into the translation object to find the corresponding translation.

**Examples of valid lookup keys**

- `general.allowCookies`
- `products.strawberry.name`
- `products.strawberry.weighted` 
- `products.strawberry.numbered` - *Only works properly if a `num` key/value is passed as an interpolation value and if the object has the required pluralization format.* 
- `products.strawberry.numbered.none`
- `products.strawberry.numbered.plural` - *Only works properly if a `num` key/value is passed as an interpolation value.*

## Available translation options

The `t` function can be passed an translations options object toalter or extend existing functionality for example.

|Key|Description|Required|Default value|
|---|---|---|---|
|interpolations|A key-value object of type `string` or `number` used to interpolate dynamic values in translation strings.|No|`{}`|
|postprocessors|An array of functions `(s: string) => string` used to change the translation string after interpolation.|No|[] (always includes an preconfigured interpolation preprocessor as the first index)|

## Static translations

Getting a static translation is easy, simply use the `t` function with just a path.

**Example**

```js
t('general.allowCookies');
t('products.strawberry.name);
```

## Interpolated translations

Getting a interpolated translation also requires an object with corresponding keys to the interpolated values included in the translation string with either a string or a number as a value.

**Example**

```js
t('products.strawberry.weighted', { interpolations: { weighted: 300 }});
t('products.strawberry.numbered.plural', { interpolations: { num: 5 }});
```

## Pluralized translations

Getting a pluralized translation works the same as interpolating a translation, but you are able to use the parent pluralized-formatted object key as a path. Doing this, passing a `num` key with a integer as a value (required) will automatically pick the right pluralized translation for you.

**Example**

```js
t('products.strawberry.numbered', { interpolations: { num: 5 }});
```

## Extending translation string formatting

Microloco allows for extending string formatting by passing postprocessors to the `t` function as options. Postprocessors are nothing more than functions that get a string as input and return a string as output. The interpolation functionality for example, is also a postprocessor under the hood.

A postprocessor could come in handy to format a translation value differently after it's been looked up.

**Usage examples**

*Make the string uppercase*

```js
t('key.value', { 
    postprocessors: [
        s => s.toUpperCase()
    ]
});
```

*Capitalize the first letter and append a dot*

```js
t('key.value', { 
    postprocessors: [
        s => s.charAt(0).toUpperCase(),
        s => `${s}.`
    ]
});
```

*Sanitize HTML*

```js
import sanitizeHtml from 'sanitizeHtml';

t('key.value', { 
    interpolations: {
        dirty: "<script>alert('HACKERMAN')</script>"
    },
    postprocessors: [
        s => sanitizeHtml(s)
    ]
});
```