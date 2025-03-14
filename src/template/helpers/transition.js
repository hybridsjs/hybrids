import { stringifyElement } from "../../utils.js";

export default (globalThis.document &&
  globalThis.document.startViewTransition !== undefined &&
  function transition(template) {
    return async function fn(host, target) {
      template.useLayout = fn.useLayout;

      if (transition.instance) {
        console.warn(
          `${stringifyElement(host)}: view transition already in progress`,
        );

        transition.instance.finished.finally(() => {
          template(host, target);
        });

        return;
      }

      transition.instance = globalThis.document.startViewTransition(() => {
        template(host, target);
      });

      transition.instance.finished.finally(() => {
        transition.instance = undefined;
      });
    };
  }) ||
  // istanbul ignore next
  ((fn) => fn);
