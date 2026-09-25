# Localization

Each locale *must* have a `locale_name` key, the value of which is the native name of the language. Otherwise, if a key is not present in a specific locale, its `en` value is used as a fallback.

## Interpolation

The following forms of interpolation are supported:

1. `"This is a {{variable}} value."` - `{{variable}}` is replaced by a contextual variable named `variable`.
2. `"This is a {{%ref}} value."` - `{{%ref}}` is replaced by translating the key `ref` with the same context and attributes (see below).
3. `"This is a {{'literal string'}} value."` - `{{'literal string'}}` is replaced by the text `literal string`. While this form of interpolation isn't useful on its own, it helps to declutter the translations file when the interpolated value has other attributes (see below).

## Attributes

Interpolations can have attributes after the translation key, which are only relevant when the result is sent to the DOM. The following attributes are supported:

- `code` uses a monospace font.
- `link=<link_key>` makes the interpolated text a link. `link_key` is not arbitrary; the list of supported links can be found in `links.ts`

For example, `"{{'This text' link=repo}} is a link to the source code."`

If the translation key is a link, that will be replaced with the full URL of the link. For example, `"This is my website: {{link=alxl}}"` will display `This is my website: https://itsalxl.com`

## API

This section contains information regarding the use of the localization engine, and is not relevant for localizers.

### Translating Context

When a context value is a string that begins with `"%"`, it's treated the same as `{{%ref}}` interpolation. If you want to pass a literal that begins with `"%"`, start with `"%%"` instead.

When a context value is an array, its entries are individually parsed as context values and then joined together. The delimiter can be specified with `context[", "]`; it defaults to the `", "` key in the localization if not present, and again falls back to the literal `", "` if not present in the localization. If `context[",sort"]` is truthy, the items are sorted alphabetically after parsing.

The special localization key `",[]"` always has the value of `"{{,items}}"`, which is a convenient way of creating an aribtrary list.

```js
// localization.json
", ": " :: ",
"foo": "Z translated text"

-----

// code
const example = ["%foo", "A literal text"]

trText(",[]", {",items": example})
// -> "Z translated text :: A literal text"

trText(",[]", {",items": example, ",sort": true})
// -> "A literal text :: Z translated text"

trText(",[]", {",items": example, ", ": " - "})
// -> "Z translated text - A literal text"
```
