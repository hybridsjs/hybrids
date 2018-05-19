import define from '../../src/define';
import { update } from '../../src/render';

describe('render:', () => {
  const resolveRender = fn => new Promise((resolve) => {
    requestAnimationFrame(() => {
      Promise.resolve()
        .then(fn)
        .then(resolve);
    });
  });

  define('test-render', {
    value: 0,
    property: '',
    render: ({ value }) => (host, shadowRoot) => {
      shadowRoot.innerHTML = `<div>${value}</div>`;
    },
  });

  const tree = test(`
    <test-render></test-render>
  `);

  it('throws if an argument is not a function', () => {
    expect(() => {
      define('test-render-throws', {
        render: {},
      });
    }).toThrow();
  });

  it('renders content', done => tree(el => resolveRender(() => {
    expect(el.shadowRoot.children[0].textContent).toBe('0');
    done();
  })));

  it('updates content', done => tree(el => resolveRender(() => {
    el.value = 1;
    return resolveRender(() => {
      expect(el.shadowRoot.children[0].textContent).toBe('1');
      done();
    });
  })));

  it('does not render when element is out of the document', done => tree((el) => {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(el);

    return resolveRender(() => {
      expect(el.shadowRoot.innerHTML).toBe('');
      done();
    });
  }));

  it('does not render if getter does not change', done => tree(el => resolveRender(() => {
    el.property = 'new value';
    return resolveRender(() => {
      expect(el.shadowRoot.children[0].textContent).toBe('0');
      done();
    });
  })));

  it('renders content on direct call', () => tree((el) => {
    el.render();
    expect(el.shadowRoot.children[0].textContent).toBe('0');
  }));

  it('does not re-create shadow DOM', done => tree((el) => {
    const shadowRoot = el.shadowRoot;
    const parent = el.parentElement;
    parent.removeChild(el);

    return resolveRender(() => {
      parent.appendChild(el);
      expect(el.shadowRoot).toBe(shadowRoot);
      done();
    });
  }));

  it('defer next update tasks after threshold', (done) => {
    define('test-render-long', {
      value: '',
      render: ({ value }) => (host, shadowRoot) => {
        let count = 1000000000;
        while (count) { count -= 1; }
        shadowRoot.innerHTML = `<div>${value}</div>`;
      },
    });

    test(`
      <div>
        <test-render-long value="one"></test-render-long>
        <test-render-long value="two"></test-render-long>
      </div>
    `)(el => resolveRender(() => {
      const [one, two] = el.children;
      expect(one.shadowRoot.children[0].textContent).toBe('one');
      expect(two.shadowRoot.children.length).toBe(0);

      return resolveRender(() => {
        expect(two.shadowRoot.children[0].textContent).toBe('two');
        done();
      });
    }));
  });

  it('update function catches error inside of the passed function', (done) => {
    define('test-render-throws-in-render', {
      render: () => {
        throw Error();
      },
    });

    test('<test-render-throws-in-render></test-render-throws-in-render>')((el) => {
      expect(() => {
        const set = new Set();
        set.add(el);
        update(set.values());
      }).toThrow();
      requestAnimationFrame(done);
    });
  });

  it('update function catches error inside of the passed function', (done) => {
    define('test-render-throws-in-callback', {
      render: () => () => { throw Error('example error'); },
    });

    test('<test-render-throws-in-callback></test-render-throws-in-callback>')((el) => {
      const set = new Set();
      set.add(el);
      update(set.values()).catch((e) => {
        expect(e instanceof Error).toBe(true);
        done();
      });
    });
  });
});
