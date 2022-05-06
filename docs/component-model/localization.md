# Localization

The library supports seamless and fully featured integration with the localization process. Messages in templates are translated automatically based on the text content of elements. To translate messages with plural forms, HTML content, or generate messages for the context outside of the template use `msg` helper function.

Bringing the localization into your existing application may not require any changes to the source code. Usually, what you only need is providing the translated messages, and initialize them with `localize` function. The process is global, and every component using the built-in template engine will be able to use the messages.

## Templates

The text content of the elements is translated automatically while the template is compiled. This process is done only once when the first instance of the component using the template is rendered. Translations in templates does not support changing language dynamically nor plural forms or HTML content. Once the template is compiled, the template body saves the target messages, so the messages are not changed later.

```javascript
import { define, html, localize } from "hybrids";

export default define({
  tag: "my-element",
  name: "",
  render: ({ name }) => html`
    <div>Hello ${name}!</div>
  `,
});

localize("pl", {
  "Hello ${0}!": {
    message: "Witaj ${0}!",
  },
});
```

In the above example, to translate the component content, we just need to add the correct message to the `localize` function, but the component structure is not changed.

### Key

The key is generated from the text content of the element. It is trimmed before matching, but the whitespace in the template is preserved. Attributes of the elements are not translated.

The expressions inside of the text content are replaced with the `${\d}` placeholders with ascending index, always starting from zero (it avoids the key mismatch when new expression is added to the template). However, the order of the expressions in the translated message might be different.

```javascript
import { define, html, localize } from "hybrids";

define({
  tag: "my-element",
  name: "",
  value: "",
  render: ({ name, value }) => html`
    <div>
      <div>Hello ${name}!</div>
      <div>Values: ${value}, ${name}</div>
    </div>
  `,
});
```

In the above example, both text contents translation keys will have `${0}` placeholder: `Hello ${0}!` and `Value: ${0}, ${1}`. The order of the expressions can be changed, so for example the translated message might be `Wartości: ${1}, ${0}`.

### Description & Context

Use the HTML comment to provide additional metadata for the translation. It can be also used to split messages from the same text content.

```javascript
import { define, html } from "hybrids";

export default define({
  tag: "my-element",
  name: "",
  render: ({ name }) => html`
    <div>
      <!-- This is simple hello message | my-element -->
      Hello ${name}!
    </div>
    <div>
      The first message
      <!-- | only-context -->
      Second message
    </div>
  `,
});
```

The text of the comment split by the `|` character is used as the description and context for the message.

If the context is provided, the key of the message will be generated from the text content and the context split by `|` character. However, the context is never added to the missing translations. If the message with the context is not found, the message key without the context will be used.

In above example, the library will try to find message with a  `Second message | only-context` key. If the message is not found, the library will try to find message with a `Second message` key.

### Disable Translation

The translation process omits `<script>` and `<style>` elements by default. To disable translation of subset of other elements, use `translate="no"` attribute. The translation process will be skipped for the text content and descendants of the element.

```javascript
import { define, html, localize } from "hybrids";

define({
  tag: "my-element",
  render: () => html`
    <div>
      <div>Translated text</div>
      <div translate="no">
        MyCompany © 2022 <span>Copyright ...</span>
      </div>
    </div>
  `,
})
```

## Manual Translation

For more complex scenarios, you should manually translate the messages using the `msg` helper. The main function produces the string content of the message, so it can be  used outside of the template context.

```typescript
msg`This is a message with ${value} | description | context`: string
```

* **arguments**:
  * String as a message key. The same rules for expressions as in the text content are applied. The key is trimmed, and the description or context are detected by the `|` character. If your message key must contain the `|` character, use `&#124;` escaped version
  * `value` - dynamic values for the message
* **returns**:
  * a string content of the translated message

If the message is a static part of the template, you should avoid the  `msg` helper, as it generates dynamic expression in the template, and it will be translated each time the template updates. Use it only for the following cases.

### Attributes

If the element's API requires passing translated message as a attribute content, use the `msg` helper inside of the dynamic expression.

```javascript
import { html, msg } from "hybrids";

html`<my-button name="${msg`Submit`}"></my-button>`
```

### Plural Forms

If the value in the dictionary is properly constructed, the `msg` helper uses the first dynamic expression value to detect the plural form of the message (cardinal numbers).

The plural forms are supported out of the box only by the built-in messages format using the `Intl.PluralRules` API. The custom translation function gets a list of arguments, so the feature can be also implemented manually (read more in the [Messages](#messages) section).

```javascript
import { define, html, msg } from "hybrids";

define({
  tag: "my-element",
  count: 0,
  render: () => html`
    <div>${msg`There are ${count} items`}</div>
  `,
});
```

If the `"There are ${0} items"` message is an object with plural forms, the correct form according to the `count` value will be used. Even though, the language may not support the `zero` plural form, if the count is equal to `0`, you can set it to custom message like `There are no items`. Otherwise, use the `zero` type correctly with language rules, as it can be used for another values.

The value fallbacks to `other` type if the correct type is not found. It means, that if you are aware that in your case no other than `one` or `zero` types are different, you can define only `one` and `other` type.

### HTML & SVG Content

The automatic translation in templates only takes text content into account. If your message must contain HTML or SVG content, use the `msg.html` or `msg.svg` helper methods to generate the nested template function. Keep in mind, that the whole body of the message generates the key. Returned function should be used in the same way as a `html` or `svg` functions from the template engine.

```javascript
import { define, html, msg } from "hybrids";

const url = "https://some-domain.com/";

define({
  tag: "my-element",
  render: () => html`
    <p>
      ${msg.html`Click <a href="${url}">here</a> to accept terms and conditions`}
    </p>
  `,
});
```

The above `msg.html` helper will search for `"Click <a href="${0}">here</a> to accept terms and conditions"` message key in the dictionary. Use dynamic expressions to avoid passing distracting information to the key, like the anchor URL.

!> Both `msg.html` and `msg.svg` methods must not sanitize the content, so they are open for the XSS attack, if the message contains any malicious code. It is recommended to avoid using them if it is not required.

## Messages

Use `localize` function to add translated messages to the dictionary, or define your custom translation function. The function must be called before templates are complied (before the first render of the element) and before invoking the `msg` helper.

### Built-in format

```typescript
localize(lang: string, messages: object): void
```

* **arguments**:
  * `lang` - a string with a language code, with or without region code, or `"default"` for the default language
  * `messages` - an object with translated messages in the following format:

    ```javascript
    {
      "This is a message | context": {
        message: "To jest wiadomość",
        description: "This is description",
      },
      "You have ${0} messages": {
        message: {
          one: "Masz jedna wiadomość",
          other: "Masz ${0} wiadomości",
          ...,
        }
      }
      ...,
    }
    ```

#### Format

The messages format is similar to the [`chrome.i18n`](https://developer.chrome.com/docs/extensions/reference/i18n/) file structure with custom support for placeholders and plural forms. The `description` field is optional, and it is not used in the translation process, but it can be autogenerated from the code. The `message` for plural forms must be an object with the `one`, `two`, `few`, `many` or `other` keys according to the locale rules.

The library generates a list of user's preferred language codes using `navigator.languages` and `navigator.language` properties with added locales without the regions (if not defined). The massage is searched in the dictionary in order of the list of languages. It means, that if translations are not complete, messages might be displayed in multiple languages.

#### Keys

It is recommended to use the default message in origin language as a key. It provides a seamless integration with existing code, and allows keeping the code understandable. For the duplicates with different meaning you can use context feature. To support plural forms, you can create selective translations for your origin language and use `msg` helper.

```javascript
import { localize } from "hybrids";

localize("pl", {
  "Home page: {
    message: "Strona główna",
  },
  ...,
});
```

If you use structured keys, like `home.header.title` instead of the message itself, you can provide special `"default"` locale. Then, it is added to the end of the list of languages, so it will be used as a last fallback.

```javascript
import { localize } from "hybrids";

localize("default", {
  "home.header.title": {
    message: "Home page",
  },
  ...,
});
```

#### Async Sources

The `localize` function does not support async sources out of the box. However, if your application setup requires fetching translation messages, you can create the components structure, which will delay the translation until the data is fetched.

The `localize.languages` property keeps the current list of the preferred languages, which can be used to fetch proper translation messages.

```javascript
import { define, html, localize } from "hybrids";

const supportedLangs = ["en", "pl"];

const lang = localize.languages.find(lng => supportedLangs.includes(lng));
const promise = fetch(`/locales/${lang}/messages.json`)
  .then(r => r.json())
  .then((msgs) => localize(lang, msgs));

define({
  tag: "app-wrapper",
  render: () => html.resolve(
    promise.then(() => html`<app-root></app-root>`),
    html`<app-loader></app-loader>`,
  ),
});
```

The main `<app-root>` component will be rendered after the translation is loaded, so the first templates compilation will be invoked after the messages are added to the dictionary. However, the `<app-loader>` must not contain messages, as they will not be translated.

### Custom Function

For a custom translation method, or integration with third party libraries, pass a custom function to the `localize` function.

```typescript
localize(translate: function, options?: object): void
```

* **arguments**:
  * `translate` - a custom translation function in format:

  ```typescript
  (key: string, context: string): string | (number) => string
  ```

  * `options` - an optional object with the following fields:
    * `format` - expected custom format of the message (for now, it only supports `"chrome.i18n"` value)

The translate function bypass the translation process, so the language detection is not applied and it should be done manually. The translate function is global, and it can be only one at the time (still, you can overwrite it).

The function is called if the message is not found in the dictionary. If you relay only on the external translation process, you can skip passing messages in built-in format entirely, or mix both approaches.

The translate function should return a string with the translation or a function that receives a number and returns the translation.

#### `options.format`

The `chrome.i18n` API puts a number of restrictions into the key naming. The library supports automatic transform of the key with its context value into the supported format. Set the setting `options.format` to `"chrome.i18n"` and pass the transform function, which takes a key as the first argument.

```javascript
import { localize } from "hybrids";

localize(chrome.i18n.getMessage, { format: "chrome.i18n" });
```

Use the corresponding option in the extracting tool to generate files with transformed keys:

```bash
npx hybrids extract --format=chrome.i18n ./src ./src/_locales/en/messages.json
```

## Extracting

The library provides handy CLI command to extract messages from the source code to the built-in format. It supports JavaScript and TypeScript syntax.

> The command relay on simplified in-house parser, so not supported edge cases are welcome to be reported

Run `npx hybrids extract ./src` or add it to the `package.json` as a one of the `scripts` field, like: `"extract": "hybrids extract ./src"`.

Run the command without additional arguments to see the usage:

```text
hybrids - message extractor from source files

Pass a single file or a directory, which will be recursively scanned 
for .js and .ts files with messages. If no output file is specified, the output 
will be pushed to stdout.

Usage:
hybrids extract [options] <file or directory> [<output file>]

Options:
-e, --empty-message      Set default message body to empty string
-f, --force              Overwrite output file instead of merge it with existing messages
-p, --include-path       Include path in message description
-h, --help               Show this help

--format=type            Transform messages to the desired format; supported types: chrome.i18n
```
