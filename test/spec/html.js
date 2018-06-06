import { html } from '../../src/html';
import define, { HTMLBridge } from '../../src/define';

describe('html:', () => {
  let fragment;

  beforeEach(() => {
    fragment = document.createElement('div');
    document.body.appendChild(fragment);
  });

  afterEach(() => {
    document.body.removeChild(fragment);
  });

  const getArrayValues = f => Array.from(f.children)
    .map(child => child.textContent);

  it('renders static content', () => {
    const render = html`<div>static content</div>`;
    render({}, fragment);
    expect(fragment.children[0].outerHTML).toBe('<div>static content</div>');
  });

  it('reuses the same elements when re-render', () => {
    const render = value => html`<div>${value}</div>`;
    render(0)(fragment);
    const div = fragment.children[0];
    render(1)(fragment);

    expect(fragment.children[0]).toBe(div);
    expect(div.innerHTML).toBe('1');
  });

  describe('define helper', () => {
    it('defines hybrids', (done) => {
      const testHtmlDefine = { value: 'test' };
      html``.define({ testHtmlDefine });
      html``.define({ testHtmlDefine });

      requestAnimationFrame(() => {
        const el = document.createElement('test-html-define');
        expect(el.value).toBe('test');
        done();
      });
    });

    it('defines custom elements constructor', () => {
      class TestHtmlDefineExternalA extends HTMLBridge {
        constructor() {
          super();
          this.value = 'test';
        }
      }

      html``.define({ TestHtmlDefineExternalA });

      const el = document.createElement('test-html-define-external-a');
      expect(el.value).toBe('test');
    });

    it('does not throw for multiple define the same constructor', () => {
      class testHtmlDefineExternalB extends HTMLBridge {}
      expect(() => {
        html``.define({ testHtmlDefineExternalB });
        html``.define({ testHtmlDefineExternalB });
      }).not.toThrow();
    });

    it('throws for multiple define with different constructor', () => {
      expect(() => {
        html``.define({ TestHtmlDefineExternalC: class extends HTMLBridge {} });
        html``.define({ TestHtmlDefineExternalC: class extends HTMLBridge {} });
      }).toThrow();
    });

    it('throws for invalid value', () => {
      expect(() => {
        html``.define({ testHtmlDefineExternalD: 'value' });
      }).toThrow();
    });

    it('throws for duplicated tag name', () => {
      expect(() => {
        html``.define({ 'test-element': {}, testElement: {} });
      }).toThrow();
    });
  });

  describe('attribute expression with combined text value', () => {
    const render = (two, three) =>
      html`<div name="test" class="class-one ${two} ${three}"></div>`;

    it('sets attribute', () => {
      render('class-two', 'class-three')({}, fragment);
      expect(fragment.children[0].getAttribute('class')).toBe('class-one class-two class-three');
    });

    it('does not set undefined value', () => {
      render()({}, fragment);
      expect(fragment.children[0].getAttribute('class')).toBe('class-one  ');
    });

    it('clears attribute', () => {
      render('class-two', 'class-three', 'some text')({}, fragment);
      render('', '', 'some text')(fragment);
      expect(fragment.children[0].getAttribute('class')).toBe('class-one  ');
    });
  });

  describe('attribute expression with non existing property', () => {
    const render = value => html`<div text-property="${value}"></div>`;

    beforeEach(() => render('value')(fragment));

    it('sets attribute', () => {
      expect(fragment.children[0].getAttribute('text-property')).toBe('value');
    });

    it('removes property', () => {
      render(false)(fragment);
      expect(fragment.children[0].hasAttribute('text-property')).toBe(false);
    });

    it('re-creates property', () => {
      render(false)(fragment);
      render(true)(fragment);
      expect(fragment.children[0].hasAttribute('text-property')).toBe(true);
      expect(fragment.children[0].getAttribute('text-property')).toBe('');
    });

    it('does not update attribute with the same value', () => {
      const spy = spyOn(fragment.children[0], 'setAttribute');
      render('value')(fragment);
      expect(spy).toHaveBeenCalledTimes(0);
    });
  });

  describe('attribute expression with existing property', () => {
    it('sets input properties', () => {
      html`<input type="checkbox" checked  =  "  ${true}  " value = ${'asd'} />`(fragment);
      expect(fragment.children[0].checked).toBe(true);
      expect(fragment.children[0].value).toBe('asd');
    });

    it('sets div hidden property', () => {
      html`<div class="a b c" hidden  =${true} id="asd" />`(fragment);
      expect(fragment.children[0].hidden).toBe(true);
    });

    it('sets property using camelCase name', () => {
      define('test-html-property', {
        customProperty: 0,
      });

      const render = html`
        <test-html-property title=${''} customProperty=${1}>
        </test-html-property>
      `;

      render(fragment);

      expect(fragment.children[0].customProperty).toBe(1);
    });
  });

  describe('class expression attribute', () => {
    const render = classList => html`<div class=${classList}></div>`;
    const hasClass = className => fragment.children[0].classList.contains(className);

    it('sets string value', () => {
      render('class-one')(fragment);
      expect(hasClass('class-one')).toBe(true);
    });

    it('sets array value', () => {
      render(['class-one', 'class-two'])(fragment);
      expect(hasClass('class-one')).toBe(true);
      expect(hasClass('class-two')).toBe(true);
    });

    it('sets object value', () => {
      render({
        'class-one': true,
        'class-two': true,
        'class-three': false,
      })(fragment);

      expect(hasClass('class-one')).toBe(true);
      expect(hasClass('class-two')).toBe(true);
      expect(hasClass('class-three')).toBe(false);
    });

    it('updates values', () => {
      render(['one', 'two', 'three'])(fragment);
      render(['one', 'four'])(fragment);

      expect(hasClass('one')).toBe(true);
      expect(hasClass('two')).toBe(false);
      expect(hasClass('three')).toBe(false);
      expect(hasClass('four')).toBe(true);
    });
  });

  describe('style expression attribute', () => {
    const renderObject = styleList => html`<div style="${styleList}"></div>`;
    const renderAttr = text => html`
      <div style = "color: red; ${text}" asd="<>/">
        <div style="color: red; ${text}"></div>
      </div>
      <div>this is some text with style = " " style=</div>
    `;

    it('throws for invalid expression value', () => {
      expect(() => {
        renderObject(undefined)(fragment);
      }).toThrow();
    });

    it('sets style property', () => {
      renderObject({ backgroundColor: 'red' })(fragment);
      expect(fragment.children[0].style['background-color']).toBe('red');
    });

    it('removes deleted style property', () => {
      renderObject({ backgroundColor: 'red' })(fragment);
      renderObject({ })(fragment);
      expect(fragment.children[0].style['background-color']).toBe('');
    });

    it('removes falsy style property', () => {
      renderObject({ backgroundColor: 'red' })(fragment);
      renderObject({ backgroundColor: '' })(fragment);
      expect(fragment.children[0].style['background-color']).toBe('');
    });

    it('sets attribute', () => {
      renderAttr('background-color: red')(fragment);
      expect(fragment.children[0].style['background-color']).toBe('red');
      expect(fragment.children[0].children[0].style['background-color']).toBe('red');
    });

    it('deos not change text content with "style=" [IE]', () => {
      renderAttr()(fragment);
      expect(fragment.children[1].childNodes[0].textContent)
        .toBe('this is some text with style = " " style=');
    });
  });

  describe('event attribute expression', () => {
    const render = fn => html`<button onclick="${fn}"></button>`;
    const renderWithQuotes = fn => html`<button onclick="${fn}"></button>`;

    const click = () => fragment.children[0].click();
    let spy;

    beforeEach(() => {
      spy = jasmine.createSpy('event callback');
      render(spy)(fragment);
    });

    it('attaches event listener', () => {
      click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('attaches event listener in quotes', () => {
      renderWithQuotes(spy)(fragment);
      click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('detaches event listener', () => {
      render()(fragment);
      click();
      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('replaces event listener', () => {
      click();
      const newSpy = jasmine.createSpy('event callback');
      render(newSpy)(fragment);
      click();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(newSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('text content expression', () => {
    const render = (one, two) => html`
      <style>div { color: red; }</style>
      <div id="text">values: ${one}, ${two}</div>
    `;

    beforeEach(() => render('one', 'two')(fragment));

    it('renders values', () => {
      expect(fragment.querySelector('div').textContent).toBe('values: one, two');
    });

    it('updates values', () => {
      render('two', 'one')(fragment);
      expect(fragment.querySelector('div').textContent).toBe('values: two, one');
    });

    it('removes values', () => {
      render(false, null)(fragment);

      expect(fragment.querySelector('div').textContent).toBe('values: , ');
    });
  });

  describe('template content expression', () => {
    const render = flag => html`
      <div>value: ${flag && html`<span>${'one'}</span>`}</div>
    `;

    beforeEach(() => render(true)({}, fragment));

    it('renders template', () => {
      expect(fragment.children[0].children[0].outerHTML).toBe('<span>one</span>');
    });

    it('removes template', () => {
      render(false)(fragment);
      expect(fragment.children[0].children.length).toBe(0);
    });
  });

  describe('flat array content expression with primitive values', () => {
    const render = items => html`${items}`;

    beforeEach(() => { render([1, 2, 3])(fragment); });

    it('renders an array', () => {
      expect(fragment.innerHTML).toBe('123');
    });

    it('removes an array', () => {
      render([])(fragment);
      expect(fragment.innerHTML).toBe('');
    });

    it('re-order an array', () => {
      render([3, 1, 2])(fragment);
      expect(fragment.innerHTML).toBe('312');
    });
  });

  describe('flat array content expression', () => {
    const render = items => html`  ${items && items.map(v => html`  <span>${v}</span>  `.key(v))}  `;

    beforeEach(() => {
      render([1, 2, 3])(fragment);
    });

    it('renders an array', () => {
      expect(getArrayValues(fragment)).toEqual(['1', '2', '3']);
    });

    it('removes an array', () => {
      render(false)(fragment);

      expect(fragment.childNodes.length).toBe(3);
      expect(getArrayValues(fragment)).toEqual([]);
    });

    it('empties an array', () => {
      render([])(fragment);

      expect(fragment.childNodes.length).toBe(3);
      expect(fragment.children.length).toBe(0);
      expect(getArrayValues(fragment)).toEqual([]);
    });

    it('re-renders an array', () => {
      const itemEl = fragment.children[0];

      render([1, 2, 3, 4])(fragment);
      expect(fragment.children[0]).toBe(itemEl);
      expect(getArrayValues(fragment)).toEqual(['1', '2', '3', '4']);
    });

    it('pops an array', () => {
      render([1, 2])(fragment);
      expect(getArrayValues(fragment)).toEqual(['1', '2']);
    });

    it('moves items of an array', () => {
      render([3, 1, 2])(fragment);
      expect(getArrayValues(fragment)).toEqual(['3', '1', '2']);
    });

    it('reverses an array', () => {
      const firstItem = fragment.children[0];
      render([4, 2, 1])(fragment);

      expect(getArrayValues(fragment)).toEqual(['4', '2', '1']);
      expect(fragment.children[2]).toBe(firstItem);
    });

    it('throws for duplicated id from key helper method', () => {
      expect(() => {
        html`${[1, 2, 3].map(() => html``.key(1))}`(fragment);
      }).toThrow();
    });
  });

  describe('nested array content expression', () => {
    const renderItem = item => html`<span>${item}</span>`.key(item);
    const renderArray = array => html`${array.map(renderItem)}`.key(array.join(''));
    const render = items => html`${items && items.map(renderArray)} static value`;

    beforeEach(() => {
      render([[1, 2, 3], [4, 5, 6], [7]])(fragment);
    });

    it('renders a nested array', () => {
      expect(getArrayValues(fragment)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    });

    it('removes a nested array', () => {
      render(false)(fragment);
      expect(fragment.lastChild.textContent).toBe(' static value');
    });

    it('pops a nested array', () => {
      render([[1, 2, 3], [4, 5, 6]])(fragment);
      expect(getArrayValues(fragment)).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    it('shifts a nested array', () => {
      render([[4, 5, 6], [7]])(fragment);
      expect(getArrayValues(fragment)).toEqual(['4', '5', '6', '7']);
    });

    it('unshift a nested array', () => {
      render([[0, 1, 2], [1, 2, 3], [4, 5, 6], [7]])(fragment);
      expect(getArrayValues(fragment)).toEqual(['0', '1', '2', '1', '2', '3', '4', '5', '6', '7']);
    });

    it('moves nested array', () => {
      render([[7], [4, 5, 6], [1, 2, 3]])(fragment);
      expect(getArrayValues(fragment)).toEqual(['7', '4', '5', '6', '1', '2', '3']);
    });

    it('re-uses nested array values', () => {
      const item = fragment.children[3];
      render([[4, 5, 6], [7]])(fragment);
      expect(fragment.children[0]).toBe(item);
    });
  });

  describe('multiple nested array content expression', () => {
    const render = array => html`${array.map((item) => {
      if (Array.isArray(item)) {
        return render(item);
      }
      return html`<span>${item}</span>`.key(item);
    })}`.key(array.join());

    beforeEach(() => {
      render([1, 2, [3, 4, [5, 6, [7, 8]]]])(fragment);
    });

    it('renders multiple nested arrays', () => {
      expect(getArrayValues(fragment)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    });

    it('updates multiple nested arrays', () => {
      render([1, 2, [3, 4, 10, [[7, 8], 5, 1, 6]]])(fragment);
      expect(getArrayValues(fragment))
        .toEqual(['1', '2', '3', '4', '10', '7', '8', '5', '1', '6']);
    });
  });

  describe('table', () => {
    it('should render table with rows', () => {
      const renderRow = v => html`<tr><td>${v}</td></tr>`.key(v);
      const renderTable = html`
        <table>${[1, 2].map(v => renderRow(v))} ${[3, 4].map(v => renderRow(v))}</table>`;

      renderTable({}, fragment);
      expect(fragment.children[0].outerHTML).toBe('<table><tr><td>1</td></tr><tr><td>2</td></tr> <tr><td>3</td></tr><tr><td>4</td></tr></table>');
    });
  });

  describe('resolve method', () => {
    const render = (promise, value, placeholder) => html`
      ${html.resolve(promise.then(() => html`<div>${value}</div>`), placeholder)}`;

    it('reuses DOM element', (done) => {
      const promise = Promise.resolve();
      render(promise, 'one')(fragment);

      setTimeout(() => {
        const el = fragment.children[0];

        render(promise, 'two')(fragment);

        setTimeout(() => {
          expect(fragment.children[0].textContent).toBe('two');
          expect(fragment.children[0]).toBe(el);
          done();
        }, 100);
      }, 100);
    });

    it('shows placeholder after delay', (done) => {
      render(
        new Promise(resolve => setTimeout(resolve, 500)),
        'value',
        html`<div>loading...</div>`,
      )(fragment);

      setTimeout(() => {
        expect(fragment.children[0].textContent).toBe('loading...');

        setTimeout(() => {
          expect(fragment.children[0].textContent).toBe('value');
          done();
        }, 250);
      }, 300);
    });

    it('cancel render previous value', (done) => {
      render(Promise.resolve(), 'one', html`<div>loading...</div>`)(fragment);
      render(Promise.resolve(), 'two')(fragment);

      requestAnimationFrame(() => {
        expect(fragment.children[0].textContent).toBe('two');
        done();
      });
    });
  });

  describe('shadyCSS polyfill', () => {
    const shadyCSSApplied = typeof window.ShadyCSS === 'object';

    beforeAll(() => {
      if (!shadyCSSApplied) {
        window.ShadyCSS = {
          prepareTemplate: template => template,
        };
      }
    });

    afterAll(() => {
      if (!shadyCSSApplied) {
        delete window.ShadyCSS;
      }
    });

    const render = () => html`
      <div>text</div>
      <style>
        div {
          color: red;
        }
      </style>
    `;

    it('applies CSS scope', () => {
      const one = document.createElement('custom-element-one');
      const two = document.createElement('custom-element-two');
      const globalElement = document.createElement('div');

      one.attachShadow({ mode: 'open' });
      two.attachShadow({ mode: 'open' });

      render()(one, one.shadowRoot);
      // run second time to check if prepare template is not called twice
      render()(one, one.shadowRoot);

      render()(two, two.shadowRoot);

      document.body.appendChild(one);
      document.body.appendChild(two);
      document.body.appendChild(globalElement);

      expect(getComputedStyle(one.shadowRoot.children[0]).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(two.shadowRoot.children[0]).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(globalElement).color).toBe('rgb(0, 0, 0)');

      document.body.removeChild(one);
      document.body.removeChild(two);
      document.body.removeChild(globalElement);
    });
  });

  describe('use external element with shadowRoot', () => {
    class TestExternalElement extends HTMLBridge {
      constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
          <div>test</div>
          <slot></slot>
        `;
      }
    }

    const render = value => html`<test-external-element>${value}</test-external-element>`
      .define({ TestExternalElement });

    it('renders external element with slotted value', (done) => {
      const el = document.createElement('div');
      el.attachShadow({ mode: 'open' });

      document.body.appendChild(el);

      render(0)(el, el.shadowRoot);

      setTimeout(() => {
        expect(el.shadowRoot.children[0].innerHTML).toBe('0');
        document.body.removeChild(el);
        done();
      }, 100);
    });
  });
});
