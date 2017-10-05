import { getNodeContext } from '../../../../src/template/expression';

describe('Marker For:', () => {
  function extractValues(el) {
    return Array.from(el.shadowRoot.querySelectorAll('[data-value]')).map(
      node => node.textContent,
    );
  }

  describe('one array instance', () => {
    const test = hybrid(class {
      static view = {
        template: `
          <template for:="store.items">
            <div data-value hidden>{{ item }}</div>
            <span hidden>test</span>
          </template>
        `,
      };

      constructor() {
        this.store = {
          items: ['4', '2', '3', '1'],
        };
      }
    });

    it('initial items list', test(({ el }) => {
      expect(extractValues(el)).toEqual(['4', '2', '3', '1']);
    }));

    it('initial locals', test(({ el }) => {
      expect(getNodeContext(el.shadowRoot.children[0])).toEqual({
        item: '4',
        $item: jasmine.objectContaining({
          index: 0,
          length: 4,
        }),
      });
      expect(getNodeContext(el.shadowRoot.children[2])).toEqual({
        item: '2',
        $item: jasmine.objectContaining({
          index: 1,
          length: 4,
        }),
      });
    }));

    it('shifts item locals', test(({ el, component }) => {
      component.store.items.shift();
      return (done) => {
        expect(getNodeContext(el.shadowRoot.children[0])).toEqual({
          item: '2',
          $item: jasmine.objectContaining({
            index: 0,
            length: 3,
          }),
        });
        expect(getNodeContext(el.shadowRoot.children[2])).toEqual({
          item: '3',
          $item: jasmine.objectContaining({
            index: 1,
            length: 3,
          }),
        });

        done();
      };
    }));

    it('pops item', test(({ el, component }) => {
      component.store.items.pop();
      return (done) => {
        expect(extractValues(el)).toEqual(['4', '2', '3']);
        done();
      };
    }));

    it('shifts item', test(({ el, component }) => {
      component.store.items.shift();
      return (done) => {
        expect(extractValues(el)).toEqual(['2', '3', '1']);
        done();
      };
    }));

    it('sorts item', test(({ el, component }) => {
      component.store.items.sort();
      return (done) => {
        expect(extractValues(el)).toEqual(['1', '2', '3', '4']);
        done();
      };
    }));

    it('replaces using old items', test(({ el, component }) => {
      component.store.items = ['2', '2', '1', '4'];
      return (done) => {
        expect(extractValues(el)).toEqual(['2', '2', '1', '4']);
        done();
      };
    }));

    it('replaces with less items', test(({ el, component }) => {
      component.store.items = ['2', '2', '1'];
      return (done) => {
        expect(extractValues(el)).toEqual(['2', '2', '1']);
        done();
      };
    }));

    it('empty with length', test(({ el, component }) => {
      component.store.items.length = 0;
      return (done) => {
        expect(extractValues(el)).toEqual([]);
        done();
      };
    }));

    it('empty with new instance', test(({ el, component }) => {
      component.store.items = [];
      return (done) => {
        expect(extractValues(el)).toEqual([]);
        done();
      };
    }));

    it('pushes items', test(({ el, component }) => {
      component.store.items.push('1', '2', '3');
      return (done) => {
        expect(extractValues(el)).toEqual(['4', '2', '3', '1', '1', '2', '3']);
        done();
      };
    }));

    it('multiple stage splice', test(({ el, component }) => {
      component.store.items.push('1', '2', '3');
      return (done) => {
        component.store.items.splice(3, 2);
        Promise.resolve().then(() => {
          requestAnimationFrame(() => {
            expect(extractValues(el)).toEqual(['4', '2', '3', '2', '3']);
            done();
          });
        });
      };
    }));

    it('multiple stage sort', test(({ el, component }) => {
      component.store.items.push('1', '2', '3');
      return (done) => {
        component.store.items.sort();
        Promise.resolve().then(() => {
          requestAnimationFrame(() => {
            expect(extractValues(el)).toEqual(['1', '1', '2', '2', '3', '3', '4']);
            done();
          });
        });
      };
    }));

    it('reuse items when list replaced', test(({ el, component }) => {
      const items = Array.from(el.shadowRoot.querySelectorAll('[data-value]'));
      component.store.items = [1, 2, 3, 4];
      return (done) => {
        Array.from(el.shadowRoot.querySelectorAll('[data-value]')).every(item => items.includes(item));
        done();
      };
    }));
  });

  describe('nested array instances', () => {
    const test = hybrid(class {
      static view = {
        template: `
          <template for:="store.items">
            <template for:="value: item.values">
              <div data-value prop:item="item">{{ value }}</div>
            </template>
            <span>some static text</span>
          </template>
        `,
      }

      constructor() {
        this.store = {
          items: [
            { values: ['1', '2', '3'] },
            { values: ['4', '5', '6'] },
            { values: ['7', '8', '9'] },
          ],
        };
      }
    });

    it('renders initial items', test(({ el }) => {
      expect(extractValues(el)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    }));

    it('pops item', test(({ el, component }) => {
      component.store.items.pop();
      return (done) => {
        expect(extractValues(el)).toEqual(['1', '2', '3', '4', '5', '6']);
        done();
      };
    }));

    it('shifts item', test(({ el, component }) => {
      component.store.items.shift();
      return (done) => {
        expect(extractValues(el)).toEqual(['4', '5', '6', '7', '8', '9']);
        done();
      };
    }));

    it('unshifts item', test(({ el, component }) => {
      component.store.items.unshift({ values: ['10'] });
      return (done) => {
        expect(extractValues(el)).toEqual(['10', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
        done();
      };
    }));

    it('sorts item', test(({ el, component }) => {
      component.store.items.sort((a, b) => b.values[0] - a.values[0]);
      return (done) => {
        expect(extractValues(el)).toEqual(['7', '8', '9', '4', '5', '6', '1', '2', '3']);
        done();
      };
    }));

    it('empty with length', test(({ el, component }) => {
      component.store.items.length = 0;
      return (done) => {
        expect(extractValues(el)).toEqual([]);
        done();
      };
    }));
  });

  describe('multiple nested array instances', () => {
    const test = hybrid(class {
      static view = {
        template: `
          <template for:="store.items">
            <template for:="nested: item">
              <template for:="value: nested"><span data-value>{{ value }}</span></template>
            </template>
          </template>
        `,
      };

      constructor() {
        this.store = {
          items: [
            [['1', '3'], ['5', '2']],
            [['4', '3'], ['6', '2']],
          ],
        };
      }
    });

    it('renders initial items', test(({ el }) => {
      expect(extractValues(el)).toEqual(['1', '3', '5', '2', '4', '3', '6', '2']);
    }));

    it('has nested locals', test(({ el }) => {
      const list = el.shadowRoot.querySelectorAll('[data-value]');

      expect(getNodeContext(list[0])).toEqual({
        item: [['1', '3'], ['5', '2']],
        $item: jasmine.objectContaining({
          index: 0,
          length: 2,
        }),
        nested: ['1', '3'],
        $nested: jasmine.objectContaining({
          index: 0,
          length: 2,
        }),
        value: '1',
        $value: jasmine.objectContaining({
          index: 0,
          length: 2,
        }),
      });
      expect(getNodeContext(list[7])).toEqual({
        item: [['4', '3'], ['6', '2']],
        $item: jasmine.objectContaining({
          index: 1,
          length: 2,
        }),
        nested: ['6', '2'],
        $nested: jasmine.objectContaining({
          index: 1,
          length: 2,
        }),
        value: '2',
        $value: jasmine.objectContaining({
          index: 1,
          length: 2,
        }),
      });
    }));

    it('pops root item', test(({ el, component }) => {
      component.store.items.pop();
      return (done) => {
        expect(extractValues(el)).toEqual(['1', '3', '5', '2']);
        done();
      };
    }));

    it('pops children item', test(({ el, component }) => {
      component.store.items[0].pop();
      return (done) => {
        expect(extractValues(el)).toEqual(['1', '3', '4', '3', '6', '2']);
        done();
      };
    }));

    it('pops nested children item', test(({ el, component }) => {
      component.store.items[1][0].pop();
      return (done) => {
        expect(extractValues(el)).toEqual(['1', '3', '5', '2', '4', '6', '2']);
        done();
      };
    }));

    it('shifts root item', test(({ el, component }) => {
      component.store.items.shift();
      return (done) => {
        expect(extractValues(el)).toEqual(['4', '3', '6', '2']);
        done();
      };
    }));

    it('shifts children item', test(({ el, component }) => {
      component.store.items[0].shift();
      return (done) => {
        expect(extractValues(el)).toEqual(['5', '2', '4', '3', '6', '2']);
        done();
      };
    }));

    it('shifts nested children item', test(({ el, component }) => {
      component.store.items[1][0].shift();
      return (done) => {
        expect(extractValues(el)).toEqual(['1', '3', '5', '2', '3', '6', '2']);
        done();
      };
    }));

    it('sorts item', test(({ el, component }) => {
      component.store.items.forEach((item) => {
        item.forEach((child) => {
          child.sort((a, b) => a - b);
        });
      });

      return (done) => {
        expect(extractValues(el)).toEqual(['1', '3', '2', '5', '3', '4', '2', '6']);
        done();
      };
    }));
  });

  describe('one object instance', () => {
    const test = hybrid(class {
      static view = {
        template: `
          <template for:="store.items">
            <div data-value hidden>{{ item }}</div>
            <span hidden>test</span>
          </template>
        `,
      }

      constructor() {
        this.store = {
          items: { a: 'a', c: 'c', b: 'b' },
        };
      }
    });

    it('initial items list', test(({ el }) => {
      expect(extractValues(el)).toEqual(['a', 'c', 'b']);
    }));

    it('initial locals', test(({ el }) => {
      expect(getNodeContext(el.shadowRoot.children[1])).toEqual({
        item: 'a',
        $item: jasmine.objectContaining({
          index: 0,
          length: 3,
          key: 'a',
        }),
      });
      expect(getNodeContext(el.shadowRoot.children[3])).toEqual({
        item: 'c',
        $item: jasmine.objectContaining({
          index: 1,
          length: 3,
          key: 'c',
        }),
      });
    }));

    it('deletes property', test(({ el, component }) => {
      delete component.store.items.c;
      return (done) => {
        expect(extractValues(el)).toEqual(['a', 'b']);
        done();
      };
    }));

    it('added property', test(({ el, component }) => {
      component.store.items.newProperty = 'test';
      return (done) => {
        expect(extractValues(el)).toEqual(['a', 'c', 'b', 'test']);
        done();
      };
    }));

    it('replaces the same', test(({ el, component }) => {
      const elements = Array.from(el.shadowRoot.querySelectorAll('[data-value]'));
      component.store.items = { a: 'a', c: 'c', b: 'b' };
      return (done) => {
        expect(extractValues(el)).toEqual(['a', 'c', 'b']);
        expect(elements).toEqual(Array.from(el.shadowRoot.querySelectorAll('[data-value]')));
        done();
      };
    }));

    it('replaces without property', test(({ el, component }) => {
      component.store.items = { a: 'a', b: 'b' };
      return (done) => {
        expect(extractValues(el)).toEqual(['a', 'b']);
        done();
      };
    }));
  });
});
