import Template from '../../../src/template/template';
import { TEMPLATE_PREFIX as T } from '../../../src/template/parser';

describe('Template:', () => {
  describe('parse -', () => {
    it('interpolates text to span', () => {
      const template = new Template('{{ something }}');
      expect(template.container.t[0].e.content.childNodes[0].tagName.toLowerCase()).toEqual('span');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['something', 'textContent']] }));
    });

    it('interpolates multiple text to spans', () => {
      const template = new Template('{{ something }} {{ else }}');
      expect(template.container.t[0].e.content.childNodes[0].tagName.toLowerCase()).toEqual('span');
      expect(template.container.t[0].e.content.childNodes[2].tagName.toLowerCase()).toEqual('span');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['something', 'textContent']] }));
      expect(template.container.t[0].m[1][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['else', 'textContent']] }));
    });

    it('interpolates text to node [text-content] property marker', () => {
      const template = new Template(
        `<div some="value" other-thing="val">
          {{ something }}
        </div>`,
      );
      const div = template.container.t[0].e.content.childNodes[0];
      expect(div.tagName.toLowerCase()).toEqual('div');
      expect(div.hasAttribute('prop:text-content')).toEqual(true);
      expect(div.getAttribute('some')).toEqual('value');
      expect(div.getAttribute('other-thing')).toEqual('val');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['something', 'textContent']] }));
    });

    it('interpolates template prefix to template marker', () => {
      const template = new Template(`<div ${T}marker:="something"></div>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'marker', p: [['something']] }));
      expect(template.container.t[1].e.content.childNodes[0].outerHTML).toEqual('<div></div>');
    });

    it('template to comment', () => {
      const template = new Template('<template marker:="something"></template>');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'marker', p: [['something']] }));
      expect(template.container.t[0].e.content.childNodes[0] instanceof Comment).toEqual(true);
    });

    it('expression only', () => {
      const template = new Template('<span props:="something"></span>');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'props', p: [['something']] }));
    });

    it('expression with one argument', () => {
      const template = new Template('<span props:="one: something"></span>');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'props', p: [['something', 'one']] }));
    });

    it('expression with multiple arguments', () => {
      const template = new Template('<span props:="one, two: something"></span>');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'props', p: [['something', 'one', 'two']] }));
    });

    it('multiple filters', () => {
      const template = new Template('<span props:="something | fil1: one, two | fil2: 2, 3 | fil3 "></span>');
      expect(template.container.t[0].m[0][0]).toEqual(
        jasmine.objectContaining({ m: 'props', p: [['something'], ['fil1', 'one', 'two'], ['fil2', '2', '3'], ['fil3']] },
        ));
    });
  });

  it('constructs from template element', () => {
    const tempEl = document.createElement('template');
    tempEl.innerHTML = '<span props:="something"></span>';

    const template = new Template(tempEl);
    expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'props', p: [['something']] }));
  });

  it('constructs from exprted JSON', () => {
    const input = `
      <style></style>
      <div marker:="one"></div>
      <template><span marker:="two"></span></template>
      test
    `;
    const template = new Template(input);
    const copy = new Template(template.export());

    expect(copy.container.t[0].e.innerHTML).toEqual(template.container.t[0].e.innerHTML);
  });

  describe('mount and compile -', () => {
    let marker;
    let fragment;

    beforeEach(() => {
      marker = jasmine.createSpy('marker');
      fragment = document.createElement('div');
    });

    it('compile markers', () => {
      const template = new Template(`
        <!-- this is comment -->
        <span id="one" marker:="one"></span>
        <span id="two" marker:="val1, val2: two | filter"></span>
      `, { markers: { marker }, filters: { filter(val) { return val; } } });

      template.mount(fragment, { one: 'test 1', two: 'test 2' });

      expect(marker).toHaveBeenCalled();
      expect(marker.calls.count()).toEqual(2);

      expect(marker.calls.argsFor(0)[0].node).toEqual(fragment.querySelector('#one'));
      expect(marker.calls.argsFor(0)[0].expr.get()).toEqual('test 1');
      expect(marker.calls.argsFor(0)[1]).not.toBeDefined();

      expect(marker.calls.argsFor(1)[0].node).toEqual(fragment.querySelector('#two'));
      expect(marker.calls.argsFor(1)[0].expr.get()).toEqual('test 2');
      expect(marker.calls.argsFor(1)[1]).toEqual('val1');
      expect(marker.calls.argsFor(1)[2]).toEqual('val2');
    });

    it('uses empty marker', () => {
      const template = new Template('<span :test="something"></span>', {
        markers: { '': marker },
      });

      template.mount(fragment, { something: 'one' });
      expect(marker).toHaveBeenCalled();
    });

    it('nested template with id', () => {
      const template = new Template(
        `<span marker:="one"></span>
        <template><span marker:="val1:val2:two"></span></template>`
        , { markers: { marker } });

      const result = template.compile(1);
      expect(result.childNodes[0].outerHTML).toEqual('<span marker:="val1:val2:two"></span>');
    });

    it('nested template with reference', () => {
      const template = new Template(
        `<span marker:="one"></span>
        <template><span marker:="val1:val2:two"></span></template>`
        , { markers: { marker } });

      const parent = template.compile();
      const child = template.compile(parent.childNodes[2]);

      expect(child.childNodes[0].outerHTML).toEqual('<span marker:="val1:val2:two"></span>');
    });

    it('throws for missing marker', () => {
      const template = new Template('<span undefined:="something"></span>');
      expect(() => template.compile()).toThrow();
    });

    it('throws for missing template', () => {
      const template = new Template('<span></span>');
      expect(() => template.compile(1)).toThrow();
    });

    it('run markers', (done) => {
      const template = new Template(`
        <span marker:="one"></span>
      `, { markers: { marker() { return marker; } } });

      const render = template.mount(fragment, { one: 'test' });
      render();

      global.requestAnimationFrame(() => {
        expect(marker).toHaveBeenCalled();
        done();
      });
    });
  });
});
