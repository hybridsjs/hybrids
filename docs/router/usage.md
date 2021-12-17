# Usage

The router provides a global navigation system for client-side applications. Rather than just matching URLs with the corresponding components, it depends on a tree-like structure of views, which have their own routing configuration in the component definition.

The router state is represented by the stack of views. If a user go deeper in the tree, the view is pushed to the stack. If the navigation goes up, the stack is cleared. However, the result stack array returns only the current view and dialogs (on the top of the current view). The rest of the views on the stack are kept in the memory with the current state, scroll positions and the last focused element.

The stack of views is connected with the browser history, so the current stack and browser history is always in-sync. Because of the relations between the views, the router knows when to navigate forward or backward to reflect the structure.

To start using the router, just add a property defined with the router factory to your main component of the application, and display the current stack of views:

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

## Factory

```typescript
router(views: component | component[] | () => ..., options?: object): object
```

* **arguments**:
  * `views` - a defined component or an array of defined components. You can wrap `views` in a function to avoid using imports from uninitialized ES modules
  * `options` - an object with following options:
    * `url` - a string base URL used for views without own `url` option, defaults to current URL
    * `params` - an array of property names of the element, which are passed to every view as a parameter
* **returns**:
  * a hybrid property descriptor, which resolves to an array of elements

### `views`

Views passed to the router factory create the roots of the view structures. Usually, there is only one root view, but you can pass a list of them (navigating between roots always replaces the whole stack). You can find a deeper explanation of the view concept in the [View](/router/view.md) section.

### `url`

If your application uses a mixed approach - views with and without URLs, you should specify a base URL to avoid not deterministic behavior of the router for views without the URL. Otherwise, the router will use an entry point as a base URL (which can be different according to the use case).

```javascript
define({
  tag: "my-app",  
  views: router(Home, { url: "/" }),
  ...
})
```

### `params`

Regardless of the explicit parameters when navigating to the view, you can specify an array of properties of the component, which are passed to every view as a parameter. They bypass the URL generation, so they are set by the reference, and they are not included in the URL.

```javascript
import { define, store, router } from "hybrids";

const Home = define({
  tag: "my-app-home",
  user: store(User),
  ...
});

define({
  tag: "my-app",
  user: store(User),
  views: router(Home, { params: ["settings"] }),
  ...
});
```

```html
<my-app user="123"></my-app>
```

### Nested Routers

For complex layouts, the router factory can be used inside of the views already connected to the parent router. This feature differs from setting views in the `stack` option of the view. The nested router displays content inside of the host view as content, not a separate view in the stack.

```javascript
import { define, html, router } from "hybrids";

import TabOneView from "./TabOneView.js";
import TabTwoView from "./TabTwoView.js";

export default define({
  tag: "my-module-view",
  tabs: router([TabOneView, TabTwoView]),
  content: ({ tabs }) => html`
    <my-tabs-group>
      <a href="${router.url(TabOneView)}">Tab One</a>
      <a href="${router.url(TabTwoView)}">Tab Two</a>
    </my-tabs-group>

    ${tabs}
  `,
});
```

### Events

The router dispatches the `navigate` event on the host element, which can be used for the external purposes:

```javascript
function onNavigate(event) {
  ga("send", "pageview", event.detail.url);
}

const app = document.getElementById("my-app");
app.addEventListener("navigate", onNavigate);
```

## Navigating

The router provides a set of methods to navigate to the views. Generally, those methods generate an URL instance, which can be used in anchors as `href` attribute and forms as an `action` attribute.

The component with the router listens to `click` and `submit` events, so when a user clicks on an anchor or submits the form, the router resolves the URL and navigates to the target view (going forward or backward in the history using the structure of views).

> The `submit` event does not cross the Shadow DOM boundary, so the recommended way is to use the `content` property in component definitions for the templates.

### `scrollToTop`

Besides specific parameters for the view, the router navigation methods support the `scrollToTop` option in the params, which clears the main scroll position of the view when it is navigated. As the views on the stack hold scroll positions, it might be useful, if you want to force the view to scroll to the top, but it is a parent view, which might be already in the memory. However, if the new view is pushed to the stack, the main vertical scroll position is cleared automatically, so you don't need to use this option then.

### `router.url()`

```typescript
router.url(view: component, params?: object): URL | ""
```

* **arguments**:
  * `view` - a component definition
  * `params` - an object with parameters to pass to the view
* **returns**:
  * an URL instance or an empty string

Use the definition reference to identify the target view, and eventually pass the parameters. As the result is an URL instance, the parameters are serialized to the query string - the complex object structures are not supported (use the [store](/store/usage.md) and pass the model identifier).

Not connected view results in an empty string. It allows running unit tests over the component content property, without a need to run the whole application. It means, that the method does not throw, so if you forget to add the view to the stack option, it will silently return an empty string.

### `router.backUrl()`

```typescript
router.backUrl(options?: { nested?: boolean, scrollToTop?: boolean }): URL | ""
```

* **arguments**:
  * `options` - an object with `nested` or `scrollToTop` options, both defaults to `false`
* **returns**:
  * an URL instance or an empty string

The `backUrl` method is useful if you have views, which can be navigated from multiple points (the target view is listed in more than one `stack` option in the view definitions), or you create a shared layout element for the views. Then, you can use this method to generate an URL to the previous view from the stack.

If the current view is the only one on the stack, the last parent of the target view is used (going from left to right in the view hierarchy). The root views always return an empty string.

The `nested` option only applies if the previous and current view uses nested routing. By default, the method will skip entries in the stack, where the main router view is the same, so it always returns the URL for another view. If the `nested` option is set to `true`, it generates the URL for another view from the deepest nested router.

```javascript
import { define, html, router } from "hybrids";

define({
  tag: "my-ui-view-layout",
  title: "",
  render: ({ title }) => {
    const backUrl = router.backUrl();

    return html`
      <header>
        ${backUrl && html`<a href="${backUrl}">Go back</a>`}
        <h1>${title}</h1>
      </header>
      <slot></slot>
    `;
  },
})
```

### `router.currentUrl()`

```typescript
router.currentUrl(params?: object): URL | ""
```

* **arguments**:
  * `params` - an object with parameters to pass to the view
* **returns**:
  * an URL instance or an empty string

The `currentUrl` method generates an URL for the current view without using the definition explicitly. The parameters are the same as in the `url` method. It can be useful for reusable components, which are used in multiple views, or for avoiding a need to create a reference to the definition in the module.

### `router.guardUrl()`

```typescript
router.guardUrl(params?: object): URL | ""
```

* **arguments**:
  * `params` - an object with parameters to pass to the view
* **returns**:
  * an URL instance or an empty string

The `guardUrl` method should be used in guarded views (with the `guard` function in the configuration). It dynamically chooses the target view. If the user failed to navigate to some view from the stack, this view is used. Otherwise, it defaults to the first view from the stack.

You can read more about the `guard` option in the [View](./view.md#guard) section.

### `router.resolve()`

```typescript
router.resolve(event: Event, promise: Promise): Promise
```

* **arguments**:
  * `event` -`click` event from an anchor, or `submit` event from a form element
  * `promise` - a promise
* **returns**:
  * a chained promise from the arguments

Use the `resolve` method if you need to perform asynchronous action while navigating to the target view. The navigation is only performed if the promise resolves.

Keep in mind, that the URL for navigation is taken from the event target, so you still need to use another method in the template to generate a link:

```javascript
import { define, html, router } from "hybrids";

import UserModel from "../models/User.js";
import Users from "./Users.js";

function deleteUser(host, event) {
  router.resolve(event, store.set(host.user, null));
}

export default define({
  [router.connect]: {
    dialog: true,
  },
  tag: "my-user-dialog",
  user: store(UserModel),
  content: ({ user }) => html`
    <dialog>
      <p>Are you sure?</p>
      <a href="${router.url(Users)}" onclick="${deleteUser}">Yes</a>
      <a href="${router.backUrl()}">Cancel</a>

      ${store.error(user) && html`<p>${store.error(user)}</p>`}
    </dialog>
  `,
});
```

The above dialog uses the `resolve` method when a user clicks on the `Yes` link. The router will navigate to the Users view only if the user model is successfully deleted. Otherwise, the dialog displays an error message.

### `router.active()`

```typescript
router.active(views: view | view[], options?: { stack?: boolean }): boolean
```

* **arguments**:
  * `views` - a view definition or an array of view definitions
  * `options` an optional object with `stack` boolean setting
* **returns**:
  * a boolean flag

Use the `active` method to create conditional logic in the templates. The method returns `true` when one of the views is the current view. If the `stack` option is turned on, the method also returns `true` if the current view is one of the views in the stack. It means, that if you use a parent view, each child from the stack will activate the flag.

```javascript
import { define, html, router } from "hybrids";

const TwoView = ...

const OneView = define({
  [router.connect]: { stack: [TwoView] },
  tag: "my-app-one-view",
  ...
});

define({
  tag: "my-app",
  views: router(OneView),
  content: ({ views }) => html`
    <nav>
      <my-link
        href="${router.url(OneView)}"
        active="${router.active(OneView, { stack: true })}">
        One
      </my-link>
    <my-content>${views}</my-content>
  `
});
```

In the above example, for both `OneView` and `TwoView` the `<my-link>` will be active, as the second view is in the stack of the first one.

## Debug Mode

```typescript
router.debug(flag = true): void
```

* **arguments**:
  * `flag` - a boolean flag, defaults to `true`

The router provides a global debug mode, which logs the navigation events and allows accessing the current view in the DevTools console by the `$$0` reference (similar to the last selected element in the Elements panel).

It is advised to protect the router debug mode from the production environment by running it conditionally (according to your application setup):

```javascript
import { router } from "hybrids";

// The condition might differ according to your setup
if (import.meta.env.DEV) router.debug();
```