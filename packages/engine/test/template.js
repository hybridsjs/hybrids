import Template, { MARKER_PREFIX as M, PROPERTY_PREFIX as P } from '../src/template';
import { getOwnLocals } from '../src/expression';
import { WATCHERS, DEFAULT_MARKER } from '../src/symbols';

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

    it('interpolate text', () => {
      const template = new Template('{{ something }}');
      expect(template.container.t[0].c.children[0].tagName.toLowerCase()).toEqual('span');
      expect(template.container.t[0].m[0][0]).toEqual({ m: 0, p: [['something', 'textContent']] });
    });

    it('interpolate template marker', () => {
      const template = new Template(`<div ${M}${M}marker="something"></div>`);
      // expect(template.container.t[0].c.children[0].tagName.toLowerCase()).toEqual('template');
      // expect(template.container.t[0].c.children[0].dataset[T]).toEqual('1');
      expect(template.container.t[0].m[0][0]).toEqual({ m: 'marker', p: [['something']] });
      expect(template.container.t[1].c.children[0].outerHTML).toEqual('<div></div>');
    });

    it('attribute marker', () => {
      const template = new Template(`<span ${M}props="something"></span>`);
      expect(template.container.t[0].m[0][0]).toEqual({ m: 'props', p: [['something']] });
    });

    it('filters', () => {
      const template = new Template(`<span ${M}props="something | fil1:one:two | fil2:2:3 "></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(
        { m: 'props', p: [['something'], ['fil1', 'one', 'two'], ['fil2', '2', '3']] }
      );
    });
  });

  it('construct from exprted JSON', () => {
    const input = `
      <div ${M}marker="one"></div>
      <template><span ${M}marker="two"></span></template>
    `;
    const template = new Template(input);
    const copy = new Template(template.export());

    expect(copy.container.p).toEqual(template.container.p);
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
        <span ${M}marker="val1:val2:two | filter"></span>
      `, { marker }, { filter(val) { return val; } });

      template.compile({ one: 'test 1', two: 'test 2' });

      expect(marker).toHaveBeenCalled();
      expect(marker.calls.count()).toEqual(2);

      expect(marker.calls.argsFor(0)[0]).toEqual(template.container.t[0].c.children[0]);
      expect(marker.calls.argsFor(0)[1].get()).toEqual('test 1');
      expect(marker.calls.argsFor(0)[2]).not.toBeDefined();

      expect(marker.calls.argsFor(1)[0]).toEqual(template.container.t[0].c.children[1]);
      expect(marker.calls.argsFor(1)[1].get()).toEqual('test 2');
      expect(marker.calls.argsFor(1)[2]).toEqual('val1');
      expect(marker.calls.argsFor(1)[3]).toEqual('val2');
    });

    it('use default marker', () => {
      const template = new Template(`<span ${P}test="something"></span>`, {
        [DEFAULT_MARKER]: marker,
      });

      template.compile({ something: 'one' });
      expect(marker).toHaveBeenCalled();
    });

    it('nested template with id', () => {
      const template = new Template(`
        <span ${M}marker="one"></span>
        <template><span ${M}marker="val1:val2:two"></span></template>
      `, { marker });

      const fragment = template.compile({ two: 'test' }, 1);
      expect(fragment.children[0].outerHTML).toEqual(`<span ${M}marker="val1:val2:two"></span>`);
    });

    it('nested template with reference', () => {
      const template = new Template(`
        <span ${M}marker="one"></span>
        <template><span ${M}marker="val1:val2:two"></span></template>
      `, { marker });

      const parent = template.compile({ one: 'test' });
      const child = template.compile({ two: 'test' }, parent.childNodes[3]);

      expect(child.children[0].outerHTML).toEqual(`<span ${M}marker="val1:val2:two"></span>`);
    });

    it('throw for missing marker', () => {
      const template = new Template(`<span ${M}props="something"></span>`);
      expect(() => template.compile({})).toThrow();
    });

    it('throw for missing template', () => {
      const template = new Template(`<span ${M}props="something"></span>`);
      expect(() => template.compile({}, 1)).toThrow();
    });

    it('adds watcher', () => {
      const watcher = () => {};
      const template = new Template(`<span ${M}marker="one"></span>`, { marker() { return watcher; } });

      const fragment = template.compile({ one: 'test' });
      expect([...fragment.children[0][WATCHERS]][0].fn).toEqual(watcher);
    });

    it('set locals', () => {
      const template = new Template(`<span ${M}marker="something"></span>`, { marker() {} });
      const fragment = template.compile({ something: 'test' }, 0, { localValue: 'test' });

      expect(getOwnLocals(fragment.children[0])).toEqual({ localValue: 'test' });
    });
  });

  it('run calls watchers', () => {
    const cb = jasmine.createSpy('callback');
    const template = new Template(`
      <span ${M}marker="one"></span>
      <span ${M}marker="@two"></span>
    `, { marker() { return () => {}; } });

    const fragment = template.compile({ one: 'test' });
    template.run(fragment, cb);
  });
});
