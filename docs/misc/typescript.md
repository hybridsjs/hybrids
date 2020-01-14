# TypeScript

The library supports [TypeScript](https://www.typescriptlang.org/) by the definitions in `types/index.d.ts` file. The project is prepared to work without additional configuration. You can import types from the package besides other functions.

The web component definition should combine two parts:

1. An `interface`, which extends `HTMLElement`
2. A map of descriptors of the `Hybrids<E>` type (where generic type `E` is the defined interface)

A counter component example can be written in TS with the following code:

```typescript
// simple-counter.ts

import { define, html, Hybrids } from 'hybrids';

interface SimpleCounter extends HTMLElement {
  count: number;
}

export function increaseCount(host: SimpleCounter) {
  host.count += 1;
}

export const SimpleCounter: Hybrids<SimpleCounter> = {
  count: 0,
  render: ({ count }) => html<SimpleCounter>`
    <button onclick="${increaseCount}">
      Count: ${count}
    </button>
  `,
};

define('simple-counter', SimpleCounter);
```

The `Hybrids<E>` type has built-in support for the [descriptors structure](../core-concepts/descriptors.md) and all of the [translation](../core-concepts/translation.md) rules. It also prevents defining properties not declared in the interface. All hybrids public APIs support generic type `<E>` for providing the additional information from the defined interface, for example, `html<E>` or `define<E>(...)`. 

The code inside of the descriptors usually requires an interface explicitly. For example, factories run before TS can check the structure (the result of the function is passed to the component definition, not a function reference), so you have to pass your component interface to the function:

```typescript
import { property, Hybrids } from 'hybrids';

interface MyElement extends HTMLElement {
 value: boolean;
}

const MyElement: Hybrids<MyElement> = {
 value: property<MyElement>(false, (host) => {
   // With the generic type TS knows that the `host` is MyElement, which has `value` property
   console.log(host.value);
 }),
};
```

Provided types are part of the public API so that any change will follow semantic versioning of the library. For more depth understanding, read the `types/index.d.ts` source file.
