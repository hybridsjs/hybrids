# Installation

Project is composed by the following packages:

| NPM | Version | Type | UMD | Description |
| --- | --- | --- | --- | --- |
| [`@hybrids/core`](https://www.npmjs.com/package/@hybrids/core) |  [![npm version](https://badge.fury.io/js/%40hybrids%2Fcore.svg)](https://badge.fury.io/js/%40hybrids%2Fcore) | core | \* | Custom elements definition using hybrid architecture |
| [`@hybrids/engine`](https://www.npmjs.com/package/@hybrids/engine) | [![npm version](https://badge.fury.io/js/%40hybrids%2Fengine.svg)](https://badge.fury.io/js/%40hybrids%2Fengine) | plugin | \* | View Engine with unidirectional data binding using consistent micro DSL |
| [`@hybrids/vdom`](https://www.npmjs.com/package/@hybrids/vdom) | [![npm version](https://badge.fury.io/js/%40hybrids%2Fvdom.svg)](https://badge.fury.io/js/%40hybrids%2Fvdom) | plugin | \* | Middleware for connecting any React-like render library |
| [`@hybrids/shim`](https://www.npmjs.com/package/@hybrids/shim) | [![npm version](https://badge.fury.io/js/%40hybrids%2Fshim.svg)](https://badge.fury.io/js/%40hybrids%2Fshim) | utility |  | Collection of polyfills required for [Custom Elements](https://www.w3.org/TR/custom-elements/), [Template](https://www.w3.org/TR/html-templates/) and [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) specifications |
| [`@hybrids/debug`](https://www.npmjs.com/package/@hybrids/debug) | [![npm version](https://badge.fury.io/js/%40hybrids%2Fdebug.svg)](https://badge.fury.io/js/%40hybrids%2Fdebug) | utility |  | DevTools console logging documentation from thrown error messages |

## Recommendation

The best way is to use one of the npm client and module bundler \(e.g. [webpack](https://webpack.js.org/)\):

```bash
npm i -S @hybrids/core @hybrids/engine
```

**module.js**:

```javascript
import { define } from '@hybrids/core';
import { engine } from '@hybrids/engine';

define('my-element', ...);
```

### Development & Production Mode

Packages check `process.env.NODE_ENV !== 'production'` to detect if they are used in development mode. Remember to create production bundle with `process.env.NODE_ENV` set to `'production'`.

## Built Version

A bundle is especially created for a direct usage in the browsers. It contains only packages with UMD column checked. Its version matches the latest version from included packages.

```html
<!-- Development mode -->
<script src="https://unpkg.com/hybrids/dist/hybrids.js"></script>

<!-- Production mode -->
<script src="https://unpkg.com/hybrids/dist/hybrids.min.js"></script>
```

> These urls target latest version \(You can add postfix to specify: .../hybrids**@0.6.2**/dist/...\).

All named exports are combined into one global namespace: `window.hybrids`. Packages have unique named exports, so you can access all available API like this:

```html
<script> hybrids.define('my-element', ...); </script>
```



