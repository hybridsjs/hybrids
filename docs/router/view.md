# View

A view is a defined component connected to the router as a root, or in the `stack` option of one of the views.

There are no strict rules for the component structure, but the best way might be defining views in separate ES modules and use the `content` property for the view template:

```javascript
import { define, html, router } from "hybrids";

export default define({
  [router.connect]: { stack: [...] },
  tag: "my-app-view",
  content: ({ ... }) => html`
    <my-button>...</my-button>
    ...
  `,
});
```

## Configuration

The router uses an optional `[router.connect]` configuration property to set a number of options, including other views:

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

The `stack` option specifies, which views should be placed on the stack when the router navigates from the current view. If the next view is not in the path of stacks of the current view, the router uses the [lowest common ancestor](https://en.wikipedia.org/wiki/Lowest_common_ancestor) algorithm to figure out the result stack of the browser history. For example, it means, that the root view will always be the first history entry. Navigating to it from the deep view of the app will clear the browser history and replace it with the root view.

```javascript
import { define, html, router } from "hybrids";

import Users from "./User.js";

export default define({
  [router.connect]: { stack: [Users] },
  tag: "my-home-view",
  content: () => html`
    <h1>Home</h1>

    <a href="${router.url(Users)}">Users</a>
    ...
  `,
});
```

### `url`

Instead of the URL, the router uses the `history.state` object as a source of the current state. The main identifier of the view is its tag name and parameters, which makes the URL optional. The URL as a source is only used if the user enters the application without initialized state (clean browser history). In most times, it is only used as an output for copying the address.

Because of that, you have full control over where to use URLs, allowing the user to enter that view directly from the address bar. You can decide to use URLs everywhere, only in some views (making them entry points of the application), or not at all (for example, in web applications for the mobile native platforms).

> The navigation between views is made by the component definition reference, so it does not matter if the URL is defined or not.

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
  content: ({ users }) => html`
    <h1>Users View</h1>

    ${store.ready(users) && users.map(user => html`
      <a href="${router.url(User, { user: user.id })}">${user.name}</a>
    `}
  `,
});
```

The `url` option supports the following syntax:

* It should start with `/` - the router matches the absolute URLs
* The path parameter can be set by a colon and parameter name (`/[^\/]+/`), like: `/users/:userId/:other`
* The query parameters must be set explicitly by a comma-separated list: `/users?one,two,three`
* The `*` character for wildcards is not supported, use path parameter instead

Besides the parameters from the `url` option, you can pass any writable property of the view when navigating to it. However, the URL in the address bar is only updated for those from the `url` option. This behavior allows deciding which parameters can be copied and used for the entry point of the application (all parameters are saved in the `history.state` object).

The matching algorithm goes from the roots of the view structures, going from right to left in their stacks. The first matched view is used.

### `dialog`

If the `dialog` option is set to `true`, the view becomes a dialog, which is displayed on the top of the full-screen views rather than replacing them (still the memory stack contains all of the views). Like ordinary views, it supports using backward browser navigation. Also, the dialog can be closed by pressing the escape key. Additionally, the router traps the focus from a keyboard on the current dialog.

Dialogs should be used for prompts, alerts, and messages displayed in the context of the parent view. As they don't exist standalone, the router protects from running the application with the dialog as an entry point and resolves the state to the parent view (it clears out the stack to the top view).

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
  content: () => html`
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
  content: ({ user }) => html`
    <h1>User View</h1>

    <p>${store.ready(user) && user.name}</p>

    <a href="${router.url(MyUserDialog, { user: user.id })}">Delete user</a>
  `,
});
```

In the above example, to go back to the users list after deleting the user, all you need to do is to pass the `Users` view to the `router.url()` method. The router using relations between views will go back, rather than push a new view into the stack.

### `multiple`

By default, views are singletons, which means that the router will not allow stacking the same view twice. If the view is already on the stack, the router will resolve the stack to its position, use the instance and update its parameters. If you want to stack the same view multiple times, you must set the `multiple` option to `true`.

It might be useful in case, where you have the same type of view, but with different parameters, like a product view. With the `multiple` option, a user will be able to stack views in the history and go back one by one to the previously visited same view. Otherwise, the history entry is replaced, so going backward navigates to the parent in the structure.

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
  content: ({ product }) => html`
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

When the router navigates to the view, which is already in the stack, it only updates the instance with the new parameters. It might have a different result than loading the view from scratch because the view might have some state, which is not updated. For example, the updated store model holds the previous state until the new one is ready.

In some cases, you might want to make a full reload of the view, still replacing the history entry. To do this, you can set the `replace` option to `true`.

```javascript
import { define, html, router } from "hybrids";

export default define({
  [router.connect]: { replace: true },
  tag: "my-user-details-view",
  ...,
  content: ({ user }) => html`
    ...
    <p>
      Follows: 
      <a href="${router.currentUrl({ user: user.follows.id })}">${user.follows.name}</a>
    </p>
  `,
})
```

In the above example, the history entry is still replaced, but the view is loaded from scratch, so it does not contain the previous state when it is loaded.

### `guard`

The `guard` option allows specifying a synchronous function, which is called when the router is navigating to the view or children from the view's `stack`.

If the user navigates directly to the view and a function returns a truthy value, the first view from the `stack` option is used. Otherwise, the view itself is displayed (the `guard` can throw an error, or return falsy value).

If the user navigates to the view from the stack, the guard function is also called, and if the condition is not met, the router navigates to the guarded view. However, the target view is saved in the history entry, so you can use the [`router.guardUrl()`](/router/usage.md#routerguardurl) method to generate the URL to the target view in guarded view content.

There can be multiple guarded views on the path from the target view to the root. In that case, the router resolves guards from the deepest going up in the tree.

The `guard` function is only called while the navigation happens. The router does not call it when the view is rendered or updated. Because of that, it does not support the `host` argument, as the function is called outside of the element context.

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
  content: () => html`
    <h1>Login</h1>
    <form onsubmit="${login}" action="${router.guardUrl()}">
      <input value="${session.login}" oninput="${html.set(session, "login")}" />
      <input value="${session.password}" oninput="${html.set(session, "password")}" />
      <button type="submit">Login</button>
    </form>
  `,
});
```

To protect the application from the above example, in the main app component, the router factory should use the `Login` view as a root, instead of `Home`. The views structure will have a new root node, which protects access to all of the stacked views. The rest of the structure, including the `Home` view, is untouched, so the login feature is added on top of the existing application.

#### Async APIs

The function requires returning the value synchronously. If your guard function relates on async calls, you must wrap the main app element with the corresponding condition, which is displayed after the calls resolve:

```javascript
import { define, html } from "hybrids";

export const Session = {
  ...,
  [store.connect]: {
    get() => fetch("/me").then(res => res.json()),
    set(id, values) => ...,
  },
};

export default define({
  tag: "my-async-app",
  session: store(Session),
  content: ({ session }) => 
    store.ready(session) || store.error(session) 
    ? html`<my-app></my-app>`
    : html`<app-loader>...</app-loader>`
  ,
});
```

When the `session` is fetched for the first time, the `<app-loader>` will be displayed instead of `<my-app>`. After the session is ready or an error occurs, the app can be rendered, so the `guard` function can synchronously check if the session is ready.
