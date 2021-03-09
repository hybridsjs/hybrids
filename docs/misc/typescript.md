# TypeScript

The library supports [TypeScript](https://www.typescriptlang.org/) by the definitions in `types/index.d.ts` file. The project is prepared to work without additional configuration. You can import types from the package besides other functions.

The web component definition should combine two parts:

1. An `interface` with a map of properties (the `render` can be omitted)
2. A map of descriptors of the `Hybrids<E>` type (where generic type `E` is the defined interface)

A counter component example can be written in TS with the following code:

```typescript
// simple-counter.ts

import { define, html, Hybrids } from 'hybrids';

interface SimpleCounter {
  count: number;
}

export function increaseCount(host: SimpleCounter) {
  host.count += 1;
}

export const SimpleCounter: Hybrids<SimpleCounter> = {
  count: 0,
  render: ({ count }) => html`
    <button onclick="${increaseCount}">
      Count: ${count}
    </button>
  `,
};

define('simple-counter', SimpleCounter);
```

The `Hybrids<E>` type has built-in support for the [descriptors structure](../core-concepts/descriptors.md) and all of the [translation](../core-concepts/translation.md) rules. It also prevents defining properties not declared in the interface. All hybrids public APIs support generic type `<E>` for providing the additional information from the defined interface, for example, `html<E>` or `define<E>(...)`. However, in most of the cases, it is not necessary to pass the generic type explicitly - TS calculates it from the `Hybrids<E>` main type.

> The component interface can extend `HTMLElement` for using common elements API, for example, in event listeners. However, the `Hybrids` type prevents from overwriting properties already defined by the `HTMLElement` interface.

The following types are the public API, and any change to those will follow semantic versioning of the library:

* `Hybrids<E>` type including `Descriptor<E, V>` and `Property<E, V>` interfaces
* All declarations of the main exports of the library

For a deeper understanding, read the `types/index.d.ts` source file.
