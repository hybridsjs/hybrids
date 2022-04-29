
<center>
<h1>
  <img alt="" src="https://raw.githubusercontent.com/hybridsjs/hybrids/master/docs/assets/hybrids-full-logo.svg?sanitize=true" align="center">
</h1>
</center>

[![npm version](https://img.shields.io/npm/v/hybrids.svg?style=flat)](https://www.npmjs.com/package/hybrids)
[![build status](https://img.shields.io/travis/hybridsjs/hybrids/master.svg?style=flat)](https://app.travis-ci.com/github/hybridsjs/hybrids)
[![coverage status](https://img.shields.io/coveralls/github/hybridsjs/hybrids.svg?style=flat)](https://coveralls.io/github/hybridsjs/hybrids?branch=master)

**hybrids** is a JavaScript UI framework for creating fully-featured web applications, components libraries, or single web components with unique mixed declarative and functional architecture.

The main goal of the framework is to provide a complete set of tools for the web platform - everything without external dependencies. It supports building UI components, managing complex states, creating app flows with client-side routing, and localizing its content for the worldwide markets. All of the parts follow the same unique concepts making it easy to understand and use!

## Quick Look

### The Simplest Structure

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

You can read more in the [Component Model](https://hybrids.js.org/#/component-model/definition.md) section of the documentation.

### Seamless Localization

Built-in support for automatic translation of the component's content makes translation seamless and easy to integrate. Additionally, the framework provides a way to add dynamic messages with plural forms, HTML content, or use messages outside of the template context. Also, it comes with handy CLI tool to extract messages from the source code!

```javascript
import { define, html, localize } from "hybrids";

export default define({
  tag: "my-element",
  name: "",
  render: ({ name }) => html`
    <div>Hello ${name}!</div>
  `,
});

localize("pl", {
  "Hello ${0}!": {
    message: "Witaj ${0}!",
  },
});
```

You can read more in the [Localization](https://hybrids.js.org/#/component-model/localization.md) section of the documentation.

### Complex State Management

The store module provides a global state management based on declarative model definitions with built-in support for async external storages, relations, offline caching, and many more. It follows the declarative architecture to simplify the process of defining and using data structures:

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

You can read more in the [Store](https://hybrids.js.org/#/store/usage.md) section of the documentation.

### Structural Client-Side Routing

The router module provides a global navigation system for client-side applications. Rather than just matching URLs with the corresponding components, it depends on a tree-like structure of views, which have their own routing configuration in the component definition. It makes the URLs optional, have out-the-box support for dialogs, protected views, and many more.

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

You can read more in the [Router](https://hybrids.js.org/#/router/usage.md) section of the documentation.

## Documentation

The project documentation is available at the [hybrids.js.org](https://hybrids.js.org) site.

## Community

* Follow on [Twitter](https://twitter.com/hybridsjs)
* Chat on [Gitter](https://gitter.im/hybridsjs)

## License

**hybrids** is released under the [MIT License](LICENSE).
