# Introduction

The only way to create a custom element is to use a class, which extends `HTMLElement` and define it with Custom Elements API:

```javascript
class MyElement extends HTMLElement {
  ...
}

customElements.define('my-element', MyElement);
```

So, it's obvious that many libraries followed this pattern and introduced own constructor, which should be extended instead of `HTMLElement`. Then all library features are available through static or instance methods and properties. Usually, it means, that the code is stateful. And, it carries all of the classes burdens - confusing `this`, binding, or hard composability. The code is written in an imperative way with a lot of sequential instructions executed within some lifecycle methods.

## The Concept

In contrast to that model, the hybrids library provides a simple and declarative way of creating custom elements. Its name is taken from the idea, that it is a mix of functional and object-oriented architecture with a unique approach for defining custom elements, just like this:

```javascript
import { define } from 'hybrids';

const MyElement = {
  count: 0,
  render: ({ count }) => {...},
};

define('my-element', MyElement);
```

Even though the above code might look straightforward, there are applied some unique concepts, that make it possible. This example is a result of the three property-related ideas used together: [descriptors](descriptors.md), [factories](factories.md) and [translation](translation.md). Also, the library uses cache and change detection mechanisms, which simplify lifecycle of the component.

## Simplified Lifecycle

The lifecycle of the web component was redesign. With the help of the cache and change detection mechanisms, it is possible to have only the `connect` and `disconnect` callbacks in the scope of the property descriptor. 

What usually would be an effect of state computation is here a cause to do that computation. Every single property (including `render`) is independent. If it requires other properties from the component, it calls them. Only then values of those properties are calculated. We can illustrate it with the following diagram:


![Lifecycle with cache and change detection](../assets/lifecycle.svg)

The render property (an update function, which manipulates DOM) requires current state took from other properties - not the opposite. It means that setting state within some lifecycle callback (even asynchronously fetched data) is not needed. Why is that? Change detection mechanism allows triggering update function when one of the related property of the render changes. In turn, an update will be called only if at least one of the dependency has changed because of the cache mechanism.

In the result, we can easily create a component structure as a list of properties (inputs) and pure render function (output) that reflects the current state of the component to the DOM.

Moreover, In this concept side effects should be treated as something that is outside of the component scope. Usually, they are effects of the user input or other DOM events attached to the internal structure of the component. Render pattern used in the library allows to implemented them as ordinary functions, that take custom element instance and change property values (inputs). Those changes will eventually cause render property to update, but only when it is needed.