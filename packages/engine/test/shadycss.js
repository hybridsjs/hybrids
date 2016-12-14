import { define } from '@hybrids/core';
import { engine } from '../src/index';
import Template from '../src/template';

describe('Engine | Shadow DOM styling -', () => {
  let globalEl;
  let globalStyles;
  let el;

  beforeAll(() => {
    globalEl = document.createElement('div');
    globalEl.classList.add('testing');
    globalEl.textContent = 'Simple text';
    globalStyles = document.createElement('style');
    globalStyles.innerHTML = 'div.testing { color: rgb(0, 255, 0); font-family: Arial; }';

    document.body.appendChild(globalEl);
    document.body.appendChild(globalStyles);
  });

  afterAll(() => {
    document.body.removeChild(globalEl);
    document.body.removeChild(globalStyles);
  });

  describe('inner template with inner styles', () => {
    beforeAll(() => {
      class EngineCssInner {
        static get options() {
          return {
            use: [engine],
            template: `
              <style>
                :host {
                  display: block;
                  background: red;
                }
                div.testing { color: rgb(0, 0, 255); }
              </style>
              <div class="testing">This is some text</div>
              <div **for="items" class="testing">{{ @item }}</div>
            `
          };
        }

        constructor() {
          this.items = [1, 2, 3];
        }
      }

      define({ EngineCssInner });
      el = document.createElement('engine-css-inner');
      document.body.appendChild(el);
    });

    afterAll(() => {
      document.body.removeChild(el);
    });

    rafIt('style all divs', () => {
      requestAnimationFrame(() => {
        Array.from(el.shadowRoot.querySelectorAll('.testing')).forEach((child) => {
          const innerCSS = getComputedStyle(child);
          expect(innerCSS.color).toEqual('rgb(0, 0, 255)');
        });
      });
    });

    rafIt('not style outer divs', () => {
      requestAnimationFrame(() => {
        const outerCSS = getComputedStyle(globalEl);
        expect(outerCSS.color).toEqual('rgb(0, 255, 0)');
      });
    });
  });

  describe('inner template with outer styles', () => {
    beforeAll(() => {
      class EngineCssInnerOuter {
        static get options() {
          return {
            use: [engine],
            styles: [`
              :host {
                display: block;
                background: red;
              }
              div.testing { color: rgb(0, 0, 255); }
            `],
            template: `
              <div class="testing">This is some text</div>
              <div **for="items" class="testing">{{ @item }}</div>
            `
          };
        }

        constructor() {
          this.items = [1, 2, 3];
        }
      }

      define({ EngineCssInnerOuter });
      el = document.createElement('engine-css-inner-outer');
      document.body.appendChild(el);
    });

    afterAll(() => {
      document.body.removeChild(el);
    });

    rafIt('style all divs', () => {
      requestAnimationFrame(() => {
        Array.from(el.shadowRoot.querySelectorAll('.testing')).forEach((child) => {
          const innerCSS = getComputedStyle(child);
          expect(innerCSS.color).toEqual('rgb(0, 0, 255)');
        });
      });
    });

    rafIt('not style outer divs', () => {
      requestAnimationFrame(() => {
        const outerCSS = getComputedStyle(globalEl);
        expect(outerCSS.color).toEqual('rgb(0, 255, 0)');
      });
    });
  });

  describe('exported template with outer styles', () => {
    beforeAll(() => {
      const template = new Template(`
        <div class="testing">This is some text</div>
        <div **for="items" class="testing">{{ @item }}</div>
      `);

      class EngineCssExportedOuter {
        static get options() {
          return {
            use: [engine],
            styles: [`
              :host {
                display: block;
                background: red;
              }
              div.testing { color: rgb(0, 0, 255); }
            `],
            template: template.export()
          };
        }

        constructor() {
          this.items = [1, 2, 3];
        }
      }

      define({ EngineCssExportedOuter });
      el = document.createElement('engine-css-exported-outer');
      document.body.appendChild(el);
    });

    afterAll(() => {
      document.body.removeChild(el);
    });

    rafIt('style all divs', () => {
      requestAnimationFrame(() => {
        Array.from(el.shadowRoot.querySelectorAll('.testing')).forEach((child) => {
          const innerCSS = getComputedStyle(child);
          expect(innerCSS.color).toEqual('rgb(0, 0, 255)');
        });
      });
    });

    rafIt('not style outer divs', () => {
      requestAnimationFrame(() => {
        const outerCSS = getComputedStyle(globalEl);
        expect(outerCSS.color).toEqual('rgb(0, 255, 0)');
      });
    });
  });
});
