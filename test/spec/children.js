import define from '../../src/define';
import children from '../../src/children';

describe('children:', () => {
  const child = {
    customName: '',
  };

  define('test-children-child', child);

  define('test-children-direct', {
    direct: children(child),
    deep: children(child, { deep: true }),
    nested: children(child, { deep: true, nested: true }),
  });

  const tree = test(`
    <test-children-direct>
      <test-children-child custom-name="one">
        <test-children-child custom-name="five"></test-children-child>
      </test-children-child>
      <test-children-child custom-name="two"></test-children-child>
      <div>
        <test-children-child custom-name="three"></test-children-child>
      </div>
    </test-children-direct>
  `);

  describe('direct children', () => {
    it('returns list', () => tree((el) => {
      expect(el.direct).toEqual([
        el.children[0],
        el.children[1],
      ]);
    }));

    it('removes item from list', done => tree((el) => {
      el.removeChild(el.children[1]);

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: 'one' }),
          ]);
          done();
          resolve();
        });
      });
    }));

    it('adds item to list', done => tree((el) => {
      const newItem = document.createElement('test-children-child');
      newItem.customName = 'four';

      el.appendChild(newItem);

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: 'one' }),
            jasmine.objectContaining({ customName: 'two' }),
            jasmine.objectContaining({ customName: 'four' }),
          ]);
          done();
          resolve();
        });
      });
    }));

    it('reorder list items', done => tree((el) => {
      el.insertBefore(el.children[1], el.children[0]);

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: 'two' }),
            jasmine.objectContaining({ customName: 'one' }),
          ]);
          done();
          resolve();
        });
      });
    }));
  });

  describe('deep children', () => {
    it('returns item list', () => tree((el) => {
      expect(el.deep).toEqual([
        jasmine.objectContaining({ customName: 'one' }),
        jasmine.objectContaining({ customName: 'two' }),
        jasmine.objectContaining({ customName: 'three' }),
      ]);
    }));

    it('removes item from list', done => tree((el) => {
      el.children[2].innerHTML = '';

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: 'one' }),
            jasmine.objectContaining({ customName: 'two' }),
          ]);
          done();
          resolve();
        });
      });
    }));
  });

  describe('nested children', () => {
    it('returns item list', () => tree((el) => {
      expect(el.nested).toEqual([
        jasmine.objectContaining({ customName: 'one' }),
        jasmine.objectContaining({ customName: 'five' }),
        jasmine.objectContaining({ customName: 'two' }),
        jasmine.objectContaining({ customName: 'three' }),
      ]);
    }));

    it('removes item from list', done => tree((el) => {
      el.children[0].innerHTML = '';

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.nested).toEqual([
            jasmine.objectContaining({ customName: 'one' }),
            jasmine.objectContaining({ customName: 'two' }),
            jasmine.objectContaining({ customName: 'three' }),
          ]);
          done();
          resolve();
        });
      });
    }));
  });
});
