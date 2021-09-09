<h1>
  <img alt="hybrids - the web components" src="https://raw.githubusercontent.com/hybridsjs/hybrids/master/docs/assets/hybrids-full-logo.svg?sanitize=true" width="350" align="center">
  <br/>
</h1>

[![npm version](https://img.shields.io/npm/v/hybrids.svg?style=flat)](https://www.npmjs.com/package/hybrids)
[![build status](https://img.shields.io/travis/hybridsjs/hybrids/master.svg?style=flat)](https://app.travis-ci.com/github/hybridsjs/hybrids)
[![coverage status](https://img.shields.io/coveralls/github/hybridsjs/hybrids.svg?style=flat)](https://coveralls.io/github/hybridsjs/hybrids?branch=master)

**hybrids** is a UI library for creating [web components](https://www.webcomponents.org/) with unique declarative and functional approach based on plain objects and pure functions.

* **The simplest definition** — just plain objects and pure functions - no `class` and `this` syntax
* **No global lifecycle** — independent properties with own simplified lifecycle methods
* **Composition over inheritance** — easy re-use, merge or split property descriptors
* **Super fast recalculation** — smart cache and change detection mechanisms
* **Global state management** - model definitions with support for external storages
* **Templates without external tooling** — template engine based on tagged template literals
* **Developer tools included** — HMR support out of the box for a fast and pleasant development

## Quick Look

```html
<script type="module">
  import { html, define } from 'https://unpkg.com/hybrids@^6';
  
  function increaseCount(host) {
    host.count += 1;
  }

  define({
    tag: "simple-counter",
    count: 0,
    render: ({ count }) => html`
      <button onclick="${increaseCount}">
        Count: ${count}
      </button>
    `,
  });
</script>

<simple-counter count="10"></simple-counter>
```

[![Edit <simple-counter> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/simple-counter-web-component-built-with-hybrids-library-co2ow?file=/src/SimpleCounter.js)

## Documentation

The project documentation is available at the [hybrids.js.org](https://hybrids.js.org) site.

## Community

* Follow on [Twitter](https://twitter.com/hybridsjs)
* Chat on [Gitter](https://gitter.im/hybridsjs)

## License

`hybrids` is released under the [MIT License](LICENSE).
