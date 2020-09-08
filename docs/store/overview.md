# Overview

The store provides global state management based on model definitions with support for external storages. Use the store to share internal state between the components or create a container for the data from internal or external APIs.

The feature follows all of the concepts of the library, including an extremely declarative approach. To use the store, just define your model, and start using it. The same cache protects synchronization, so the state of the models is always up to date inside of the web components created by the library. The store also simplifies access to different sources of data. The communication with models is the same, regardless of the source - either from sync storage like memory or from the async APIs.

## Quick Look

To share the same values between components, create a singleton definition, and use it inside the components. All of them will share the same store model instance.

All interactions with the model can be placed in a separate module, like this:

```javascript
import { store } from "hybrids";

const Settings = {
  theme: "light",
  ...
};

export function setDarkTheme() {
  store.set(Settings, { theme: "dark" });
}

export default Settings;
```

Then, in the component definition use `store` factory to access values by the model definition:

```javascript
import { store } from "hybrids";
import Settings, { setDarkTheme } from "./settings.js";

const MyButton = {
  settings: store(Settings),
  render: ({ settings }) => html`
    <style>
      p.light { ... }
    </style>

    <p class="${settings.theme}">...</p>

    <button onclick=${setDarkTheme}>Set dark theme</button>
  `,
};
```

In the above example, the `setDarkTheme` function can be run outside of the component as well. It does not depend on the `host` element. Nevertheless, the component will re-render when `Settings` model instance changes.

On the other hand, let's create a web component, which displays the user's data fetched from the external API:

```javascript
import { store } from 'hybrids';
import { fetch } from 'fetch-some-api';

export const User = {
  id: true,
  firstName: '',
  lastName: '',
  [store.connect] : {
    get: id => fetch(`/users/${id}`).then(res => res.data),
  },
};
```

The above `User` model definition creates a structure for each user instance with predefined default values. It is connected to external source of data by the `[store.connect]` property. The `true` value of the `id` property says that `User` is an enumerable model, so there might be multiple instances of it with unique id provided by the storage.

Even though the source is external, interaction with the model is the same as with models from memory - there is no explicit call to the async storage:

```javascript
import { store, html } from 'hybrids';
import { User } from './models.js';

const UserDetails = {
  userId: '1',
  user: store(User, 'userId'),
  render: ({ user }) => html`
    <div>
      ${store.pending(user) && `Loading...`}
      ${store.error(user) && `Something went wrong...`}

      ${store.ready(user) && html`
        <p>${user.firstName} ${user.lastName}</p>
      `}
    </div>
  `,
}
```

> Click and play with `<store-user>` example:
>
> [![Edit <store-user> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/store-user-web-component-built-with-hybrids-library-dldtv?file=/src/StoreUser.js)

However, models from asynchronous storages are not available immediately. As you can see in the example, the store provides three guards (like `store.ready()`), which return information about the current state of the model instance. Using them we can create UI, which displays to the user all of the required information.

The guards are not exclusive, so you can combine them to have different results. For example, if the store looks for a new model (when `userId` changes), it still returns the last model until the new one is ready, but the component will show the loading indicator as well.

On the other hand, if the fetching process fails, the component still contains the last value, but also the error is shown. Moreover, the guards can work with any data passed from the store, so you can create a standalone web component for displaying your loading & error states instead of using guards directly in each template!

The most important fact is that how the `User` data is fetched is irrelevant. The only thing that you care about most is what data you need and how you want to use it.
