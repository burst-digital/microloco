[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Microloco

Microloco is a micro-sized Javascript/Typescript internationalization library so small it's **loco**.

This library aims to make internationalization easy with as little configuration needed as possible. 

It includes **interpolation** and **pluralization** support based on translations in defined **JSON** files or object literals.

- [Documentation](docs/index.md)
- [Example](example)

# Contributing

Want to contribute? Great! Please branch out from the master version from using a branchname such as `feature/{insert-descriptive-feature-name}` and create a pull request when ready.

Use `npm run build` to build the project.

Make sure you use the `prettier` and `tslint` styleguide in order to be able to commit.

## Todos

- **Make precommit work**
- **Check out Typescript typing when importing the library, something seems to be going wrong**
- **Make `npm` 'ready'**
- **Add React Provider/Consumer and HOC example**
- Test error handling/option handling.
- Use the default language translations when a key is not available in the current language's translations. 
- Support a way of formatting intervals of numbers that map to certain translations.
- Support modifiers on translations through options. *E.g.: { transform: 'lowercase', dotted: true }* 
- Support HTML parsing if HTML is in the string
- Add tests
