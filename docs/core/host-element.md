# Host Element

### `host(): element`

* Takes no arguments
* Returns `element` instance bind with hybrid component

```javascript
import { host } from '@hybrids/core';

class MyElement {
  connect() {
    const el = host();
    
    // You have full access to element instance
    el.innerHTML = '<p>Example custom element</p>';
  }
}
```






