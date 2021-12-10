<center>
<h1>
  <img alt="hybrids" src="https://raw.githubusercontent.com/hybridsjs/hybrids/master/docs/assets/hybrids-full-logo.svg?sanitize=true" align="center">
</h1>
</center>

[![npm version](https://img.shields.io/npm/v/hybrids.svg?style=flat)](https://www.npmjs.com/package/hybrids)
[![build status](https://img.shields.io/travis/hybridsjs/hybrids/master.svg?style=flat)](https://app.travis-ci.com/github/hybridsjs/hybrids)
[![coverage status](https://img.shields.io/coveralls/github/hybridsjs/hybrids.svg?style=flat)](https://coveralls.io/github/hybridsjs/hybrids?branch=master)

A JavaScript framework for creating fully-featured web applications, components libraries, and single web components with unique declarative and functional architecture.

## Quick Look

### Component Model

The component model is based on plain objects and pure functions*, still using the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/Web_Components) under the hood:

```javascript
import { html, define } from "hybrids";
  
function increaseCount(host) {
  host.count += 1;
}

export default define({
  tag: "simple-counter",
  count: 0,
  render: ({ count }) => html`
    <button onclick="${increaseCount}">
      Count: ${count}
    </button>
  `,
});
```

```html
<simple-counter count="42"></simple-counter>
```

[![Edit <simple-counter> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/simple-counter-web-component-built-with-hybrids-library-co2ow?file=/src/SimpleCounter.js)

<small>\* Pure functions only apply to the component definition. Side effects attached to event listeners might mutate the host element.</small>

You can read more in the [Component Model](/component-model/definition.md) section of the documentation.

### Store

The store provides global state management based on declarative model definitions with built-in support for async external storage, relations, offline caching, and many more.

It follows the declarative architecture to simplify the process of defining and using data structures in the component definition:

```javascript
import { define, store, html } from "hybrids";

const User = {
  id: true,
  firstName: "",
  lastName: "",
  [store.connect] : {
    get: id => fetch(`/users/${id}`).then(res => res.json()),
  },
};

define({
  tag: "my-user-details",
  user: store(User),
  render: ({ user }) => html`
    <div>
      ${store.pending(user) && `Loading...`}
      ${store.error(user) && `Something went wrong...`}

      ${store.ready(user) && html`
        <p>${user.firstName} ${user.lastName}</p>
      `}
    </div>
  `,
});
```

```html
<my-user-details user="2"></my-user-details>
```

You can read more in the [Store](/store/usage.md) section of the documentation.

### Router

The router provides a global navigation system for client-side applications. Rather than just matching URLs with the corresponding components, it depends on a tree-like structure of views, which have their own routing configuration in the component definition.

```javascript
import { define, html, router } from "hybrids";

import Home from "./views/Home.js";

export define({
  tag: "my-app",
  views: router(Home),
  content: ({ views }) => html`
    <my-app-layout>
      ${views}
    </my-app-layout>
  `,
});
```

```html
<my-app></my-app>
```

You can read more in the [Router](/router/usage.md) section of the documentation.

## Community

* Follow on [Twitter](https://twitter.com/hybridsjs)
* Chat on [Gitter](https://gitter.im/hybridsjs)

## License

`hybrids` is released under the [MIT License](LICENSE).
