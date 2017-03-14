# Basics

#### NPM package: [`@hybrids/core`](https://www.npmjs.com/package/@hybrids/core)

`@hybrids/core` is a root package created on top of [Custom Elements API](https://www.w3.org/TR/custom-elements). It provides component skeleton and basic API for creating custom elements using _hybrid architecture_ concept.

#### Custom Elements API

Custom Elements specification introduces class based approach to define new elements. Consider following example:

```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    this.value = 0;
  }

  count() {
    this.value += 1;
  }
}

customElements.define('my-element', MyElement);
```

This is a natural choice to create new elements, as all built-ins are defined in almost the same way. However, that architecture has some important drawbacks:

* Framework or library is forced to middleware between custom element definition and `HTMLElement` constructor
* Users of those libraries have to be aware where `super()` is required
* Hiding internal implementation is impossible - every method defined in custom element prototype is public
* Methods and properties from `HTMLElement` prototype can be overwritten
* Instance of class definition can't be created directly \(only constructor returned by `customElements.define()` method can be called with `new` operator\)

For example, you can find that approach in [Polymer](https://www.polymer-project.org/1.0/blog/2016-09-09-polymer-2.0) and [Skate](https://skatejs.gitbooks.io/skatejs/content/docs/api/Component.html) libraries.

## Hybrid Architecture

> **Hybrid**: something that is a mixture of two very different things \([Cambridge Dictionary](http://dictionary.cambridge.org/dictionary/english/hybrid)\)

The core concept of the hybrid architecture is simple: instead of using Custom Elements API directly, library creates extended `HTMLElement` constructor as a wrapper and connects custom element properties, attributes, callbacks, element instance etc.. to your component definition. The main advantage is that a component definition stays clear and pure. Other benefit is that it allows you to decide which properties, methods and attributes you want to be a part of your public API.

Let's take an example and change it to a hybrid component:

```javascript
export class MyElement {
  static get options() {
    return {
      properties: ['count']
    }
  }

  constructor() {
    this.value = 0;
  }

  count() {
    this.value += 1;
  }
}
```

You can notice few differences:

1. No explicit inheritance - it is a pure class definition with no direct connection to Web APIs
2. `MyElement.options` static property is added - it contains custom element configuration
3. `this.value` property is not listed in `properties` option - it is private and only component instance has access to it

Then `define()` method connects hybrid component definition with custom element:

```javascript
import { define } from '@hybrids/core';
import MyElement from './MyElement';

define('my-element', MyElement);
```

You can notice, that `MyElement` is super simple and has no meaningful logic. Essentially, using private API is important when your component will be more complex or will have internal structure \(e.g. using one of the available plugins\).

### Creating a Customized Built-in Element

The only limitation of the hybrid architecture is that it can create only custom elements, which extends `HTMLElement`. It is not possible to use it to create a customized built-in  elements, e.g.: `<div is="my-div">`. However, this feature is still under consideration. For example, Webkit developers decided to not implement it at all.

If you need to extend built-in element, you can wrap it with [autonomous custom element](https://www.w3.org/TR/custom-elements/#autonomous-custom-element):

```html
<my-super-button>
  <!-- Shadow DOM -->
    <button>
     <slot></slot>
    </button>
  <!-- Shadow DOM -->
</my-super-button>
```



