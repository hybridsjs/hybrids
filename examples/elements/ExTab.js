import { property } from '../../src';

export default class ExTab {
  static properties = {
    name: property(),
    selected: property(Boolean),
  }

  static view = {
    template: `
      <div prop:hidden="selected | not">
        <slot></slot>
      </div>
    `,
  }

  constructor() {
    this.name = '';
    this.selected = false;
  }
}
