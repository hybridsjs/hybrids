import Template from '../../src/template/template';

describe('Polyfill styles:', () => {
  const globalEl = document.createElement('div');
  const globalStyles = document.createElement('style');

  beforeAll(() => {
    globalStyles.innerHTML = 'div { color: rgb(0, 255, 0); font-family: Arial; }';

    document.body.appendChild(globalEl);
    document.body.appendChild(globalStyles);
  });

  afterAll(() => {
    document.body.removeChild(globalEl);
    document.body.removeChild(globalStyles);
  });

  const tests = {
    'styles all divs': (el) => {
      Array.from(el.shadowRoot.querySelectorAll('.testing')).forEach((child) => {
        const innerCSS = getComputedStyle(child);
        expect(innerCSS.color).toEqual('rgb(0, 0, 255)');
      });
    },
    'not styles outer divs': () => {
      const outerCSS = getComputedStyle(globalEl);
      expect(outerCSS.color).toEqual('rgb(0, 255, 0)');
    },
  };

  describe('inline styles', () => {
    test(class {
      static component = {
        template: `
          <style>
            :host {
              display: block;
              background: red;
            }
            div { color: rgb(0, 0, 255); }
          </style>
          <div class="testing">This is some text</div>
          <div *for:="items" class="testing">{{ item }}</div>
        `,
      };

      constructor() {
        this.items = [1, 2, 3];
      }
    }, tests);
  });

  describe('external styles', () => {
    test(class {
      static component = {
        styles: [`
          :host {
            display: block;
            background: red;
          }
          div.testing { color: rgb(0, 0, 255); }
        `],
        template: `
          <div class="testing">This is some text</div>
          <div *for:="items" class="testing">{{ item }}</div>
        `,
      };

      constructor() {
        this.items = [1, 2, 3];
      }
    }, tests);
  });

  describe('external template and styles', () => {
    const template = new Template(`
      <div class="testing">This is some text</div>
      <div *for:="items" class="testing">{{ item }}</div>
    `).export();

    test(class {
      static component = {
        styles: [`
          :host {
            display: block;
            background: red;
          }
          div.testing { color: rgb(0, 0, 255); }
        `],
        template,
      };

      constructor() {
        this.items = [1, 2, 3];
      }
    }, tests);
  });
});
