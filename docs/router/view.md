# Router View

A view is a defined component connected to the router as a root, or in the `stack` option of one of the views.

There are no strict rules for the component structure, but the best approach is to define views in separate ES modules and use the `render` property for the view template:

```javascript
import { define, html, router } from "hybrids";

export default define({
  [router.connect]: { stack: [...] },
  tag: "my-app-view",
  render: ({ ... }) => html`
    <my-button>...</my-button>
    ...
  `,
});
```

## Configuration

The router uses an optional `[router.connect]` configuration property to set various options, including other views:

```typescript
[router.connect]?: {
  stack?: component[] | () => component[];
  url?: string;
  dialog?: boolean;
  multiple?: boolean;
  replace?: boolean;
  guard?: () => boolean;
},
```

### `stack`

The `stack` option specifies which views should be placed on the stack when the router navigates from the current view. If the next view is not in the path of the current view's stacks, the router uses the [lowest common ancestor](https://en.wikipedia.org/wiki/Lowest_common_ancestor) algorithm to figure out the resulting stack of the browser history. For example, the root view will always be the first history entry. Navigating to it from a deep view of the app will clear the browser history and replace it with the root view.

```javascript
import { define, html, router } from "hybrids";

import Users from "./User.js";

export default define({
  [router.connect]: { stack: [Users] },
  tag: "my-home-view",
  render: () => html`
    <h1>Home</h1>

    <a href="${router.url(Users)}">Users</a>
    ...
  `,
});
```

### `url`

Instead of the URL, the router uses the `history.state` object as the source of the current state. The main identifier of the view is its tag name and parameters, which makes the URL optional. The URL as a source is only used if the user enters the application without an initialized state (clean browser history). Most of the time, it is only used as output for copying the address.

Because of that, you have full control over where to use URLs, allowing the user to enter that view directly from the address bar. You can decide to use URLs everywhere, in only some views (making them entry points of the application), or not at all (for example, in web applications for native mobile platforms).

> Navigation between views is performed via the component definition reference, so it does not matter whether the URL is defined or not.

```javascript
import { define, html, store, router } from "hybrids";

import UserModel from "../models/User.js";
import User from "./User.js";

export default define({
  [router.connect]: {
    url: "/users?page",
    stack: [User],
  },
  tag: "my-users-view",
  page: 1,
  users: store([UserModel], { id: ({ page }) => ({ page })}),
  render: ({ users }) => html`
    <h1>Users View</h1>

    ${store.ready(users) && users.map(user => html`
      <a href="${router.url(User, { user: user.id })}">${user.name}</a>
    `}
  `,
});
```

The `url` option supports the following syntax:

* It should start with `/` - the router matches absolute URLs
* A path parameter can be set with a colon and parameter name (`/[^\/]+/`), like: `/users/:userId/:other`
* Query parameters must be set explicitly as a comma-separated list: `/users?one,two,three`
* The `*` character for wildcards is not supported - use a path parameter instead

Besides the parameters from the `url` option, you can pass any writable property of the view when navigating to it. However, the URL in the address bar is only updated for those from the `url` option. This lets you decide which parameters can be copied and used as the entry point of the application (still, all parameters are saved in the `history.state` object).

The matching algorithm goes from the roots of the view structures, going from right to left through their stacks. The first matched view is used.

### `dialog`

If the `dialog` option is set to `true`, the view becomes a dialog that is displayed on top of the full-screen views rather than replacing them (the memory stack still contains all of the views). Like ordinary views, it supports backward browser navigation. The dialog can also be closed by pressing the escape key. Additionally, the router traps keyboard focus on the current dialog.

Dialogs should be used for prompts, alerts, and messages displayed in the context of a parent view. As they don't exist standalone, the router prevents the application from running with the dialog as an entry point and resolves the state to the parent view (clearing the stack down to the top view).

```javascript
import { define, html, router } from "hybrids";

import UserModel from "../models/User.js";
import Users from "./Users.js";

function deleteUser(host, event) {
  // It takes an event, returned promise, 
  // and triggers navigation only if the promise is resolved
  router.resolve(event, store.set(host.user, null));
}

const MyUserDialog = define({
  [router.connect]: {
    dialog: true,
  },
  tag: "my-user-dialog",
  user: store(UserModel),
  render: () => html`
    <dialog>
      <p>Are you sure?</p>
      <a href="${router.url(Users)}" onclick="${deleteUser}">Yes</a>
      <a href="${router.backUrl()}">Cancel</a>
    </dialog>
  `,
});

export default define({
  [router.connect]: {
    url: "/users/:user",
    stack: [MyUserDialog],
  },
  tag: "my-user-view",
  user: store(UserModel),
  render: ({ user }) => html`
    <h1>User View</h1>

    <p>${store.ready(user) && user.name}</p>

    <a href="${router.url(MyUserDialog, { user: user.id })}">Delete user</a>
  `,
});
```

In the above example, to go back to the users list after deleting the user, all you need to do is pass the `Users` view to the `router.url()` method. The router, using the relations between views, will go back rather than push a new view onto the stack.

### `multiple`

By default, views are singletons, which means the router will not allow stacking the same view twice. If the view is already on the stack, the router will resolve the stack to its position, use the existing instance, and update its parameters. If you want to stack the same view multiple times, you must set the `multiple` option to `true`.

This might be useful in cases where you have the same type of view but with different parameters, like a product view. With the `multiple` option, the user will be able to stack views in history and go back one by one to previously visited instances of the same view. Otherwise, the history entry is replaced, so going backward navigates to the parent in the structure.

```javascript
import { define, html, router } from "hybrids";
import Product from "../models/Product.js";

export default define({
  [router.connect]: {
    url: "/products/:product",
    multiple: true,
  },
  tag: "my-product-view",
  product: store(Product),
  render: ({ product }) => html`
    <h1>Product View</h1>

    ${store.ready(product) && html`
      <p>${product.name}</p>
      <h2>Related products</h2>
      <p>
        ${product.related.map(related => html`
          <a href="${router.currentUrl({ product: related.id })}">
            ${related.name}
          </a>
        `)}
      </p>
    `}
  `,
});
```

### `replace`

When the router navigates to a view that is already in the stack, it only updates the instance with the new parameters. This may produce a different result than loading the view from scratch, because the view might have some state that is not updated. For example, the updated store model holds the previous state until the new one is ready.

In some cases, you might want to perform a full reload of the view while still replacing the history entry. To do this, you can set the `replace` option to `true`.

```javascript
import { define, html, router } from "hybrids";

export default define({
  [router.connect]: { replace: true },
  tag: "my-user-details-view",
  ...,
  render: ({ user }) => html`
    ...
    <p>
      Follows: 
      <a href="${router.currentUrl({ user: user.follows.id })}">${user.follows.name}</a>
    </p>
  `,
})
```

In the above example, the history entry is still replaced, but the view is loaded from scratch, so it does not contain the previous state when loaded.

### `guard`

The `guard` option specifies a synchronous function that is called when the router is navigating to the view or to children from the view's `stack`.

If the user navigates directly to the view and the function returns a truthy value, the first view from the `stack` option is used. Otherwise, the view itself is displayed (the `guard` can throw an error or return a falsy value).

If the user navigates to the view from the stack, the guard function is also called, and if the condition is not met, the router navigates to the guarded view. However, the target view is saved in the history entry, so you can use the [`router.guardUrl()`](/router/usage.md#routerguardurl) method to generate the URL to the target view from within the guarded view's content.

There can be multiple guarded views on the path from the target view to the root. In that case, the router resolves guards starting from the deepest and going up the tree.

The `guard` function is only called while navigation occurs. The router does not call it when the view is rendered or updated. Because of that, it does not support the `host` argument, as the function is called outside of the element's context.

```javascript
import { define, html, router } from "hybrids";

import Session from "../models/Session.js";
import Home from "./Home.js";

function login(host, event) {
  router.resolve(event, store.submit(host.session));
}

export default define({
  [router.connect]: {
    stack: [Home],
    guard: () => store.ready(store.get(Session)),
  },
  tag: "my-login-view",
  session: store(Session, { draft: true }),
  render: () => html`
    <h1>Login</h1>
    <form onsubmit="${login}" action="${router.guardUrl()}">
      <input value="${session.login}" oninput="${html.set(session, "login")}" />
      <input value="${session.password}" oninput="${html.set(session, "password")}" />
      <button type="submit">Login</button>
    </form>
  `,
});
```

To protect the application from the above example, the router factory in the main app component should use the `Login` view as a root instead of `Home`. The view structure will have a new root node that protects access to all of the stacked views. The rest of the structure, including the `Home` view, remains untouched, so the login feature is added on top of the existing application.

#### Async APIs

The function must return the value synchronously. If your guard function relies on async calls, you must wrap the main app element with a corresponding condition that is displayed after the calls resolve:

```javascript
import { define, html, store } from "hybrids";

export const Session = {
  ...,
  [store.connect]: {
    get: () => fetch("/me").then(res => res.json()),
    set: (id, values) => ...,
  },
};

export default define({
  tag: "my-async-app",
  session: store(Session),
  render: ({ session }) => 
    store.ready(session) || store.error(session) 
    ? html`<my-app></my-app>`
    : html`<app-loader>...</app-loader>`
  ,
});
```

When `session` is fetched for the first time, the `<app-loader>` will be displayed instead of `<my-app>`. After the session is ready or an error occurs, the app can be rendered, so the `guard` function can synchronously check whether the session is ready.
