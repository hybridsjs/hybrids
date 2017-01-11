import Template, {
  MARKER_PREFIX as M, PROPERTY_PREFIX as P, EVENT_PREFIX as E, TEMPLATE_PREFIX as T
} from '../src/template';
import { getOwnLocals, LOCALS_PREFIX as L } from '../src/expression';

describe('Engine | Template -', () => {
  describe('parse', () => {
    it('interpolate property', () => {
      const template = new Template(`<span ${P}text-content="something" title=""></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['something', 'textContent']] }));
    });

    it('interpolate event', () => {
      const template = new Template(`<span ${E}some-event="something" title=""></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'on', p: [['something', 'some-event']] }));
    });

    it('interpolate property without value', () => {
      const template = new Template(`<span ${P}user title=""></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['user', 'user']] }));
    });

    it('interpolate text to span', () => {
      const template = new Template('{{ something }}');
      expect(template.container.t[0].e.content.childNodes[0].tagName.toLowerCase()).toEqual('span');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['something', 'textContent']] }));
    });

    it('interpolate multiple text to spans', () => {
      const template = new Template('{{ something }} {{ else }}');
      expect(template.container.t[0].e.content.childNodes[0].tagName.toLowerCase()).toEqual('span');
      expect(template.container.t[0].e.content.childNodes[2].tagName.toLowerCase()).toEqual('span');
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['something', 'textContent']] }));
      expect(template.container.t[0].m[1][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['else', 'textContent']] }));
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
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'prop', p: [['something', 'textContent']] }));
    });

    it('interpolate template prefix to template marker', () => {
      const template = new Template(`<div ${T}marker="something"></div>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'marker', p: [['something']] }));
      expect(template.container.t[1].e.content.childNodes[0].outerHTML).toEqual('<div></div>');
    });

    it('template to comment', () => {
      const template = new Template(`<template ${M}marker="something"></template>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'marker', p: [['something']] }));
      expect(template.container.t[0].e.content.childNodes[0] instanceof Comment).toEqual(true);
    });

    it('expression only', () => {
      const template = new Template(`<span ${M}props="something"></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'props', p: [['something']] }));
    });

    it('expression with one argument', () => {
      const template = new Template(`<span ${M}props="one: something"></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'props', p: [['something', 'one']] }));
    });

    it('expression with multiple arguments', () => {
      const template = new Template(`<span ${M}props="one, two: something"></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'props', p: [['something', 'one', 'two']] }));
    });

    it('multiple filters', () => {
      const template = new Template(`<span ${M}props="something | fil1: one, two | fil2: 2, 3 | fil3 "></span>`);
      expect(template.container.t[0].m[0][0]).toEqual(
        jasmine.objectContaining({ m: 'props', p: [['something'], ['fil1', 'one', 'two'], ['fil2', '2', '3'], ['fil3']] }
      ));
    });
  });

  it('construct from template element', () => {
    const tempEl = document.createElement('template');
    tempEl.innerHTML = `<span ${M}props="something"></span>`;

    const template = new Template(tempEl);
    expect(template.container.t[0].m[0][0]).toEqual(jasmine.objectContaining({ m: 'props', p: [['something']] }));
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

      expect(marker.calls.argsFor(0)[0].node).toEqual(
        template.container.t[0].e.content.childNodes[3]
      );
      expect(marker.calls.argsFor(0)[0].expr.get()).toEqual('test 1');
      expect(marker.calls.argsFor(0)[1]).not.toBeDefined();

      expect(marker.calls.argsFor(1)[0].node).toEqual(
        template.container.t[0].e.content.childNodes[5]
      );
      expect(marker.calls.argsFor(1)[0].expr.get()).toEqual('test 2');
      expect(marker.calls.argsFor(1)[1]).toEqual('val1');
      expect(marker.calls.argsFor(1)[2]).toEqual('val2');
    });

    it('use property marker', () => {
      const template = new Template(`<span ${P}test="something"></span>`, {
        markers: { prop: marker },
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
      <span ${M}marker="${L}two"></span>
    `, { markers: { marker() { return () => {}; } } });

    const fragment = template.compile({ one: 'test' });
    template.run(fragment, cb);
  });
});
