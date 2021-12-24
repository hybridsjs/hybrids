# TypeScript

The router factory is supported out of the box without additional types. You can define your views with the `[router.connect]` configuration object using the `define<E>()` function with the corresponding component interface:

```typescript
import { define, html, router } from "hybrids";

interface MyView {
  param: boolean;
}

export default define<MyView>({
  [router.connect]: { url: "/my-view" },
  tag: "my-view",
  content: ({ param }) => html`
    <p>${param}</p>
  `,
});
```

## Factory

The property with the router factory must have set the type of the property at least to `HTMLElement[]`:

```typescript
import { define, html, router } from "hybrids";
import Home from "./views/Home";

interface MyApp {
  views: HTMLElement[];
  ...
}

export default define<MyApp>({
  tag: "my-app",
  views: router(Home),
  render: ({ views }) => html`
    ${views}
    ...
  `,
});
...
```

## Common Pitfalls

When you create an import cycle, where views import each other, you can get an error like this:

> MyView implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its initializer

It happens because the `stack` option or the template body can direct or indirect reference to itself. If so, you must define your view outside of the `define` function and then use it with the default export:

```typescript
import { define, html, router, Component } from "hybrids";

interface MyView {
  param: boolean;
}

const MyView: Component<MyView> = {
  [router.connect]: { url: "/my-view" },
  tag: "my-view",
  content: ({ param }) => html`
    <p>${param}</p>
  `,
};

export default define(MyView);
```
