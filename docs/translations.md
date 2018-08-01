# Translations

Creating translations is easy and support interpolation and pluralization. All translations are key-value pairs with new key-value pairs or strings as values as children of the unique base key..

## Static translations

Static translations are simply key-value pairs of strings as children of the unique base key.

**NL**

```json
{
    "en": {
        "general": {
            "allowCookies": "Allow cookies",
        },
        "products": {
            "strawberry": {
                "name": "Strawberry"
            }
        }
    }
}
```

**FR**

```json
{
    "fr": {
        "general": {
            "allowCookies": "Allow les cookies",
        },
        "products": {
            "strawberry": {
                "name": "Le strawberry"
            }
        }
    }
}
```

## Interpolated translations

Interpolated translations are translations which can show a dynamic string or number variable when used. The syntax of parsing a variable is by inserting the variable name between `{}`. E.g.: `{size}`.

**EN**

```json
{
    "en": {
        //..
       "products": {
            "strawberry": {
                //..
                // Could be interpolated with { weight: 355 }: 'Strawberry of 355 grams'
                "weighted": "Strawberry of {weight} grams"           
            }
        }
    }
}
```

**FR**

```json
{
    "fr": {
        //..
       "products": {
            "strawberry": {
                //..
                // Could be interpolated with { weight: 355 }: 'Le strawberry of 355 grams'
                "weighted": "Le strawberry of {weight} grams"              
            }
        }
    }
}
```

#### Pluralized translations

Pluralized translations are translations of which a none, singular or plural form will automatically be inferred. The chosen value is based on a fixed and required interpolation value of key `num` and an integer value. 

Pluralized translations require an object of the following keys: `none`, `singular` and `plural`.

**EN**

```json
{
    "en": {
        //..
       "products": {
            "strawberry": {
                //..
                "numbered": {  // Must be interpolated with { num: 0 } or { num: 1 } or { num: 2 } etc.
                    "none": "No strawberries",
                    "singular": "One strawberry",
                    "plural": "{num} strawberries",
                }
            }
        }
    }
}
```

**FR**

```
{
    "fr": {
        //..
       "products": {
            "strawberry": {
                //..
                "numbered": {
                    "none": "Le no strawberry",
                    "singular": "Un strawberry",
                    "plural": "{num} strawberry",
                }
            }
        }
    }
}
```

## HTML in translation values

Translation values can contain HTML tags, although the html will **not** automatically parsed. For now, strings containing HTML have to be parsed manually. 