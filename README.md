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

**hybrids** is a UI library for creating [web components](https://www.webcomponents.org/) with unique declarative and functional approach based on plain objects and pure functions.

* **The simplest definition** — just plain objects and pure functions - no `class` and `this` syntax
* **No global lifecycle** — independent properties with own simplified lifecycle methods
* **Composition over inheritance** — easy re-use, merge or split property descriptors
* **Super fast recalculation** — smart cache and change detection mechanisms
* **Global state management** - model definitions with support for external storages
* **Templates without external tooling** — template engine based on tagged template literals
* **Developer tools included** — HMR support out of the box for a fast and pleasant development

## Quick Look

Add the hybrids [npm package](https://www.npmjs.com/package/hybrids) to your application, import required features, and define your custom element:

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

Use the custom element in HTML document:

```html
<simple-counter count="10"></simple-counter>
```

> Click and play with `<simple-counter>` example:
>
> [![Edit <simple-counter> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/simple-counter-web-component-built-with-hybrids-library-co2ow?file=/src/SimpleCounter.js)

## Documentation

The project documentation is available at the [hybrids.js.org](https://hybrids.js.org) site.

## License

`hybrids` is released under the [MIT License](LICENSE).
