<h1 align="center">
  <img alt="hybrids - the web components" src="https://raw.githubusercontent.com/hybridsjs/hybrids/master/docs/assets/hybrids-full-logo.svg?sanitize=true" width="500" align="center">
  <br/>
</h1>

[![npm version](https://img.shields.io/npm/v/hybrids.svg?style=flat)](https://www.npmjs.com/package/hybrids)
[![bundle size](https://img.shields.io/bundlephobia/minzip/hybrids.svg?label=minzip)](https://bundlephobia.com/result?p=hybrids)
[![types](https://img.shields.io/npm/types/webcomponents-in-react.svg?style=flat)](https://github.com/hybridsjs/hybrids/blob/master/types/index.d.ts)
[![build status](https://img.shields.io/travis/hybridsjs/hybrids/master.svg?style=flat)](https://travis-ci.com/hybridsjs/hybrids)
[![coverage status](https://img.shields.io/coveralls/github/hybridsjs/hybrids.svg?style=flat)](https://coveralls.io/github/hybridsjs/hybrids?branch=master)
[![npm](https://img.shields.io/npm/dt/hybrids.svg)](https://www.npmjs.com/package/hybrids)
[![gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?colorB=893F77)](https://gitter.im/hybridsjs/hybrids)
[![twitter](https://img.shields.io/badge/follow-on%20twitter-4AA1EC.svg)](https://twitter.com/hybridsjs)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![GitHub](https://img.shields.io/github/license/hybridsjs/hybrids.svg)](LICENSE)

> 🏅One of the four nominated projects to the **"Breakthrough of the year"** category of [Open Source Award](https://osawards.com/javascript/) in 2019

**Hybrids** is a UI library for creating [web components](https://www.webcomponents.org/) with strong declarative and functional approach based on plain objects and pure functions.

* **The simplest definition** — just plain objects and pure functions - no `class` and `this` syntax
* **No global lifecycle** — independent properties with own simplified lifecycle methods
* **Composition over inheritance** — easy re-use, merge or split property definitions
* **Super fast recalculation** — built-in smart cache and change detection mechanisms
* **Templates without external tooling** — template engine based on tagged template literals
* **Developer tools included** — Hot module replacement support for a fast and pleasant development

## Getting Started

Add the hybrids [npm package](https://www.npmjs.com/package/hybrids) to your application, or use [unpkg.com/hybrids](https://unpkg.com/hybrids@^4/src) CDN for direct usage in the browser. 

Then, import required features and define your custom element:

```javascript
import { html, define } from 'hybrids';

export function increaseCount(host) {
  host.count += 1;
}

export const SimpleCounter = {
  count: 0,
  render: ({ count }) => html`
    <button onclick="${increaseCount}">
      Count: ${count}
    </button>
  `,
};

define('simple-counter', SimpleCounter);
```

Finally, use your custom element in HTML document:

```html
<simple-counter count="10"></simple-counter>
```

> Click and play with `<simple-counter>` example:
>
> [![Edit <simple-counter> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/simple-counter-web-component-built-with-hybrids-library-co2ow?file=/src/SimpleCounter.js)

### ES Modules

If you target modern browsers you can use source code directly in the script tag:

```html
<script type="module">
  import { html, define } from 'https://unpkg.com/hybrids@^4/src';
  ...
</script>
```

> Be aware, that this mode does not provide code minification and loads all required files in separate requests.

### Hot Module Replacement

HMR works out of the box, but your bundler setup may require indication that your entry point supports it. For [`webpack`](https://webpack.js.org) and [`parcel`](https://parceljs.org/) add the following code to your entry point:

```javascript
// Enable HMR for development
if (process.env.NODE_ENV !== 'production') module.hot.accept();
```

If your entry point imports files that do not support HMR, you can place the above snippet in a module where you define a custom element. (where `define` method from the library is used).

## Overview

There are some common patterns among JavaScript UI libraries like class syntax, a complex lifecycle or stateful architecture. What can we say about them?

Classes can be confusing, especially about how to use `this` or `super()` calls. They are also hard to compose. Multiple lifecycle callbacks have to be studied to understand very well. A stateful approach can open doors for difficult to maintain, imperative code. Is there any way out from all of those challenges?

After all, the class syntax in JavaScript is only sugar on top of the constructors and prototypes. Because of that, we can switch the component structure to a map of properties applied to the prototype of the custom element class constructor. Lifecycle callbacks can be minimized with smart change detection and cache mechanism. Moreover, they can be implemented independently in the property scope rather than globally in the component definition.

With all of that, the code may become simple to understand, and the code is written in a declarative way. Not yet sold? You can read more in the [Core Concepts](docs/core-concepts/README.md) section of the project documentation.

## Documentation

The hybrids documentation is available at [hybrids.js.org](https://hybrids.js.org) or in the [docs](docs/README.md) path of the repository:

* [Core Concepts](docs/core-concepts/README.md)
* [Built-in Factories](docs/built-in-factories/README.md)
* [Template Engine](docs/template-engine/README.md)
* [Misc](docs/misc/README.md)

### Articles

* [Do we really need classes in JavaScript after all?](https://dev.to/smalluban/do-we-really-need-classes-in-javascript-after-all-91n)
* [Let's Build Web Components! Part 7: Hybrids](https://dev.to/bennypowers/lets-build-web-components-part-7-hybrids-187l)

#### Core Concepts Series

* [From classes to plain objects and pure functions](https://dev.to/smalluban/from-classes-to-plain-objects-and-pure-functions-2gip)
* [Say goodbye to lifecycle methods, and focus on productive code](https://dev.to/smalluban/how-to-say-goodbye-to-lifecycle-methods-and-focus-on-productive-code-175)
* [Chasing the best performance of rendering the DOM by hybrids library](https://dev.to/smalluban/chasing-the-best-performance-of-rendering-the-dom-by-hybrids-library-436d)
* [Three unique features of the hybrids template engine that you must know](https://dev.to/smalluban/three-unique-features-of-the-hybrids-template-engine-that-you-must-know-5ada)

### Videos

* [Taste the Future with Functional Web Components](https://youtu.be/WZ1MEHuxHGg) *(EN, ConFrontJS Conference)*
* [Hybrids - Web Components with Simple and Functional API](https://youtu.be/ni0d34Yrugk) *(PL, WarsawJS Meetup #46)

### Live Examples

* [&lt;simple-counter&gt;](https://codesandbox.io/s/simple-counter-web-component-built-with-hybrids-library-co2ow?file=/src/SimpleCounter.js) - a button with counter controlled by own state
* [&lt;redux-counter&gt;](https://codesandbox.io/s/redux-counter-web-component-built-with-hybrids-library-jrqzp?file=/src/ReduxCounter.js) - Redux library for state management
* [&lt;react-counter&gt;](https://codesandbox.io/s/react-counter-web-component-built-with-hybrids-library-u0g8k?file=/src/ReactCounter.jsx) - render factory and [React](https://reactjs.org/) library for rendering in shadow DOM
* [&lt;lit-counter&gt;](https://codesandbox.io/s/lit-counter-web-component-built-with-hybrids-library-qoqb5?file=/src/LitCounter.js) - render factory and [lit-html](https://lit-html.polymer-project.org/) for rendering in shadow DOM
* [&lt;app-todos&gt;](https://codesandbox.io/s/app-todos-web-components-built-with-hybrids-library-behpb?file=/src/index.js) - todo list using parent factory for state management
* [&lt;tab-group&gt;](https://codesandbox.io/s/tab-group-web-component-built-with-hybrids-library-e2t3e?file=/src/index.js) - switching tabs using children factory
* [&lt;async-user&gt;](https://codesandbox.io/s/async-user-web-component-built-with-hybrids-library-fhx3j?file=/src/AsyncUser.js) - async data in the template

## Browser Support

[![Build Status](https://app.saucelabs.com/browser-matrix/hybrids.svg)](https://app.saucelabs.com/open_sauce/user/hybrids/builds)

The library requires ES2015 APIs, [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/), [Custom Elements](https://www.w3.org/TR/custom-elements/), and [Template](https://www.w3.org/TR/html-templates/) specifications. You can use hybrids in all evergreen browsers without additional preparation.

### Older Browsers

The library test suite runs on IE11, but in near future only evergreen browsers will be supported starting from `v5.0.0` release. However, if you still target obsolete or dead browsers (like IE11) you must add a list of required polyfills and shims.

#### Web Components

At first, add [`@webcomponents/webcomponentsjs`](https://github.com/webcomponents/webcomponentsjs) package on top of your project:

```javascript
import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
```

The polyfill package provides two modes in which you can use it (`webcomponents-bundle.js` and `webcomponents-loader.js`). Read more in the [How to use](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs#how-to-use) section of the documentation.

Web components shims have some limitations. Especially, [`webcomponents/shadycss`](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#shadycss) approximates CSS scoping and CSS custom properties inheritance. Read more on the [known issues](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs#known-issues) and [custom properties shim limitations](https://www.polymer-project.org/3.0/docs/devguide/custom-css-properties#custom-properties-shim-limitations) pages.

#### Store

Additionally, the [store](./docs/store/introduction.md) feature requires a fix for [broken implementation](https://github.com/zloirock/core-js/issues/384) of the `WeakMap` in IE11:

```javascript
import "core-js/es/weak-map";
```

## License

`hybrids` is released under the [MIT License](LICENSE).
