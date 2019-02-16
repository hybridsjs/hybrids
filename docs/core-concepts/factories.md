# Factories

The factory is nothing more than an ordinary function, which produces [property descriptor](descriptors.md). The primary goal of the factories is to hide implementation details and minimize redundant code. Usually, descriptors are similar and have limited differences, which can be parameterized by the function arguments.

## Example

Consider an example, where you want to create a property, which updates `document.title` and holds its original value. Instead of creating a unique descriptor, you can create a re-usable factory:

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

Then, use `titleFactory` function wherever you want. For example, it is straightforward to refactor &lt;simple-counter&gt; from [Getting Started](../README.md) section to make `count` property connected to the `document.title`. The only important difference is in the line with the property definition:

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

The hybrids uses factories to provide all the features required for building rich custom elements:

* create [properties](../built-in-factories/property.md) connected to the attribute value with type transform
* [render](../built-in-factories/render.md) DOM structure of the element
* connect [parent or children](../built-in-factories/parent-children.md) elements
