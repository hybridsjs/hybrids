# Getting Started

## Installation

If your application uses a bundler (like [Vite](https://vitejs.dev/) or [Snowpack](https://www.snowpack.dev/)), just add the [npm package](https://www.npmjs.com/package/hybrids) to your application:

```bash
npm i hybrids
```

Otherwise, you can use it directly from a number of CDNs, which provides packages from the registry:

* [https://esm.sh/hybrids@^8](https://esm.sh/hybrids@^8) (2 requests, minified)
* [https://cdn.skypack.dev/hybrids@^8?min](https://cdn.skypack.dev/hybrids@^8?min) (2 request, minified)
* [https://unpkg.com/hybrids@^8](https://unpkg.com/hybrids@^8) (multiple requests, not minified)

```html
<script type="module">
  import { html, define } from 'https://esm.sh/hybrids@^8';
  ...
</script>
```

### Hot Module Replacement

HMR works out of the box, but your bundler setup may require indication that an entry point can be replaced on the fly. For example, for bundlers using ES module syntax, you can use the following code:

```javascript
// Enable HMR for development
if (import.meta.hot) import.meta.hot.accept();
```

If the entry point imports files that do not support HMR, you can place the above snippet in a module where you define your web components. (where `define` method from the library is used).

## Browser Support

The library source code uses ES modules and currently supported JavaScript syntax by all of the major browsers. You can use hybrids in all modern browsers without code transpilation and bundling.

[![Build Status](https://app.saucelabs.com/browser-matrix/hybrids.svg)](https://app.saucelabs.com/open_sauce/user/hybrids/builds)