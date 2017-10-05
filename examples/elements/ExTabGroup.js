import { children, property } from '../../src';
import ExTab from './ExTab';

export default class ExTabGroup {
  static properties = {
    tabs: children(ExTab),
    selected: property(Number),
  }

  static view = {
    template: `
      <button *for:="tab: tabs" on:click="activate">{{ tab.name }}</button>
      <slot></slot>
    `,
  }

  changed({ tabs, selected }) {
    if (tabs !== this.tabs) {
      const index = this.tabs.findIndex(
        (t, i) => t.selected && i !== this.selected,
      );

      if (index > -1) {
        this.selected = index;
      }
    }

    if (selected !== this.selected) {
      this.tabs.forEach((t, i) => { t.selected = i === this.selected; });
    }
  }

  activate({ tab }) {
    this.selected = this.tabs.indexOf(tab);
  }
}
