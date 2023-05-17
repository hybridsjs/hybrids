import global from "../../global.js";
import { deferred, stringifyElement } from "../../utils.js";

let instance;
export default (global.document &&
  global.document.startViewTransition !== undefined &&
  function transition(template) {
    return function fn(host, target) {
      if (instance) {
        console.warn(
          `${stringifyElement(
            host,
          )}: view transition already started in ${stringifyElement(instance)}`,
        );
        template(host, target);
        return;
      }

      template.useLayout = fn.useLayout;
      instance = host;

      global.document.startViewTransition(() => {
        template(host, target);

        return deferred.then(() => {
          instance = undefined;
        });
      });
    };
  }) ||
  // istanbul ignore next
  ((fn) => fn);
