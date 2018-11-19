# Factories

The factory concept is nothing more than a function, which produces [property descriptor](descriptors.md). The main goal is to hide implementation details and minimize redundant code. Usually, descriptors are similar with limited differences so those changes can be parameterized by the function arguments.

Consider an example, where we want to create property, which updates `document.title` and holds its original value. Instead of creating unique descriptor, you can create re-usable factory:

```javascript
export default function titleFactory(defaultTitle = '') {
  return {
    set: (host, value = '') => {
      document.title = value;
      return value;
    },
    connect: (host, key) => {
      if (host[key] === undefined) {
        host[key] = defaultTitle;
      }
    },
  }
}
```

Then, use `titleFactory` function wherever you want. For example, it is straightforward to refactor &lt;simple-counter&gt; from [Getting Started](../README.md) section to make `count` property connected to the `document.title`. The only important difference here is in the line with the property definition:

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

The hybrids uses factory pattern to provide all the features required for building reach custom elements. You can create [properties](../built-in-factories/property.md) connected to the attribute value with type checking, [render](../built-in-factories/render.md) DOM structure of the element or connect [parent or children](../built-in-factories/parent-children.md) elements.