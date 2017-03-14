# Element Definition

```javascript
import { define } from '@hybrids/core';
```

`define()` method replaces `customElements.define()` with very similar API. However, it works differently according to passed arguments:

### `define(tagName, Component): constructor`

* `tagName` is a dash-case custom element tag name
* `Component` is a hybrid component definition
* Returns `constructor` created with `customElements.define()` 

```javascript
const HTMLMyElement = define('my-element', MyElement);

// You can create imperatively custom element
const el = new HTMLMyElement();
document.body.appendChild(el);
```

### `define({ tagName: Component, ... }): object`

* `tagName` is a PascalCase, camelCase or dash-case custom element name
* `Component` is a hybrid component definition
* Returns `object` with `tagName` keys set to assigned `constructor`

When object is passed as an argument, it is handled as a `key` -> `value` map. Property keys are transformed from _PascalCase_ and _camelCase_ to _dash-case_. This feature allows  destructuring, which simplifies arguments structure.

```javascript
// Map with keys (PascalCase, camelCase or dash-case)
define({ 'MyElement': MyElement, 'other-element': OtherElement })

// Object destructuring
define({ MyElement, OtherElement })
```

### `define(tagName): fn`

* `tagName` is a dash-case custom element tag name
* It returns original hybrid component definition, so you can still export your class definition and use it elsewhere

You can also pass `tagName` only. `define(tagName)` returns a function, which expects component definition as an argument. You can use this construction with  [decorators](https://github.com/tc39/proposal-decorators):

```javascript
@define('my-element')
export class MyElement {
 ...
}
```

You have to be aware, that in this construction, custom element will be defined immediately when file with component definition is imported. Usually, the best option is to use `define()` as a decorator only with root components, which don't have dependencies.

## Resolving Dependencies

Hybrid components have unique feature to resolve component dependencies. Let's take an example of the components structure:

```
CompA
| - CompB
  | - CompD
| - CompD
```

The above diagram shows, that `CompA` has `CompB` and `CompD` in the internal structure (in Shadow DOM). However, `CompB` also has `CompD` inside. 

To resolve those dependencies, one solution is to define all hybrid components independently, because Custom Elements register is global and it doesn't allow to define the same tag name twice. But with this approach, we lose overall control over component dependencies and when and how they are defined.

A better way is to use **define** option inside hybrid component and allow library to resolve component dependencies:

```javascript
class CompD {...}

class CompB {
  static get options() { 
    return { 
      define: { CompD }
    };
  }
  ...
}

class CompA {
  static get options() { 
    return { 
      define: { CompB, CompD }
    };
  }
  ...
}

// You need to define only root component
define({ CompA });
```

Component dependencies are defined before component itself. In above example elements will be defined in following order: `CompD`, `CompB`,`CompD`,`CompA`.  Despite the fact that `CompD` is defined twice, custom elements will be registered correctly. It works, because `define()` method checks if hybrid component is already registered. If tag name is bind with the same hybrid component as passed as an argument, it just returns element constructor and omits whole definition process. 

### Tag Name Conflicts

Sometimes third-party custom elements may conflict with your custom element tag name. Hybrid architecture decouple custom element name from your hybrid component, so you can safely define hybrid component with any tag name. 

```javascript
class XComponent {
  static get options() { 
    return { 
      define: { 'my-x-button': XButton }
    };
  }
  ...
}
```

In this example, if `<x-button>` is already defined, you can change custom element to `<my-x-button>` to avoid name conflict, but still use `XButton` component.