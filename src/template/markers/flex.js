export default function flex({ node }, propName) {
  const style = node.style;

  return (value) => {
    let applyStyle;

    switch (propName) {
      case 'flow':
        applyStyle = {
          display: 'flex',
          flexFlow: value,
        };
        break;
      case 'align': {
        const [justifyContent, alignItems = justifyContent] = value.split(' ');
        applyStyle = {
          justifyContent,
          alignItems,
        };
        break;
      }

      case 'grow':
      case 'shrink':
      case 'base':
        applyStyle = { [`flex-${propName}`]: value };
        break;

      default: return;
    }

    Object.assign(style, applyStyle);
  };
}
