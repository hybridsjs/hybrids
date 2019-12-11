# TypeScript

The library supports [TypeScript](https://www.typescriptlang.org/) out of the box by the types from `types/index.d.ts` file. The web component definition should contain an interface extending `HTMLElement` and a map of descriptors using `Hybrids<E>` type (where generic type `E` is the defined interface).

A counter component from the Getting Started section can be written in TS with the following code:

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

The `Hybrids<E>` type has built-in support for the [descriptors structure](../core-concepts/descriptors.md) and all of [translation](../core-concepts/translation.md) rules. It also prevents from defining properties not declared in the element interface.

All public APIs support generic type `<E>` for providing additional information from the defined interface. For example, the factories run before TS can check the structure (the result of the function is passed to the component definition, not a function reference), so you have to pass your component interface to the function explicitly:

```typescript
import { property, Hybrids } from 'hybrids';

interface MyElement extends HTMLElement {
 value: boolean;
}

const MyElement: Hybrids<MyElement> = {
 value: property<MyElement>(false, (host) => {
   // TS knows that the `host` is MyElement, which has `value` property
   console.log(host.value);
 }),
};
```

Provided types are part of the public API, so any changes will follow semantic versioning of the library. For more depth understanding, read the `types/index.d.ts` source file.
