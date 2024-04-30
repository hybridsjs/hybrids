export default {
  render: () => html`
    <section>simple text</section>
    <section>${condition ? msg`a` : msg`b`}</section>
    <section>${condition ? msg`${1} a` : msg`${1} b`}</section>
  `,
};
