# Introduction

The only way to create a custom element is to use a class, which extends `HTMLElement` and define it with Custom Elements API:

```javascript
class MyElement extends HTMLElement {
  ...
}

customElements.define('my-element', MyElement);
```

It's obvious that many libraries followed that pattern and introduced own constructor, which should be extended instead of `HTMLElement`. All library features are available through the constructor and prototype of that base class. Usually, it means, that the code is stateful. This pattern requires overloading base methods and holding state in the instance of that class, so it carries all of the classes burdens - confusing `this`, binding, or hard composability. The code is written in an imperative way with a lot of sequential instructions executed within some lifecycle methods.

## Concept

In contrast to this common architecture, the hybrids library provides a simple and declarative way for creating custom elements. Its name is taken from the idea, that it is a mix of functional and object-oriented architecture with a unique approach for defining custom elements, just like this:

```javascript
import { define } from 'hybrids';

const MyElement = {
  count: 0,
  render: ({ count }) => {...},
};

define('my-element', MyElement);
```

Even though the above code might look straightforward, there are applied unique concepts, that make it possible. This example relays on the three property-related ideas used together: [descriptors](descriptors.md), [factories](factories.md) and [translation](translation.md). Additionally, the library uses change detection and cache mechanism to simplify the lifecycle of the component.

### Customized Built-in Elements

The concept decouples component definition from its corresponding class constructor. Property descriptors are independent - they can be easily shared between definitions, so they can't depend on the specific base class, like `HTMLAnchorElement`. The library always uses `HTMLElement` as a base class. 

[Customized built-in elements](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements#Customized_built-in_elements) are not supported, and only [autonomous custom elements](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements#Autonomous_custom_elements) can be defined. However, you can easily create custom element containing built-in elements:

```javascript
const MyLink = {
  href: '',
  render: ({ href }) => html`<a href=${href}>...</a>`,
};
```

## Simplified Lifecycle

The lifecycle of the component is redesigned. With the help of the cache and change detection, it is possible to have only `connect` and `disconnect` callbacks in the scope of the property descriptor. 

What usually would be an effect of state computation is here a cause for that computation. Every single property (including `render`) is independent. If it requires other properties from the component, it calls them. Only then values of those properties are calculated. We can illustrate it with the following diagram:

![Lifecycle with cache and change detection](../assets/lifecycle.svg)

The render property (an update function, which manipulates DOM) requires current state taken from other properties - not the opposite. Setting the state within some lifecycle callback (even asynchronously fetched data) is not needed. Change detection mechanism allows triggering update function only when one of the component properties changes.

In the result, we can easily create a component structure as a list of properties (inputs) and pure render function (output) that reflects the current state of the component to the DOM.

In this concept, side effects should be outside of the component scope. Usually, they are outcomes of the user input or other DOM events attached to the internal structure of the component. Render pattern used in the library allows to implemented them as ordinary functions, that take custom element instance and change property values (inputs). Those changes will eventually cause render property to update, but only when it is needed.