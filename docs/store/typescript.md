# Store TypeScript Support

To define the store model in TypeScript, create an interface and use it with the `Model<V>` type:

```typescript
import { store, Model } from "hybrids";

interface User {
  id: string;
  name: string;
}

const User: Model<User> = {
  id: true,
  name: "",
  [store.connect]: (id) => fetch(`/users/${id}`).then(res => res.json()),
};

export default User;
```

The above structure is recommended because, as a result, the `User` interface will be automatically matched with the default export, so in component definitions you can simply use `User` for both the value and the type:

```typescript
import { define, html, store } from "hybrids";
import User from "./models/User";

interface MyElement {
  user?: User;
}

export default define<MyElement>({
  tag: "my-element",
  user: store(User),
  render: ({ user }) => html`
    ${store.ready(user) && user.name}
  `,
});
```
