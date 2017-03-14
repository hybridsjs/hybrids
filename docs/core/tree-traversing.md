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

### `children(Component, options = {}): array`

Creates live list of a children components, which is updated when DOM mutates.

* `Component` is a hybrid component definition
* `options` is an object with the following fields:
  * **deep**: `true|false` - by default, only direct children of an element are matched; when it is a `true`, it will go deep into children list
  * **nested**: `true|false` - indicates if `Component` can be nested in other `Component`; works only when `deep` is set to `true`
* Returns a live list as an `array` instance (updated when DOM mutates)
* Throws `Illegal invocation` when invoked outside of the `constructor()` method

`children()` can be used only in `constructor()`, because it adds `MutationObserver` to host element. This action should be done only once when element is created. Returned `array` reference is used to update list elements, so you should not replace created property.

```javascript
import { children } from '@hybrids/core';

class MyChild {
  constructor() {
    this.value = Math.random();
  }
}

class MyParent {
  constructor() {
    this.items = children(MyChild);
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
  
  <!-- 'deep' children -->
  <div>
    <my-child></my-child>
    <my-child></my-child>
  </div>
  
  <!-- 'nested' children -->
  <my-child>
    <my-child></my-child>
    <my-child></my-child>
  </my-child>
</my-parent>
```

### Observing Changes

`children()` uses array reference, so you can't use getter/setter or observer pattern to observe list updates. However, when children list is updated, `hybrid-change` custom event is dispatched on host element, which `detail` has map of changed properties. You can listen to this event using `listenTo` helper:

```javascript
import { children, listenTo } from '@hybrids/core';

class MyElement {
  constructor() {
    this.items = children(ChildElement);
    
    listenTo('hybrid-change', ({ detail: { items } }) => {
      if (items) console.log('items changed');
    });
  }
}
```

Usually, you don't have to observe changes directly, because plugins do that for you. Read [Plugins](../core/plugins.md) section to know more.