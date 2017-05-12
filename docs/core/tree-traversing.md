# Tree Traversing

Generally, tree traversing helpers operate on a light DOM. If your custom element is in a shadow DOM, `parent()` matches only elements, that are inside shadow DOM. Similary, `children()` matches only elements, that are listed in `el.children`.

### `parent(Component): component`

* `Component` is a reference to hybrid component definition
* Returns first matched `component` instance or `null`
* Throws `Illegal invocation` when invoked in `constructor()`. Parent element is related to lifecycle of the element, so it fits best in `connect()` method.

```javascript
import { parent } from '@hybrids/core';

class MyParent {
  constructor() {
    this.answer = 42;
  }
}

class MyChild {
  connect() {
    const parent = parent(MyParent);
    window.alert(`Meaning of live is: ${parent.answer}`);
  }
}
```


Matching criteria is related to a component definition rather than element's tag name. It is irrelevant how you eventually name your custom elements. For above example, we can use custom tag names: 

```javascript
define({ 'my-super-element': MyParent, 'my-super-child': MyChild });
```
```html
<my-super-element>
  <div>
    <my-super-child></my-super-child>
  </div>
</my-super-child>
```

When this code is attached to document body, alert popups with correct answer.

### `children(property, Component, options = {}): array`

Connects live list of a children components, which is updated when DOM mutates, with component property.

* `property` is a property name of the component instance  connected to children list
* `Component` is a hybrid component definition
* `options` is an object with the following fields:
  * **deep**: `true|false` - by default, only direct children of an element are matched; when it is a `true`, it will go deep into children list
  * **nested**: `true|false` - indicates if `Component` can be nested in other `Component`; works only when `deep` is set to `true`
* Throws `Illegal invocation` when invoked outside of the `constructor()` method

`children()` adds `MutationObserver` to host element to listen for changes. This action should be done only once when element is created, so calling `children()` outside of the component `constructor()` throws an error.

```javascript
import { children } from '@hybrids/core';

class MyChild {
  constructor() {
    this.value = Math.random();
  }
}

class MyParent {
  constructor() {
    children('items', MyChild);
  }
  
  connect() {
    this.items.forEach(item => console.log(`Value is ${item.value}`);
  }
}
```

Example structure of elements looks like this:

```html
<my-parent>
  <!-- direct children -->
  <my-child></my-child>
  
  <my-child>
    <!-- 'nested' children -->
    <my-child></my-child>
    <my-child></my-child>
  </my-child>
  
  
  <div>
    <!-- 'deep' children -->
    <my-child></my-child>
    <my-child>
      <!-- 'deep' and 'nested' children -->
      <my-child></my-child>
    </my-child>
  </div>
</my-parent>
```

### Observing Changes

`children()` updates list of children mutating array. However updates uses set operation, which can be observed. To listen to children updates, use pattern presented in corresponding [Component Structure](../component-structure.md) section.