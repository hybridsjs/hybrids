<center>
<h1>
  <object
    aria-disabled="true"
    data="/assets/hybrids-full-logo.svg"
    role="img"
    style="pointer-events:none;max-width:90%"
    tabindex="-1"
    type="image/svg+xml">
  </object>
</h1>
</center>

[![build status](https://github.com/hybridsjs/hybrids/actions/workflows/test.yml/badge.svg)](https://github.com/hybridsjs/hybrids/actions/workflows/test.yml?query=branch%3Amain)
[![coverage status](https://coveralls.io/repos/github/hybridsjs/hybrids/badge.svg?branch=main)](https://coveralls.io/github/hybridsjs/hybrids?branch=main)
[![npm version](https://img.shields.io/npm/v/hybrids.svg?style=flat)](https://www.npmjs.com/package/hybrids)

> An extraordinary JavaScript framework for creating client-side web applications, UI components libraries, or single web components with unique mixed declarative and functional architecture

**Hybrids** provides a complete set of features for building modern web applications:

* **Component Model** based on plain objects and pure functions
* **Global State Management** with external storages, offline caching, relations, and more
* **App-like Routing** based on the graph structure of views
* **Layout Engine** making UI layouts development much faster
* **Localization** with automatic translation of the templates content
* **Hot Module Replacement** out of the box support and other DX features

## Quick Look

### Component Model

It's based on plain objects and pure functions*, still using the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/Web_Components) under the hood:

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

You can read more in the [Component Model](/component-model/definition.md) section.

### Global State Management

A global state management uses declarative model definitions with support for async external storages, relations, offline caching, and many more:

```javascript
import { define, store, html } from "hybrids";

const User = {
  id: true,
  firstName: "",
  lastName: "",
  [store.connect] : {
    get: id => fetch(`/users/${id}`).then(...),
  },
};

define({
  tag: "user-details",
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
<user-details user="2"></user-details>
```

You can read more in the [Store](/store/usage.md) section.

### App-like Routing

Rather than just matching URLs with the corresponding components, the router depends on a tree-like structure of views, which have their own routing configuration. It makes the URLs optional, have out-the-box support for dialogs, protected views, and many more.

```javascript
import { define, html, router } from "hybrids";

import Details from  "./details.js";

const Home = define({
  [router.connect]: { stack: [Details, ...] },
  tag: "app-home",
  content: () => html`
    <template layout="column">
      <h1>Home</h1>
      <nav layout="row gap">
        <a href="${router.url(Details)}">Details</a>
      </nav>
      ...
    </template>  
  `,
});

export define({
  tag: "app-router",
  stack: router(Home),
  content: ({ stack }) => html`
    <template layout="column">
      ${stack}
    </template>
  `,
});
```

```html
<app-router></app-router>
```

You can read more in the [Router](/router/usage.md) section.

### Layout Engine

Create CSS layouts in-place in templates, even without using Shadow DOM, but still keeping the encapsulation of the component's styles:

```javascript
define({
  tag: "app-home-view",
  content: () => html`
    <template layout="column center gap:2">
      <div layout="grow grid:1|max">
        <h1>Home</h1>
        ...
      </div>

      <footer layout@768px="hidden">...</footer>
    </template>
  `
});
```

You can read more in the [Layout Engine](/component-model/layout-engine.md) section.

### Localization

The library supports automatic translation of the component's content, which makes translation seamless and easy to integrate. Additionally, it provides a way to add dynamic messages with plural forms, HTML content, or use messages outside of the template context. Also, it comes with handy CLI tool to extract messages from the source code!

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

You can read more in the [Localization](/component-model/localization.md) section.

## Community

Do you need help? Something went wrong? Feel free to create [an issue](https://github.com/hybridsjs/hybrids/issues/new) in the github repository or join the [Gitter](https://gitter.im/hybridsjs/hybrids) channel.

## License

**Hybrids** is released under the [MIT License](https://github.com/hybridsjs/hybrids/blob/main/LICENSE).
