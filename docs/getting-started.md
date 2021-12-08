# Getting Started

The recommended way to use the library is to add [npm package](https://www.npmjs.com/package/hybrids) to your application:

```bash
npm i hybrids
```

## ES Modules

You can use the library directly from the [unpkg.com/hybrids](https://unpkg.com/hybrids@^5) CDN:

```html
<script type="module">
  import { html, define } from 'https://unpkg.com/hybrids@^7';
  ...
</script>
```

!> Keep in mind that this mode does not provide code minification and loads all required files in separate requests

## Hot Module Replacement

HMR works out of the box, but your bundler setup may require indication that an entry point supports it. For [`webpack`](https://webpack.js.org) and [`parcel`](https://parceljs.org/) add the following code to your entry point:

```javascript
// Enable HMR for development
if (process.env.NODE_ENV !== 'production') module.hot.accept();
```

If the entry point imports files that do not support HMR, you can place the above snippet in a module where you define your web components. (where `define` method from the library is used).

## Browser Support

[![Build Status](https://app.saucelabs.com/browser-matrix/hybrids.svg)](https://app.saucelabs.com/open_sauce/user/hybrids/builds)

The source code of the library uses ES2015+ syntax. You can use hybrids in all modern browsers without additional preparation. The IE11 is no longer supported (starting from `v5.0.0`).

Some of the browsers (like older versions of Edge) does not support Shadow DOM and Custom Elements API. The library still detects usage of the polyfills, so you can use the library in those browsers by adding[`@webcomponents/webcomponentsjs`](https://github.com/webcomponents/webcomponentsjs) package on top of your project:

```javascript
import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
```

The polyfill package provides two modes in which you can use it (`webcomponents-bundle.js` and `webcomponents-loader.js`). Read more in the [How to use](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs#how-to-use) section of the documentation.

Web components shims have some limitations. Especially, [`webcomponents/shadycss`](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#shadycss) approximates CSS scoping and CSS custom properties inheritance. Read more on the [known issues](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs#known-issues) and [custom properties shim limitations](https://www.polymer-project.org/3.0/docs/devguide/custom-css-properties#custom-properties-shim-limitations) pages.