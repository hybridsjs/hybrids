# Hybrids

[![npm version](https://badge.fury.io/js/hybrids.svg)](https://badge.fury.io/js/hybrids)
[![Build Status](https://travis-ci.org/hybridsjs/hybrids.svg?branch=master)](https://travis-ci.org/hybridsjs/hybrids)
[![Coverage Status](https://coveralls.io/repos/github/hybridsjs/hybrids/badge.svg?branch=master)](https://coveralls.io/github/hybridsjs/hybrids?branch=master)

Hybrids is a toolkit for creating web components using [Custom Elements](https://www.w3.org/TR/custom-elements/), [Template](https://www.w3.org/TR/html-templates/) and [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) specifications. It supposed to create the simplest and the easiest to use API.

Name of the project is taken from *hybrid architecture*, which is a core concept of the library.

#### Hybrid Architecture

* Component logic decoupled from custom element prototype
* Full logic encapsulation with flexible public access
* Public attributes and properties mapping with type reflection
* Normalized lifecycle callbacks
* Easily extendable functionality with plugins
* Helpers for listen and dispatch events, get children or parent components and more

## Packages

The Hybrids repo is managed as a monorepo. It is composed of the following packages:

| NPM name       | Type     | UMD | Description                     |
|----------------|----------|-----|---------------------------------|
| [`@hybrids/core`](https://www.npmjs.com/package/@hybrids/core) | core | * | Hybrid custom elements definition and Helpers |
| [`@hybrids/engine`](https://www.npmjs.com/package/@hybrids/engine) | plugin | * | View engine with unidirectional data binding using consistent and predictable micro DSL |
| [`@hybrids/vdom`](https://www.npmjs.com/package/@hybrids/vdom) | plugin | * | Middleware for connecting any React-like render library |
| [`@hybrids/shim`](https://www.npmjs.com/package/@hybrids/shim) | utility  | | Collection of polyfills required for [Custom Elements](https://www.w3.org/TR/custom-elements/), [Template](https://www.w3.org/TR/html-templates/) and [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) specifications |
| [`@hybrids/debug`](https://www.npmjs.com/package/@hybrids/debug) | utility  | | DevTools console documentation from error messages |

Packages use `process.env.NODE_ENV !== 'production'` to detect if they are used in development mode. Remember to create production bundle with `process.env.NODE_ENV` set to `'production'`.

## Installation

The best way is to use package manager and JavaScript bundler (e.g. [webpack](https://webpack.js.org/)).

```bash
npm i -S @hybrids/{core,engine}
```

```javascript
import { define } from '@hybrids/core';
import { engine } from '@hybrids/engine';
```

### Built Version

You can use built version of the toolkit. Bundle contains packages listed above where UMD column is checked. The packages use unique named exports, so you can access all available API from `window.hybrids` namespace, e.g.: `hybrids.define` or `hybrids.engine`.

```html
<!-- Development mode -->
<script src="https://unpkg.com/hybrids/dist/hybrids.js"></script>

<!-- Productiom mode -->
<script src="https://unpkg.com/hybrids/dist/hybrids.min.js"></script>
```

These urls target latest version of the toolkit. You can specify version: `.../hybrids@0.6.2/dist/...`.

## Documentation

You can read documention [here](docs/README.md).

## Example

Simple Counter component can be defined like this:

```javascript
class MyCounter {
  constructor() {
    this.value = 0;
  }

  count() {
    this.value += 1;
  }
}
```

It has no inheritance, no dependency injection or difficult structure - just a definition. How can we make it
a web component, but still using it's simple API?

```javascript
import { define } from '@hybrids/core';
import { engine } from '@hybrids/engine';

class MyCounter {
  static get options() {
    return {
      plugins: [engine],
      properties: ['value', 'count']
      template: `{{ value }}`
    };
  }

  constructor() {
    this.value = 0;
  }

  count() {
    this.value += 1;
  }
}

define('my-counter', MyCounter);
```

From now `<my-counter>` is fully working custom element:

* It displays current value in Shadow DOM (with `@hybrids/engine` plugin)
* Value can be set by attribute `<my-counter value="100"></my-counter>`
* You can access your element in DOM and set property `myCounter.value = 10`
  or call `myCounter.count()`

However, the component definition has not changed. There is only one difference - `options` static property. This object contains metadata required for connecting component and custom element.

Example uses `template` option for `@hybrids/engine` plugin, but it can be easily replaced with `@hybrids/vdom` package to use React-like library.

## Browser Support

Hybrids supports all evergreen browsers and IE11 (When required polyfills are included). Also for IE11 ES2015 API polyfill is required. The easiest way is to use `@hybrids/shim`  and [`core-js`](https://github.com/zloirock/core-js) packages at top of your project:

```javascript
import 'core-js/shim'; // For IE11
import '@hybrids/shim';
...
```

`@hybrids/shim` contains following polyfills:

* Custom Elements: [https://github.com/webcomponents/custom-elements](https://github.com/webcomponents/custom-elements)
* Template: [https://github.com/webcomponents/template](https://github.com/webcomponents/template)
* Shady DOM: [https://github.com/webcomponents/shadydom](https://github.com/webcomponents/shadydom)
* Shady CSS: [https://github.com/webcomponents/shadycss](https://github.com/webcomponents/shadycss)

## License

The Hybrids toolkit is released under the [MIT License](https://github.com/hybridsjs/hybrids/blob/master/LICENSE).
