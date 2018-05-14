import { svg } from '../../src/html';

describe('svg:', () => {
  let fragment;

  beforeEach(() => {
    fragment = document.createElement('div');
  });

  const render = (value = 0) => svg`
    <circle r="${value}" cx="0" cy="0" fill="#000"></circle>
  `;

  it('should use SVG namespace elements', () => {
    render()(fragment);
    expect(fragment.children[0] instanceof SVGElement).toBe(true);
  });

  it('should update attribute', () => {
    render()(fragment);
    render(10)(fragment);

    expect(fragment.children[0].getAttribute('r')).toBe('10');
  });
});
