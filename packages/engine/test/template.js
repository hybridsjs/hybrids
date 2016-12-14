import Template, { MARKER_PREFIX as M, PROPERTY_PREFIX as P } from '../src/template';
import { getOwnLocals } from '../src/expression';
import { WATCHERS, PROPERTY_MARKER } from '../src/symbols';

describe('Engine | Template -', () => {
  describe('parse', () => {
    it('interpolate property', () => {
      const template = new Template(`<span ${P}text-content="something" title=""></span>`);
      expect(template.container.t[0].m[0][0]).toEqual({ m: 0, p: [['something', 'textContent']] });
    });

    it('interpolate property without value', () => {
      const template = new Template(`<span ${P}user title=""></span>`);
      expect(template.container.t[0].m[0][0]).toEqual({ m: 0, p: [['user', 'user']] });
    });

    it('interpolate text to span', () => {
      const template = new Template('{{ something }}');
      expect(template.container.t[0].e.content.childNodes[0].tagName.toLowerCase()).toEqual('span');
      expect(template.container.t[0].m[0][0]).toEqual({ m: 0, p: [['something', 'textContent']] });
    });

    it('interpolate text to node [text-content] property marker', () => {
      const template = new Template(
        `<div some="value" other-thing="val">
          {{ something }}
        </div>`
      );
      const div = template.container.t[0].e.content.childNodes[0];
      expect(div.tagName.toLowerCase()).toEqual('div');
      expect(div.hasAttribute(`${P}text-content`)).toEqual(true);
      expect(div.getAttribute('some')).toEqual('value');
      expect(div.getAttribute('other-thing')).toEqual('val');
      expect(template.container.t[0].m[0][0]).toEqual({ m: 0, p: [['something', 'textContent']] });
    });

    it('throw for conflict text interpolation', () => {
      expect(() => new Template(`
        <div some="value" other-thing="val" ${P}text-content="other">{{ something }}</div>
      `)).toThrow();
    });

    it('interpolate template marker', () => {
      const template = new Template(`<div ${M}${M}marker="something"></div>`);
      expect(template.container.t[0].m[0][0]).toEqual({ m: 'marker', p: [['something']] });
      expect(template.container.t[1].e.content.childNodes[0].outerHTML).toEqual('<div></div>');
    });

    it('expression only', () => {
      const template = new Template(`<span ${M}props="something"></span>`);
      expect(template.container.t[0].m[0][0]).toEqual({ m: 'props', p: [['something']] });
    });

    it('expression with one argument', () => {
      const template = new Template(`<span ${M}props="one: something"></span>`);
      expect(template.container.t[0].m[0][0]).toEqual({ m: 'props', p: [['something', 'one']] });
    });

    it('expression with multiple arguments', () => {
      const template = new Template(`<span ${M}props="one, two: something"></span>`);
      expect(template.container.t[0].m[0][0]).toEqual({ m: 'props', p: [['something', 'one', 'two']] });
    });

    it('multiple filters', () => {
      const template = new Template(`<span ${M}props="something | fil1: one, two | fil2: 2, 3 | fil3 "></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(
        { m: 'props', p: [['something'], ['fil1', 'one', 'two'], ['fil2', '2', '3'], ['fil3']] }
      );
    });
  });

  it('construct from template element', () => {
    const tempEl = document.createElement('template');
    tempEl.innerHTML = `<span ${M}props="something"></span>`;

    const template = new Template(tempEl);
    expect(template.container.t[0].m[0][0]).toEqual({ m: 'props', p: [['something']] });
  });

  it('construct from exprted JSON', () => {
    const input = `
      <style></style>
      <div ${M}marker="one"></div>
      <template><span ${M}marker="two"></span></template>
      test
    `;
    const template = new Template(input);
    const copy = new Template(template.export());

    expect(copy.container.t[0].e.innerHTML).toEqual(template.container.t[0].e.innerHTML);
  });

  describe('compile', () => {
    let marker;

    beforeEach(() => {
      marker = jasmine.createSpy('marker');
    });

    it('run markers', () => {
      const template = new Template(`
        <!-- this is comment -->
        <span ${M}marker="one"></span>
        <span ${M}marker="val1, val2: two | filter"></span>
      `, { markers: { marker }, filters: { filter(val) { return val; } } });

      template.compile({ one: 'test 1', two: 'test 2' });

      expect(marker).toHaveBeenCalled();
      expect(marker.calls.count()).toEqual(2);

      expect(marker.calls.argsFor(0)[0]).toEqual(template.container.t[0].e.content.childNodes[3]);
      expect(marker.calls.argsFor(0)[1].get()).toEqual('test 1');
      expect(marker.calls.argsFor(0)[2]).not.toBeDefined();

      expect(marker.calls.argsFor(1)[0]).toEqual(template.container.t[0].e.content.childNodes[5]);
      expect(marker.calls.argsFor(1)[1].get()).toEqual('test 2');
      expect(marker.calls.argsFor(1)[2]).toEqual('val1');
      expect(marker.calls.argsFor(1)[3]).toEqual('val2');
    });

    it('use property marker', () => {
      const template = new Template(`<span ${P}test="something"></span>`, {
        markers: { [PROPERTY_MARKER]: marker },
      });

      template.compile({ something: 'one' });
      expect(marker).toHaveBeenCalled();
    });

    it('nested template with id', () => {
      const template = new Template(
        `<span ${M}marker="one"></span>
        <template><span ${M}marker="val1:val2:two"></span></template>`
      , { markers: { marker } });

      const fragment = template.compile({ two: 'test' }, 1);
      expect(fragment.childNodes[0].outerHTML).toEqual(`<span ${M}marker="val1:val2:two"></span>`);
    });

    it('nested template with reference', () => {
      const template = new Template(
        `<span ${M}marker="one"></span>
        <template><span ${M}marker="val1:val2:two"></span></template>`
      , { markers: { marker } });

      const parent = template.compile({ one: 'test' });
      const child = template.compile({ two: 'test' }, parent.childNodes[2]);

      expect(child.childNodes[0].outerHTML).toEqual(`<span ${M}marker="val1:val2:two"></span>`);
    });

    it('throw for missing marker', () => {
      const template = new Template(`<span ${M}props="something"></span>`);
      expect(() => template.compile({})).toThrow();
    });

    it('throw for missing template', () => {
      const template = new Template(`<span ${M}props="something"></span>`);
      expect(() => template.compile({}, 1)).toThrow();
    });

    it('add watcher', () => {
      const watcher = () => {};
      const template = new Template(`<span ${M}marker="one"></span>`, {
        markers: { marker() { return watcher; } }
      });

      const fragment = template.compile({ one: 'test' });
      expect([...fragment.childNodes[0][WATCHERS]][0].fn).toEqual(watcher);
    });

    it('set locals', () => {
      const template = new Template(`<span ${M}marker="something"></span>`, {
        markers: { marker() {} },
      });
      const fragment = template.compile({ something: 'test' }, 0, { localValue: 'test' });

      expect(getOwnLocals(fragment.childNodes[0])).toEqual({ localValue: 'test' });
    });
  });

  it('run watchers', () => {
    const cb = jasmine.createSpy('callback');
    const template = new Template(`
      <span ${M}marker="one"></span>
      <span ${M}marker="@two"></span>
    `, { markers: { marker() { return () => {}; } } });

    const fragment = template.compile({ one: 'test' });
    template.run(fragment, cb);
  });
});
