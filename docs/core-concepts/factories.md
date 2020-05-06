# Factories

The factory is just an ordinary function, which produces [property descriptor](descriptors.md). The primary goal of the factories is to hide implementation details and minimize redundant code. Usually, descriptors are similar and have limited differences, which can be parameterized by the function arguments. The factory function can use local scope for setting variables required for the functionality.

## Example

Consider an example, where you want to create a property (still using built-in `property` factory), which updates `document.title` and holds its original value. Instead of creating a unique descriptor, you can create a re-usable factory:

```javascript
import { property } from "hybrids";

function titleFactory(defaultValue, defaultTitle = '') {
  return {
    ...property(
      defaultValue,
      /* connect */
      (host, key) => {
        if (host[key] === undefined) {
          document.title = defaultTitle;
        }
      },
    ),
    observe(host, value) {
      document.title = value;
    },
  };
}
```

The above example uses built-in [`property`](../built-in-factories/property.md) factory by spreading returned descriptor. It also adds `observe` method for updating document title after each change. The result is valid property descriptor.

You can use `titleFactory` function wherever you want. Let's take the &lt;simple-counter&gt; from [Getting Started](../README.md) section, and make its `count` property connected to the `document.title`. The only important difference is in the line with the property definition:

```javascript
import { html, define } from 'hybrids';
import titleFactory from './titleFactory';

export function increaseCount(host) {
  host.count += 1;
}

export const TitleCounter = {
  count: titleFactory(0), // definition changed from "count: 0"
  render: ({ count }) => html`
    <button onclick="${increaseCount}">
      Count: ${count}
    </button>
  `,
};

define('title-counter', SimpleCounter);
```

## Built-in Factories

The library uses factories to provide all the features required for building rich custom elements. You can find more information about them in the following sections:

* [properties](../built-in-factories/property.md) with fallback to the attribute with type coercion as a main input of the element
* [render](../built-in-factories/render.md) for creating DOM structure of the element
* [parent or children](../built-in-factories/parent-children.md) for complex multiple element structure

The [Translation](./translation.md) section describes how in the most common situations you can omit direct usage of the factory functions, but still use them in the definition.
