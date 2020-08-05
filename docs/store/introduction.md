# Introduction

The store provides global state management based on model definitions with built-in support for external storage. Use the store to share internal state between the components or create a container for the data from internal and external APIs.

The feature follows all of the concepts of the library, including an extremely declarative approach. To use the store, define your model, and start using it. The same cache mechanism protects synchronization, so the state of the model is always up to date inside of the web components created by the library. The store simplifies access to different sources of data, as the communication with the model is the same, regardless of the source of the data - either from memory or from the async APIs.

## Concept

To share values between components, create a singleton definition, and use it inside the component. All of the components will share the same store model instance:

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

There are a few ways to interact with the model instances, but as you can see above, the `setDarkTheme()` function does not rely on the `host` argument at all. It does not have to, as the model is a singleton, so we can use the model definition to update the model instance (the instance can be only one). All interactions with the model can be placed in a separate module, and used in the component:

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

On the other hand, let's create a web component, where we want to display the user's data fetched from the external API. Even though the source is asynchronous, the fetching process is hidden. The interaction with the model is the same as with data from memory (as shown in the above example).

```javascript
import { store } from 'hybrids';
import { fetch } from 'fetch-some-api';

export const User = {
  id: true,
  firstName: '',
  lastName: '',
  [store.connect]: {
    get: id => fetch(`/users/${id}`).then(res => res.data),
  },
};
```

The above `User` model definition creates a structure for each user instance with predefined default values. The `true` value of the `id` property says that `User` is an enumerable model, so there might be multiple instances of it with the unique id provided by the storage. The optional `[store.connect]` configures the source of the data.

Then we can use it inside of the web component:

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

The `UserDetails` component uses `store` factory, which connects `user` property to its model instance by provided `userId`. Take a closer look, that there is no fetching process. It is made under the hood by the store. If not directly defined, the model instances are permanently cached, so the storage is called only once (the cache might be set to a time-based value).

The store provides three guards (like `store.ready()`), which return information about the current state of the model instance. In that matter, the store is unique as well - there might be more than one guard, which results in truthy value.

For example, if the store looks for a new model (when `userId` changes), it still returns the last model until the new one is ready. However, the template will show the loading indicator as well. On the other hand, if the fetching process fails, the component still contains the last value, but also the error is shown. Moreover, the guards can work with any data passed from the store, so you might create a standalone web component for displaying your loading & error states instead of using guards directly in each template!

Finally, the most important fact is that from the perspective of the `UserDetails` component, how the `User` data is fetched is irrelevant. The only thing that you care about most is what kind of data you need and how you want to use it.
