import { store } from '../../src';
import countStore from '../stores/countStore';

export default class ExCounter {
  static properties = {
    store: store(countStore),
  }

  static view = {
    template: `
      <div>{{ store.count }}</div>
      <button on:click="store.inc">inc</button>
    `,
  }
}
