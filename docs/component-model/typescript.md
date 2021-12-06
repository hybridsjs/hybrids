# TypeScript

## Component Model

The component definition in TypeScript should combine two parts:

1. An `interface` with a map of properties. The `render` and `content` can be omitted if they are not used directly.
2. Component definition passed to `define<E>()` function, where generic type `E` is the interface

A simple counter component example can be written in with the following code:

```typescript
import { define, html } from 'hybrids';

interface SimpleCounter {
  count: number;
}

export function increaseCount(host: SimpleCounter) {
  host.count += 1;
}

export default define<SimpleCounter>({
  tag: 'simple-counter',
  count: 0,
  render: ({ count }) => html`
    <button onclick="${increaseCount}">
      Count: ${count}
    </button>
  `,
});
```

All public APIs support generic type `<E>` for providing the additional information from the defined interface, for example, `html<E>` or `define<E>(...)`. However, in most cases, it is not necessary to pass the generic type explicitly - the TypeScript compiler calculates it from the `define<E>(...)`.

### Explicit Type

Usually, if you pass the component definition to the `define` function, the `Component<E>` type is not required, as it is used implicitly by the function. However, if you want to use the `Component<E>` type explicitly, you can use the following code:

```typescript
import { define, html, Component } from "hybrids";

interface SimpleCounter { ... }

...

const SimpleCounter: Component<SimpleCounter> = {
  tag: 'simple-counter',
  count: 0,
  render: ({ count }) => html`
    <button onclick="${increaseCount}">
      Count: ${count}
    </button>
  `,
};

export default define(SimpleCounter);
```

## Built-ins

The component interface can extend `HTMLElement` for using built-in APIs but is not required. However, the `Component<E>` type must prevent overwriting properties already defined by the `HTMLElement` interface, as otherwise, they would have to be redefined in the `define<E>` function.

```typescript
interface SimpleCounter extends HTMLElement {
  count: number;
}

function triggerClick(host: SimpleCounter) {
  // Without the `HTMLElement` base interface, 
  // the following line would throw a compilation error:
  host.click();
};

...
```

## Factories

You can use the `Descriptor<E,V>` type when defining property factory with the descriptor outside the definition:

```typescript
import { Descriptor } from "hybrids";

export default function myFactory<E>(param: string): Descriptor<E, string> {
  return {
    get: (host, value = param) => value,
    set: (host, value) => {
      return value === "something" ? "something else" : value;
    },
  };
}
```