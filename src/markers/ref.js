export default function ref({ node, expr }) {
  Promise.resolve().then(() => (expr.set(node)));
}
