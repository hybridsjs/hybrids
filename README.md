<h1>
  <img src="docs/assets/hybrids-logo.svg" width="70" align="center">
  <big>hybrids</big>
</h1>

[![npm version](https://img.shields.io/npm/v/hybrids.svg?style=flat)](https://www.npmjs.com/package/hybrids)
[![bundle size](https://img.shields.io/bundlephobia/minzip/hybrids.svg?label=minzip)](https://bundlephobia.com/result?p=hybrids@1.4.2)
[![build status](https://img.shields.io/travis/hybridsjs/hybrids.svg?style=flat)](https://travis-ci.org/hybridsjs/hybrids)
[![coverage status](https://img.shields.io/coveralls/github/hybridsjs/hybrids.svg?style=flat)](https://coveralls.io/github/hybridsjs/hybrids?branch=master)
[![gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?colorB=893F77)](https://gitter.im/hybridsjs/hybrids)
[![twitter](https://img.shields.io/badge/follow-on%20twitter-4AA1EC.svg)](https://twitter.com/hybridsjs)

**Hybrids** is a UI library for creating [Web Components](https://www.webcomponents.org/), which favors plain objects and pure functions over  `class` and `this` syntax. It provides simple and functional API for creating custom elements.

* **The simplest definition** — just plain objects and pure functions
* **Composition over inheritance** — easy re-use, merge or split property definitions
* **No global lifecycle callbacks** — no did* or will* and only in the independent property definition
* **Super fast recalculation** — built-in cache mechanism secures performance and data flow
* **Templates without external tooling** — template engine based on tagged template literals
* **Developer tools included** — Hot module replacement support for fast and pleasant development

## Getting Started

Install npm package:

<pre>npm i <a href=https://www.npmjs.com/package/hybrids>hybrids</a></pre>

Then, import required features and define a custom element:

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

👆 [Click and play on ⚡StackBlitz](https://stackblitz.com/edit/hybrids-simple-counter?file=simple-counter.js)

Finally, use your custom element in HTML:

```html
<simple-counter count="10"></simple-counter>
```

### Built Version

You can also use the built version from [unpkg.com](https://unpkg.com) CDN (with `window.hybrids` global namespace): 
```html
<script src="https://unpkg.com/hybrids@[PUT_VERSION_HERE:x.x.x]/dist/hybrids.js"></script>
```

## Overview

There are some common patterns among JavaScript UI libraries like class syntax, complex lifecycle or stateful architecture. What can we say about them?

Classes can be confusing, especially about how to use `this`, binding or `super()` calls. They are also hard to compose. Complex lifecycle callbacks have to be studied to understand very well. A stateful approach can open doors for difficult to maintain, imperative code. Is there any way out from all of those challenges?

After all, class syntax in JavaScript is only sugar on top of the constructors and prototypes. Because of that, we can switch the component structure to a map of properties applied to the prototype of the custom element class constructor. Lifecycle callbacks can be minimized with smart change detection and cache mechanism. Moreover, they can be implemented independently in the property scope rather than globally in the component definition.

With all of that, the code may become simple to understand, and the code is written in a declarative way. Not yet sold? You can read more in the [Core Concepts](docs/core-concepts/README.md) section of the project documentation.

## Documentation

The hybrids documentation is available at [hybrids.js.org](https://hybrids.js.org) or in the [docs](docs/README.md) path of the repository:

- [Core Concepts](docs/core-concepts/README.md)
- [Built-in Factories](docs/built-in-factories/README.md)
- [Template Engine](docs/template-engine/README.md)
- [Misc](docs/misc/README.md)

### Live Examples

- [&lt;simple-counter&gt;](https://stackblitz.com/edit/hybrids-simple-counter?file=simple-counter.js) - a button with counter controlled by own state
- [&lt;redux-counter&gt;](https://stackblitz.com/edit/hybrids-redux-counter?file=redux-counter.js) - Redux library for state management
- [&lt;react-counter&gt;](https://stackblitz.com/edit/hybrids-react-counter?file=react-counter.js)  - render factory and React library for rendering in shadow DOM
- [&lt;app-todos&gt;](https://stackblitz.com/edit/hybrids-parent-factory?file=index.js) - todo list using parent factory for state management
- [&lt;tab-group&gt;](https://stackblitz.com/edit/hybrids-children-factory?file=index.js) - switching tabs using children factory

### Articles

* [Do we really need classes in JavaScript after all?](https://dev.to/smalluban/do-we-really-need-classes-in-javascript-after-all-91n)
* [Let's Build Web Components! Part 7: Hybrids](https://dev.to/bennypowers/lets-build-web-components-part-7-hybrids-187l)

### Videos

* [Taste the Future with Functional Web Components](https://youtu.be/WZ1MEHuxHGg) (EN, ConFrontJS Conference)
* [Hybrids - Web Components with Simple and Functional API](https://youtu.be/ni0d34Yrugk) (PL, WarsawJS Meetup #46)
  
## Browser Support

[![Build Status](https://saucelabs.com/browser-matrix/hybrids.svg)](https://saucelabs.com/u/hybrids)

The library requires some of the ES2015 APIs and [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/), [Custom Elements](https://www.w3.org/TR/custom-elements/), and [Template](https://www.w3.org/TR/html-templates/) specifications. You can use `hybrids` in all evergreen browsers and IE11 including a list of required polyfills and shims. The easiest way is to add the following code on top of your project:

```javascript
// ES2015 selected APIs polyfills loaded in IE11
// Web Components shims and polyfills loaded if needed (external packages)
import 'hybrids/shim'; 
...
```

Web components shims have some limitations. Especially, [`webcomponents/shadycss`](https://github.com/webcomponents/shadycss) approximates CSS scoping and CSS custom properties inheritance. Read more on the [known issues](https://github.com/webcomponents/webcomponentsjs#known-issues) and [custom properties shim limitations](https://www.polymer-project.org/3.0/docs/devguide/custom-css-properties#custom-properties-shim-limitations) pages.

The library calls shims if needed, so direct use is not required.

## License

`hybrids` is released under the [MIT License](LICENSE).