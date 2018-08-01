# Usage 

## Looking up translations using `t()`

Using the earlier created `t()` function, we can retrieve translations based on a dotted string lookup key which forms a path to the translation from the base key. The function also accepts an object of either string or number values.

```
t(lookupKey: string, interpolationValues: { [key: string]: string | number }): string
```

*Note: the language key should never be included in this template as it is wrapped around the `t() function.*

**Examples of valid lookup keys**

- `general.allowCookies`
- `products.strawberry.name`
- `products.strawberry.weighted`
- `products.strawberry.numbered` - *Only works if a `num` key/value is passed as an interpolation value and if the object has the required pluralization format.* 
- `products.strawberry.numbered.none`
- `products.strawberry.numbered.plural` - *Only works if a `num` key/value is passed as an interpolation value.*

## Static translations

Getting a static translation is easy, simply use the `t()` function with just a path.

**Example**

```
t('general.allowCookies');
t('products.strawberry.name);
```

## Interpolated translations

Getting a interpolated translation also requires an object with corresponding keys to the interpolated values included in the translation string with either a string or a number as a value.

**Example**

```
t('products.strawberry.weighted', { weighted: 300 });
t('products.strawberry.numbered.plural', { num: 5 });
```

## Pluralized translations

Getting a pluralized translation works the same as interpolating a translation, but you are able to use the parent key as a path. Doing this, passing a `num` key with a integer as a value (required) will automatically pick the right pluralized translation for you.

**Example**
```
t('products.strawberry.numbered', { num: 5 });
```
