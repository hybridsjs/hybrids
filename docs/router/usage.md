# Router Usage

The router provides a global navigation system for client-side applications. Rather than just matching URLs with the corresponding components, it depends on a tree-like structure of views that have their own routing configuration in the component definition.

The router state is represented by a stack of views. If the user goes deeper in the tree, the view is pushed onto the stack. If the navigation goes up, the stack is cleared. However, the resulting stack array returns only the current view and any dialogs (on top of the current view). The remaining views on the stack are kept in memory along with their current state, scroll positions, and last focused element.

The stack of views is connected to the browser history, so the current stack and browser history are always in sync. Because of the relations between the views, the router knows when to navigate forward or backward to reflect the structure.

To start using the router, just add a property defined with the router factory to your main application component and display the current stack of views:

```javascript
import { define, html, router } from "hybrids";

import Home from "./views/Home.js";

define({
  tag: "my-app",
  stack: router(Home),
  render: ({ stack }) => html`
    <my-app-layout>
      ${stack}
    </my-app-layout>
  `,
});
```

## Factory

```typescript
router(views: component | component[] | () => ..., options?: object): object
```

* **arguments**:
  * `views` - a defined component or an array of defined components. You can wrap `views` in a function to avoid the uninitialized ES modules issue
  * `options` - an object with the following options:
    * `url` - a string base URL used for views without their own `url` option; defaults to the current URL
    * `params` - an array of element property names, which are passed to every view as a parameter
    * `transition` - a boolean flag to enable notifications about the transition type between views by setting the `<html router-transition="">` element's attribute
* **returns**:
  * a hybrid property descriptor, which resolves to an array of elements

### `views`

```typescript
views: Component[]
```

Views passed to the router factory create the roots of the view structures. Usually, there is only one root view, but you can pass a list of them (navigating between roots always replaces the whole stack). You can find a deeper explanation of the view concept in the [View](/router/view.md) section.


### `options.url`

```typescript
url: string = "/"
```

If your application uses a mixed approach - views with and without URLs - you should specify a base URL to avoid non-deterministic behavior of the router for views without a URL. Otherwise, the router will use the entry point as the base URL (which can differ according to the use case).

```javascript
define({
  tag: "my-app",  
  views: router(Home, { url: "/" }),
  ...
})
```

### `options.params`

```typescript
params: String[] = []
```

Regardless of the explicit parameters used when navigating to a view, you can specify an array of properties of the component that are passed to every view as a parameter. They bypass URL generation, so they are set by reference and are not included in the URL.

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
  views: router(Home, { params: ["user"] }),
  ...
});
```

```html
<my-app user="123"></my-app>
```

### `options.transition`

```typescript
transition: boolean = false
```

The `transition` option enables notifications about the transition type between views, set on the `<html router-transition="">` element's attribute with the following values:

* `""` - empty when the router displays the view stack for the first time
* `forward` - when the user navigates to a nested view
* `backward` - when the user navigates backward to a parent view
* `replace` - when the user replaces the current view

The `transition` option is useful for animations, such as when using the [Transition API](/component-model/templates.md#transition-api), which should be triggered only when the user navigates between views.

```html
<style>
  [router-transition="backward"]::view-transition-old(root) {
    animation-name: fade-out, slide-to-right;
  }

  [router-transition="backward"]::view-transition-new(root) {
    animation-name: fade-in, slide-from-left;
  }
</style>
```

When the user navigates to or from a dialog view, the attribute also contains a space-separated `dialog` value:

* `forward dialog` - when the user navigates to a dialog view
* `backward dialog` - when the user navigates backward from a dialog view

To mix or separate the transitions between main views and dialogs, you can use the `dialog` attribute selector:

```html
<style>
  /* Targets views and dialogs */
  [router-transition~="forward"]::view-transition-new(root) {
    animation-name: fade-in;
  }

  /* Targets only dialogs */
  [router-transition="forward dialog"]::view-transition-new(root) {
    animation-name: slide-from-bottom;
  }
</style>
```

## Nested Routers

For complex layouts, the router factory can be used inside views that are already connected to a parent router. This feature differs from setting views in the view's `stack` option. The nested router displays content inside the host view as content, not as a separate view in the stack.

```javascript
import { define, html, router } from "hybrids";

import TabOneView from "./TabOneView.js";
import TabTwoView from "./TabTwoView.js";

export default define({
  tag: "my-module-view",
  tabs: router([TabOneView, TabTwoView]),
  render: ({ tabs }) => html`
    <my-tabs-group>
      <a href="${router.url(TabOneView)}">Tab One</a>
      <a href="${router.url(TabTwoView)}">Tab Two</a>
    </my-tabs-group>

    ${tabs}
  `,
});
```

## Events

The router dispatches a `navigate` event on the host element, which can be used for external purposes:

```javascript
function onNavigate(event) {
  ga("send", "pageview", event.detail.url);
}

const app = document.getElementById("my-app");
app.addEventListener("navigate", onNavigate);
```

## Navigation

The router provides a set of methods for navigating to views. Generally, these methods generate a URL instance, which can be used in anchors as the `href` attribute and in forms as the `action` attribute.

The component with the router listens to `click` and `submit` events, so when a user clicks on an anchor or submits a form, the router resolves the URL and navigates to the target view (going forward or backward in the history using the view structure).

> The `submit` event does not cross the Shadow DOM boundary, so the recommended way is to render templates in the light DOM (without styles or `<slot>` elements in the root template).

### `scrollToTop`

Besides specific parameters for the view, the router navigation methods support the `scrollToTop` option in the params, which clears the main scroll position of the view when navigating to it. As views on the stack retain scroll positions, this can be useful if you want to force the view to scroll to the top, but it is a parent view that may already be in memory. However, if a new view is pushed onto the stack, the main vertical scroll position is cleared automatically, so you don't need to use this option in that case.

### `router.url()`

```typescript
router.url(view: component, params?: object): URL | ""
```

* **arguments**:
  * `view` - a component definition
  * `params` - an object with parameters to pass to the view
* **returns**:
  * a URL instance or an empty string

Use the definition reference to identify the target view, and optionally pass the parameters. As the result is a URL instance, the parameters are serialized to the query string - complex object structures are not supported (use the [store](/store/usage.md) and pass the model identifier instead).

!> Keep in mind that an unconnected view results in an empty string, and the method does not throw.

### `router.backUrl()`

```typescript
router.backUrl(options?: { nested?: boolean, scrollToTop?: boolean }): URL | ""
```

* **arguments**:
  * `options` - an object with `nested` or `scrollToTop` options, both defaults to `false`
* **returns**:
  * a URL instance or an empty string

The `backUrl` method is useful if you have views that can be navigated to from multiple points (the target view is listed in more than one `stack` option in the view definitions), or if you create a shared layout element for the views. Then, you can use this method to generate a URL to the previous view from the stack.

If the current view is the only one on the stack, the last parent of the target view is used (going from left to right in the view hierarchy). Root views always return an empty string.

The `nested` option only applies if the previous and current view use nested routing. By default, the method skips entries in the stack where the main router view is the same, so it always returns the URL for a different view. If the `nested` option is set to `true`, it generates the URL for a different view from the deepest nested router.

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
  * a URL instance or an empty string

The `currentUrl` method generates a URL for the current view without using the definition explicitly. The parameters are the same as in the `url` method. It can be useful for reusable components that are used in multiple views, or for avoiding the need to create a reference to the definition in the module.

### `router.guardUrl()`

```typescript
router.guardUrl(params?: object): URL | ""
```

* **arguments**:
  * `params` - an object with parameters to pass to the view
* **returns**:
  * a URL instance or an empty string

The `guardUrl` method should be used in guarded views (with the `guard` function in the configuration). It dynamically chooses the target view. If the user failed to navigate to some view from the stack, that view is used. Otherwise, it defaults to the first view from the stack.

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

Use the `resolve` method if you need to perform an asynchronous action while navigating to the target view. The navigation is only performed if the promise resolves.

Keep in mind that the URL for navigation is taken from the event target, so you still need to use another method in the template to generate a link:

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
  render: ({ user }) => html`
    <dialog>
      <p>Are you sure?</p>
      <a href="${router.url(Users)}" onclick="${deleteUser}">Yes</a>
      <a href="${router.backUrl()}">Cancel</a>

      ${store.error(user) && html`<p>${store.error(user)}</p>`}
    </dialog>
  `,
});
```

The above dialog uses the `resolve` method when the user clicks on the `Yes` link. The router will navigate to the Users view only if the user model is successfully deleted. Otherwise, the dialog displays an error message.

### `router.active()`

```typescript
router.active(views: view | view[], options?: { stack?: boolean }): boolean
```

* **arguments**:
  * `views` - a view definition or an array of view definitions
  * `options` an optional object with `stack` boolean setting
* **returns**:
  * a boolean flag

Use the `active` method to create conditional logic in templates. The method returns `true` when one of the views is the current view. If the `stack` option is turned on, the method also returns `true` if the current view is one of the views in the stack. This means that if you use a parent view, each child in the stack will activate the flag.

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
  render: ({ views }) => html`
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

In the above example, for both `OneView` and `TwoView` the `<my-link>` will be active, as the second view is in the stack of the first.

## Debug Mode

In debug mode, the router logs the navigation events. It also simplifies access to the current view in the DevTools console via the `$$0` reference (similar to the last selected element in the Elements panel).

You can find more information about the debug mode in the [Debug Mode](/getting-started.md#debug-mode) section of the documentation.
