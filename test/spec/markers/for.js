import { getNodeContext } from '../../../src/template/expression';

describe('Marker For:', () => {
  function extractValues(el) {
    return Array.from(el.shadowRoot.querySelectorAll('[data-value]')).map(
      node => node.textContent,
    );
  }

  describe('one array instance', () => {
    test(class {
      static component = {
        template: `
          <template for:="items">
            <div data-value hidden>{{ item }}</div>
            <span hidden>test</span>
          </template>
        `,
      };

      constructor() {
        this.items = ['4', '2', '3', '1'];
      }
    }, {
      'initial items list': (el) => {
        expect(extractValues(el)).toEqual(['4', '2', '3', '1']);
      },
      'initial locals': (el) => {
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
      },
      'shifts item locals': (el, component) => {
        component.items.shift();
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
      },
      'pops item': (el, component) => {
        component.items.pop();
        return (done) => {
          expect(extractValues(el)).toEqual(['4', '2', '3']);
          done();
        };
      },
      'shifts item': (el, component) => {
        component.items.shift();
        return (done) => {
          expect(extractValues(el)).toEqual(['2', '3', '1']);
          done();
        };
      },
      'unshifts item': (el, component) => {
        component.items.unshift('6');
        return (done) => {
          expect(extractValues(el)).toEqual(['6', '4', '2', '3', '1']);
          done();
        };
      },
      'sorts item': (el, component) => {
        component.items.sort();
        return (done) => {
          expect(extractValues(el)).toEqual(['1', '2', '3', '4']);
          done();
        };
      },
      'replaces using old items': (el, component) => {
        component.items = ['2', '2', '1', '4'];
        return (done) => {
          expect(extractValues(el)).toEqual(['2', '2', '1', '4']);
          done();
        };
      },
      'replaces with less items': (el, component) => {
        component.items = ['2', '2', '1'];
        return (done) => {
          expect(extractValues(el)).toEqual(['2', '2', '1']);
          done();
        };
      },
      'empty with length': (el, component) => {
        component.items.length = 0;
        return (done) => {
          expect(extractValues(el)).toEqual([]);
          done();
        };
      },
      'empty with new instance': (el, component) => {
        component.items = [];
        return (done) => {
          expect(extractValues(el)).toEqual([]);
          done();
        };
      },
      'pushes items': (el, component) => {
        component.items.push('1', '2', '3');
        return (done) => {
          expect(extractValues(el)).toEqual(['4', '2', '3', '1', '1', '2', '3']);
          done();
        };
      },
      'multiple stage splice': (el, component) => {
        component.items.push('1', '2', '3');
        return (done) => {
          component.items.splice(3, 2);

          requestAnimationFrame(() => {
            expect(extractValues(el)).toEqual(['4', '2', '3', '2', '3']);
            done();
          });
        };
      },
      'multiple stage sort': (el, component) => {
        component.items.push('1', '2', '3');
        return (done) => {
          component.items.sort();

          requestAnimationFrame(() => {
            expect(extractValues(el)).toEqual(['1', '1', '2', '2', '3', '3', '4']);
            done();
          });
        };
      },
    });
  });

  describe('nested array instances', () => {
    test(class {
      static component = {
        template: `
          <template for:="items">
            <template for:="value: item.values">
              <div data-value :item="item">{{ value }}</div>
            </template>
            <span>some static text</span>
          </template>
        `,
      }

      constructor() {
        this.items = [
          { values: ['1', '2', '3'] },
          { values: ['4', '5', '6'] },
          { values: ['7', '8', '9'] },
        ];
      }
    }, {
      'renders initial items': (el) => {
        expect(extractValues(el)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
      },
      'pops item': (el, component) => {
        component.items.pop();
        return (done) => {
          expect(extractValues(el)).toEqual(['1', '2', '3', '4', '5', '6']);
          done();
        };
      },
      'shifts item': (el, component) => {
        component.items.shift();
        return (done) => {
          expect(extractValues(el)).toEqual(['4', '5', '6', '7', '8', '9']);
          done();
        };
      },
      'unshifts item': (el, component) => {
        component.items.unshift({ values: ['10'] });
        return (done) => {
          expect(extractValues(el)).toEqual(['10', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
          done();
        };
      },
      'sorts item': (el, component) => {
        component.items.sort((a, b) => b.values[0] - a.values[0]);
        return (done) => {
          expect(extractValues(el)).toEqual(['7', '8', '9', '4', '5', '6', '1', '2', '3']);
          done();
        };
      },
      'empty with length': (el, component) => {
        component.items.length = 0;
        return (done) => {
          expect(extractValues(el)).toEqual([]);
          done();
        };
      },
    });
  });

  describe('multiple nested array instances', () => {
    test(class {
      static component = {
        template: `
          <template for:="items">
            <template for:="nested: item">
              <template for:="value: nested"><span data-value>{{ value }}</span></template>
            </template>
          </template>
        `,
      };

      constructor() {
        this.items = [
          [['1', '3'], ['5', '2']],
          [['4', '3'], ['6', '2']],
        ];
      }
    }, {
      'renders initial items': (el) => {
        expect(extractValues(el)).toEqual(['1', '3', '5', '2', '4', '3', '6', '2']);
      },
      'has nested locals': (el) => {
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
      },
      'pops root item': (el, component) => {
        component.items.pop();
        return (done) => {
          expect(extractValues(el)).toEqual(['1', '3', '5', '2']);
          done();
        };
      },
      'pops children item': (el, component) => {
        component.items[0].pop();
        return (done) => {
          expect(extractValues(el)).toEqual(['1', '3', '4', '3', '6', '2']);
          done();
        };
      },
      'pops nested children item': (el, component) => {
        component.items[1][0].pop();
        return (done) => {
          expect(extractValues(el)).toEqual(['1', '3', '5', '2', '4', '6', '2']);
          done();
        };
      },
      'shifts root item': (el, component) => {
        component.items.shift();
        return (done) => {
          expect(extractValues(el)).toEqual(['4', '3', '6', '2']);
          done();
        };
      },
      'shifts children item': (el, component) => {
        component.items[0].shift();
        return (done) => {
          expect(extractValues(el)).toEqual(['5', '2', '4', '3', '6', '2']);
          done();
        };
      },
      'shifts nested children item': (el, component) => {
        component.items[1][0].shift();
        return (done) => {
          expect(extractValues(el)).toEqual(['1', '3', '5', '2', '3', '6', '2']);
          done();
        };
      },
      'sorts item': (el, component) => {
        component.items.forEach((item) => {
          item.forEach((child) => {
            child.sort((a, b) => a - b);
          });
        });

        return (done) => {
          expect(extractValues(el)).toEqual(['1', '3', '2', '5', '3', '4', '2', '6']);
          done();
        };
      },
    });
  });

  describe('one object instance', () => {
    test(class {
      static component = {
        template: `
          <template for:="items">
            <div data-value hidden>{{ item }}</div>
            <span hidden>test</span>
          </template>
        `,
      }

      constructor() {
        this.items = { a: 'a', c: 'c', b: 'b' };
      }
    }, {
      'initial items list': (el) => {
        expect(extractValues(el)).toEqual(['a', 'c', 'b']);
      },
      'initial locals': (el) => {
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
      },
      'deletes property': (el, component) => {
        delete component.items.c;
        return (done) => {
          expect(extractValues(el)).toEqual(['a', 'b']);
          done();
        };
      },
      'added property': (el, component) => {
        component.items.newProperty = 'test';
        return (done) => {
          expect(extractValues(el)).toEqual(['a', 'c', 'b', 'test']);
          done();
        };
      },
      'replaces the same': (el, component) => {
        const elements = Array.from(el.shadowRoot.querySelectorAll('[data-value]'));
        component.items = { a: 'a', c: 'c', b: 'b' };
        return (done) => {
          expect(extractValues(el)).toEqual(['a', 'c', 'b']);
          expect(elements).toEqual(Array.from(el.shadowRoot.querySelectorAll('[data-value]')));
          done();
        };
      },
      'replaces without property': (el, component) => {
        component.items = { a: 'a', b: 'b' };
        return (done) => {
          expect(extractValues(el)).toEqual(['a', 'b']);
          done();
        };
      },
    });
  });
});
