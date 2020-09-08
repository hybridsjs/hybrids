# Installation

The recommended way is to add [npm package](https://www.npmjs.com/package/hybrids) to your application:

```bash
npm i hybrids
```

## ES Modules

If you target modern browsers you can use the library directly from the [unpkg.com/hybrids](https://unpkg.com/hybrids@^4/src) CDN:

```html
<script type="module">
  import { html, define } from 'https://unpkg.com/hybrids@^4/src';
  ...
</script>
```

!> Keep in mind that this mode does not provide code minification and loads all required files in separate requests

## Modes

The library supports `development` and `production` modes. The following features works only in the `development` mode:

- Template engine checks if all custom elements are defined and logs into the console errors using the template body
- `store` logs into the console uncaught promise errors
- `define()` allows re-defining elements for hot module replacement support
  
The mode is detected by the `process.env.NODE_ENV === "production"` condition. Usually, bundlers support access to `process.env.NODE_ENV` out of the box, but if environment does not provide that object, the library fallbacks to the production mode.

## Hot Module Replacement

HMR works out of the box in `development` mode, but your bundler setup may require indication that an entry point supports it. For [`webpack`](https://webpack.js.org) and [`parcel`](https://parceljs.org/) add the following code to your entry point:

```javascript
// Enable HMR for development
if (process.env.NODE_ENV !== 'production') module.hot.accept();
```

If the entry point imports files that do not support HMR, you can place the above snippet in a module where you define your web components. (where `define` method from the library is used).

## Browser Support

[![Build Status](https://app.saucelabs.com/browser-matrix/hybrids.svg)](https://app.saucelabs.com/open_sauce/user/hybrids/builds)

The library requires ES2015 APIs, [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/), [Custom Elements](https://www.w3.org/TR/custom-elements/), and [Template](https://www.w3.org/TR/html-templates/) specifications. You can use hybrids in all evergreen browsers without additional preparation.

The test suite still runs on IE11, but the next major version (`v5.0.0`) will only support evergreen browsers. If you still target obsolete or dead browsers (like IE11) you must add a list of required polyfills and shims.

At first, add [`@webcomponents/webcomponentsjs`](https://github.com/webcomponents/webcomponentsjs) package on top of your project:

```javascript
import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
```

The polyfill package provides two modes in which you can use it (`webcomponents-bundle.js` and `webcomponents-loader.js`). Read more in the [How to use](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs#how-to-use) section of the documentation.

Web components shims have some limitations. Especially, [`webcomponents/shadycss`](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#shadycss) approximates CSS scoping and CSS custom properties inheritance. Read more on the [known issues](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs#known-issues) and [custom properties shim limitations](https://www.polymer-project.org/3.0/docs/devguide/custom-css-properties#custom-properties-shim-limitations) pages.

Additionally, the [store](./docs/store/introduction.md) feature requires a fix for [broken implementation](https://github.com/zloirock/core-js/issues/384) of the `WeakMap` in IE11:

```javascript
import "core-js/es/weak-map";
```
