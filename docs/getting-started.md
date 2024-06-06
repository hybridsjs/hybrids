# Getting Started

## Installation

If your application setup uses a bundler (like [Vite](https://vitejs.dev/)), just add the [npm package](https://www.npmjs.com/package/hybrids) to your application:

```bash
npm i hybrids
```

Otherwise, you can use it directly from a number of CDNs, which provide a hybrids from the registry:

* [https://esm.sh/hybrids@^9](https://esm.sh/hybrids@^9) (2 requests, minified)
* [https://cdn.skypack.dev/hybrids@^9?min](https://cdn.skypack.dev/hybrids@^9?min) (2 request, minified)
* [https://unpkg.com/hybrids@^9](https://unpkg.com/hybrids@^9) (multiple requests, not minified)

```html
<script type="module">
  import { define, html } from 'https://esm.sh/hybrids@^9';
  
  define({
    tag: "hello-world",
    name: '',
    render: ({ name }) => html`<p>Hello ${name}!</p>`,
  });
</script>
```

### Hot Module Replacement

HMR is supported out of the box, but your bundler setup may require indication that an entry point can be replaced on the fly. For example, for bundlers using ES module syntax, you can use the following code:

```javascript
// Enable HMR only in development mode
if (import.meta.hot) import.meta.hot.accept();
```

If the entry point imports files that do not support HMR, you can place the above snippet in a module where you define your web components. (where `define` method from the library is used).

## Browser Support

The library source code uses ES modules and currently supported JavaScript syntax by all of the major browsers. You can use hybrids in all modern browsers without code transpilation and bundling.
