# Browser Support

Hybrids supports all evergreen browsers and IE11 (When required polyfills are included). IE11 requires also ES2015 API polyfill. The easiest way is to include `@hybrids/shim`  and [`core-js`](https://github.com/zloirock/core-js) packages at top of your project:

```javascript
import 'core-js/shim'; // IE11: for ES2015 API support
import '@hybrids/shim';
...
```

`@hybrids/shim` package includes:

* Custom Elements: [https://github.com/webcomponents/custom-elements](https://github.com/webcomponents/custom-elements)
* Template: [https://github.com/webcomponents/template](https://github.com/webcomponents/template)
* Shady DOM: [https://github.com/webcomponents/shadydom](https://github.com/webcomponents/shadydom)
* Shady CSS: [https://github.com/webcomponents/shadycss](https://github.com/webcomponents/shadycss)

You should be aware of some limitations that polyfills have. Read their documentation to know more.