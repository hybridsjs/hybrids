import { NestedEnumerable } from "../.internals/nested-enumerable/nested-enumerable.store";
import { Enumerable } from "../.internals/enumerable/enumerable.store";
import { Singleton } from "../.internals/singleton/singleton.store";
import { store } from "/types";
import { IEnumerable } from "../.internals/enumerable/enumerable.entity";
import { ISingleton } from "../.internals/singleton/singleton.entity";

const nestedEnumerable = store.sync(NestedEnumerable, { id: "1" });
const enumerable = store.sync(Enumerable, { id: "1" });
const singleton = store.get(Singleton);

let enumerablePromiseInput: Promise<IEnumerable>;
let singletonPromiseInput: Promise<ISingleton>;
let enumerableInput: IEnumerable;
let singletonInput: ISingleton;

const primitives = {
  stringProperty: "qweqwe",
  numberProperty: 123456789,
};
const primitivesInCreateNestedModels = {
  nestedEnumerable: primitives,
  optionalNestedEnumerable: primitives,
  nestedSingleton: primitives,
  optionalNestedSingleton: primitives,
  nestedEnumerables: [primitives, primitives],
};
const primitivesInUpdateNestedModels = {
  nestedEnumerable: { id: "1", ...primitives },
  optionalNestedEnumerable: { id: "1", ...primitives },
  nestedSingleton: { ...primitives },
  optionalNestedSingleton: { ...primitives },
  nestedEnumerables: [
    { id: "1", ...primitives },
    { id: "1", ...primitives },
  ],
};

const empty = {};
const emptyInCreateNestedModels = {
  nestedEnumerable: empty,
  optionalNestedEnumerable: empty,
  nestedSingleton: empty,
  optionalNestedSingleton: empty,
  nestedEnumerables: [empty, empty],
};
const emptyInUpdateNestedModels = {
  nestedEnumerable: { id: "1", ...empty },
  optionalNestedEnumerable: { id: "1", ...empty },
  nestedSingleton: { ...empty },
  optionalNestedSingleton: { ...empty },
  nestedEnumerables: [
    { id: "1", ...empty },
    { id: "1", ...empty },
  ],
};

const refs = {
  nestedSingleton: singleton,
  optionalNestedSingleton: singleton,
  nestedEnumerable: nestedEnumerable,
  optionalNestedEnumerable: nestedEnumerable,
  nestedEnumerables: [nestedEnumerable, nestedEnumerable],
};
const refsInCreateNestedModels = {
  nestedEnumerable: refs,
  optionalNestedEnumerable: refs,
  nestedSingleton: refs,
  optionalNestedSingleton: refs,
  nestedEnumerables: [refs, refs],
};
const refsInUpdateNestedModels = {
  nestedEnumerable: { id: "1", ...refs },
  optionalNestedEnumerable: { id: "1", ...refs },
  nestedSingleton: { ...refs },
  optionalNestedSingleton: { ...refs },
  nestedEnumerables: [
    { id: "1", ...refs },
    { id: "1", ...refs },
  ],
};

const identifiers = {
  nestedSingleton: "1",
  optionalNestedSingleton: "1",
  nestedEnumerable: "1",
  optionalNestedEnumerable: "1",
  nestedEnumerables: ["1", "2"],
};
const identifiersInCreateNestedModels = {
  nestedEnumerable: identifiers,
  optionalNestedEnumerable: identifiers,
  nestedSingleton: identifiers,
  optionalNestedSingleton: identifiers,
  nestedEnumerables: [identifiers, identifiers],
};
const identifiersInUpdateNestedModels = {
  nestedEnumerable: { id: "1", ...identifiers },
  optionalNestedEnumerable: { id: "1", ...identifiers },
  nestedSingleton: { ...identifiers },
  optionalNestedSingleton: { ...identifiers },
  nestedEnumerables: [
    { id: "1", ...identifiers },
    { id: "1", ...identifiers },
  ],
};

const unrefs = {
  nestedSingleton: undefined,
  optionalNestedSingleton: undefined,
  nestedEnumerable: undefined,
  optionalNestedEnumerable: undefined,
  nestedEnumerables: [],
};
const unrefsInCreateNestedModels = {
  nestedEnumerable: unrefs,
  optionalNestedEnumerable: unrefs,
  nestedSingleton: unrefs,
  optionalNestedSingleton: unrefs,
  nestedEnumerables: [unrefs, unrefs],
};
const unrefsInUpdateNestedModels = {
  nestedEnumerable: { id: "1", ...unrefs },
  optionalNestedEnumerable: { id: "1", ...unrefs },
  nestedSingleton: { ...unrefs },
  optionalNestedSingleton: { ...unrefs },
  nestedEnumerables: [
    { id: "1", ...unrefs },
    { id: "1", ...unrefs },
  ],
};

const collisions = {
  nestedSingleton: [{}],
  optionalNestedSingleton: [{}],
  nestedEnumerable: [{}],
  optionalNestedEnumerable: [{}],
  nestedEnumerables: {},
};
const collisionsInCreateNestedModels = {
  nestedEnumerable: collisions,
  optionalNestedEnumerable: collisions,
  nestedSingleton: collisions,
  optionalNestedSingleton: collisions,
  nestedEnumerables: [collisions, collisions],
};
const collisionsInUpdateNestedModels = {
  nestedEnumerable: { id: "1", ...collisions },
  optionalNestedEnumerable: { id: "1", ...collisions },
  nestedSingleton: { ...collisions },
  optionalNestedSingleton: { ...collisions },
  nestedEnumerables: [
    { id: "1", ...collisions },
    { id: "1", ...collisions },
  ],
};

// Overload via Definition
{
  // Create...
  {
    // Create model via Definition
    {
      // ...set primitive propertiers
      enumerablePromiseInput = store.set(Enumerable, primitives);
      enumerableInput = store.sync(Enumerable, primitives);

      // ...use default values
      enumerablePromiseInput = store.set(Enumerable, empty);
      enumerableInput = store.sync(Enumerable, empty);

      // ...binding through refs
      enumerablePromiseInput = store.set(Enumerable, refs);
      enumerableInput = store.sync(Enumerable, refs);

      // ...binding through identifiers
      enumerablePromiseInput = store.set(Enumerable, identifiers);
      enumerableInput = store.sync(Enumerable, identifiers);

      // ...unbinding
      enumerablePromiseInput = store.set(Enumerable, unrefs);
      enumerableInput = store.sync(Enumerable, unrefs);

      // ...check collisions
      /// @ts-expect-error
      store.set(Enumerable, collisions);
      /// @ts-expect-error
      store.sync(Enumerable, collisions);
    }

    // Create model & nested via Definition
    {
      // ...set primitive propertiers
      enumerablePromiseInput = store.set(
        Enumerable,
        primitivesInCreateNestedModels,
      );
      enumerableInput = store.sync(Enumerable, primitivesInCreateNestedModels);

      // ...use default values
      enumerablePromiseInput = store.set(Enumerable, emptyInCreateNestedModels);
      enumerableInput = store.sync(Enumerable, emptyInCreateNestedModels);

      // ...binding through refs
      enumerablePromiseInput = store.set(Enumerable, refsInCreateNestedModels);
      enumerableInput = store.sync(Enumerable, refsInCreateNestedModels);

      // ...binding through identifiers
      enumerablePromiseInput = store.set(
        Enumerable,
        identifiersInCreateNestedModels,
      );
      enumerableInput = store.sync(Enumerable, identifiersInCreateNestedModels);

      // ...unbinding
      enumerablePromiseInput = store.set(
        Enumerable,
        unrefsInCreateNestedModels,
      );
      enumerableInput = store.sync(Enumerable, unrefsInCreateNestedModels);

      // ...check collisions
      /// @ts-expect-error
      enumerablePromiseInput = store.set(
        Enumerable,
        collisionsInCreateNestedModels,
      );
      /// @ts-expect-error
      enumerableInput = store.sync(Enumerable, collisionsInCreateNestedModels);
    }
  }

  // Update...
  {
    // Update model via Definition
    {
      // ...set primitive propertiers
      singletonPromiseInput = store.set(Singleton, primitives);
      singletonInput = store.sync(Singleton, primitives);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...primitives,
      });
      enumerableInput = store.sync(Enumerable, { id: "1", ...primitives });

      // ...use default values
      singletonPromiseInput = store.set(Singleton, empty);
      singletonInput = store.sync(Singleton, empty);
      enumerablePromiseInput = store.set(Enumerable, { id: "1", ...empty });
      enumerableInput = store.sync(Enumerable, { id: "1", ...empty });

      // ...binding through refs
      singletonPromiseInput = store.set(Singleton, refs);
      singletonInput = store.sync(Singleton, refs);
      enumerablePromiseInput = store.set(Enumerable, { id: "1", ...refs });
      enumerableInput = store.sync(Enumerable, { id: "1", ...refs });

      // ...binding through identifiers
      singletonPromiseInput = store.set(Singleton, identifiers);
      singletonInput = store.sync(Singleton, identifiers);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...identifiers,
      });
      enumerableInput = store.sync(Enumerable, { id: "1", ...identifiers });

      // ...unbinding
      singletonPromiseInput = store.set(Singleton, unrefs);
      singletonInput = store.sync(Singleton, unrefs);
      enumerablePromiseInput = store.set(Enumerable, { id: "1", ...unrefs });
      enumerableInput = store.sync(Enumerable, { id: "1", ...unrefs });

      // ...check collisions
      /// @ts-expect-error
      singletonPromiseInput = store.set(Singleton, collisions);
      /// @ts-expect-error
      singletonInput = store.sync(Singleton, collisions);
      /// @ts-expect-error
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...collisions,
      });
      /// @ts-expect-error
      enumerableInput = store.sync(Enumerable, { id: "1", ...collisions });
    }

    // Update model & nested via Definition
    {
      // ...set primitive propertiers
      singletonPromiseInput = store.set(
        Singleton,
        primitivesInUpdateNestedModels,
      );
      singletonInput = store.sync(Singleton, primitivesInUpdateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...primitivesInUpdateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...primitivesInUpdateNestedModels,
      });

      // ...use default values
      singletonPromiseInput = store.set(Singleton, emptyInUpdateNestedModels);
      singletonInput = store.sync(Singleton, emptyInUpdateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...emptyInUpdateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...emptyInUpdateNestedModels,
      });

      // ...binding through refs
      singletonPromiseInput = store.set(Singleton, refsInUpdateNestedModels);
      singletonInput = store.sync(Singleton, refsInUpdateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...refsInUpdateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...refsInUpdateNestedModels,
      });

      // ...binding through identifiers
      singletonPromiseInput = store.set(
        Singleton,
        identifiersInUpdateNestedModels,
      );
      singletonInput = store.sync(Singleton, identifiersInUpdateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...identifiersInUpdateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...identifiersInUpdateNestedModels,
      });

      // ...unbinding
      singletonPromiseInput = store.set(Singleton, unrefsInUpdateNestedModels);
      singletonInput = store.sync(Singleton, unrefsInUpdateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...unrefsInUpdateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...unrefsInUpdateNestedModels,
      });

      // ...check collisions
      /// @ts-expect-error
      singletonPromiseInput = store.set(
        Singleton,
        collisionsInUpdateNestedModels,
      );
      /// @ts-expect-error
      singletonInput = store.sync(Singleton, collisionsInUpdateNestedModels);
      /// @ts-expect-error
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...collisionsInUpdateNestedModels,
      });
      /// @ts-expect-error
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...collisionsInUpdateNestedModels,
      });
    }
  }

  // Delete...
  {
    // Delete model via Definition

    /// @ts-expect-error
    enumerablePromiseInput = store.set(Enumerable, null);
    /// @ts-expect-error
    enumerableInput = store.sync(Enumerable, null);

    singletonPromiseInput = store.set(Singleton, null);
    singletonInput = store.sync(Singleton, null);
  }

  // Mixed...
  {
    // Create model and Update nested via Definition
    {
      // ...set primitive propertiers
      enumerablePromiseInput = store.set(
        Enumerable,
        primitivesInUpdateNestedModels,
      );
      enumerableInput = store.sync(Enumerable, primitivesInUpdateNestedModels);

      // ...use default values
      enumerablePromiseInput = store.set(Enumerable, emptyInUpdateNestedModels);
      enumerableInput = store.sync(Enumerable, emptyInUpdateNestedModels);

      // ...binding through refs
      enumerablePromiseInput = store.set(Enumerable, refsInUpdateNestedModels);
      enumerableInput = store.sync(Enumerable, refsInUpdateNestedModels);

      // ...binding through identifiers
      enumerablePromiseInput = store.set(
        Enumerable,
        identifiersInUpdateNestedModels,
      );
      enumerableInput = store.sync(Enumerable, identifiersInUpdateNestedModels);

      // ...unbinding
      enumerablePromiseInput = store.set(
        Enumerable,
        unrefsInUpdateNestedModels,
      );
      enumerableInput = store.sync(Enumerable, unrefsInUpdateNestedModels);

      // ...check collisions
      /// @ts-expect-error
      enumerablePromiseInput = store.set(
        Enumerable,
        collisionsInUpdateNestedModels,
      );
      /// @ts-expect-error
      enumerableInput = store.sync(Enumerable, collisionsInUpdateNestedModels);
    }

    // Update model and Create nested via Definition
    {
      // ...set primitive propertiers
      singletonPromiseInput = store.set(
        Singleton,
        primitivesInCreateNestedModels,
      );
      singletonInput = store.sync(Singleton, primitivesInCreateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...primitivesInCreateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...primitivesInCreateNestedModels,
      });

      // ...use default values
      singletonPromiseInput = store.set(Singleton, emptyInCreateNestedModels);
      singletonInput = store.sync(Singleton, emptyInCreateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...emptyInCreateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...emptyInCreateNestedModels,
      });

      // ...binding through refs
      singletonPromiseInput = store.set(Singleton, refsInCreateNestedModels);
      singletonInput = store.sync(Singleton, refsInCreateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...refsInCreateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...refsInCreateNestedModels,
      });

      // ...binding through identifiers
      singletonPromiseInput = store.set(
        Singleton,
        identifiersInCreateNestedModels,
      );
      singletonInput = store.sync(Singleton, identifiersInCreateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...identifiersInCreateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...identifiersInCreateNestedModels,
      });

      // ...unbinding
      singletonPromiseInput = store.set(Singleton, unrefsInCreateNestedModels);
      singletonInput = store.sync(Singleton, unrefsInCreateNestedModels);
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...unrefsInCreateNestedModels,
      });
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...unrefsInCreateNestedModels,
      });

      // ...check collisions
      /// @ts-expect-error
      singletonPromiseInput = store.set(
        Singleton,
        collisionsInCreateNestedModels,
      );
      /// @ts-expect-error
      singletonInput = store.sync(Singleton, collisionsInCreateNestedModels);
      /// @ts-expect-error
      enumerablePromiseInput = store.set(Enumerable, {
        id: "1",
        ...collisionsInCreateNestedModels,
      });
      /// @ts-expect-error
      enumerableInput = store.sync(Enumerable, {
        id: "1",
        ...collisionsInCreateNestedModels,
      });
    }
  }
}

// Overload via instance
{
  // Update model via instance
  {
    // ...set primitive propertiers
    singletonPromiseInput = store.set(singleton, primitives);
    singletonInput = store.sync(singleton, primitives);
    enumerablePromiseInput = store.set(enumerable, { id: "1", ...primitives });
    enumerableInput = store.sync(enumerable, { id: "1", ...primitives });

    // ...use default values
    singletonPromiseInput = store.set(singleton, empty);
    singletonInput = store.sync(singleton, empty);
    enumerablePromiseInput = store.set(enumerable, { id: "1", ...empty });
    enumerableInput = store.sync(enumerable, { id: "1", ...empty });

    // ...binding through refs
    singletonPromiseInput = store.set(singleton, refs);
    singletonInput = store.sync(singleton, refs);
    enumerablePromiseInput = store.set(enumerable, { id: "1", ...refs });
    enumerableInput = store.sync(enumerable, { id: "1", ...refs });

    // ...binding through identifiers
    singletonPromiseInput = store.set(singleton, identifiers);
    singletonInput = store.sync(singleton, identifiers);
    enumerablePromiseInput = store.set(enumerable, { id: "1", ...identifiers });
    enumerableInput = store.sync(enumerable, { id: "1", ...identifiers });

    // ...unbinding
    singletonPromiseInput = store.set(singleton, unrefs);
    singletonInput = store.sync(singleton, unrefs);
    enumerablePromiseInput = store.set(enumerable, { id: "1", ...unrefs });
    enumerableInput = store.sync(enumerable, { id: "1", ...unrefs });

    // ...check collisions
    /// @ts-expect-error
    singletonPromiseInput = store.set(singleton, collisions);
    /// @ts-expect-error
    singletonInput = store.sync(singleton, collisions);
    /// @ts-expect-error
    enumerablePromiseInput = store.set(enumerable, { id: "1", ...collisions });
    /// @ts-expect-error
    enumerableInput = store.sync(enumerable, { id: "1", ...collisions });
  }

  // Update model & nested via instance
  {
    // ...set primitive propertiers
    singletonPromiseInput = store.set(
      singleton,
      primitivesInUpdateNestedModels,
    );
    singletonInput = store.sync(singleton, primitivesInUpdateNestedModels);
    enumerablePromiseInput = store.set(enumerable, {
      id: "1",
      ...primitivesInUpdateNestedModels,
    });
    enumerableInput = store.sync(enumerable, {
      id: "1",
      ...primitivesInUpdateNestedModels,
    });

    // ...use default values
    singletonPromiseInput = store.set(singleton, emptyInUpdateNestedModels);
    singletonInput = store.sync(singleton, emptyInUpdateNestedModels);
    enumerablePromiseInput = store.set(enumerable, {
      id: "1",
      ...emptyInUpdateNestedModels,
    });
    enumerableInput = store.sync(enumerable, {
      id: "1",
      ...emptyInUpdateNestedModels,
    });

    // ...binding through refs
    singletonPromiseInput = store.set(singleton, refsInUpdateNestedModels);
    singletonInput = store.sync(singleton, refsInUpdateNestedModels);
    enumerablePromiseInput = store.set(enumerable, {
      id: "1",
      ...refsInUpdateNestedModels,
    });
    enumerableInput = store.sync(enumerable, {
      id: "1",
      ...refsInUpdateNestedModels,
    });

    // ...binding through identifiers
    singletonPromiseInput = store.set(
      singleton,
      identifiersInUpdateNestedModels,
    );
    singletonInput = store.sync(singleton, identifiersInUpdateNestedModels);
    enumerablePromiseInput = store.set(enumerable, {
      id: "1",
      ...identifiersInUpdateNestedModels,
    });
    enumerableInput = store.sync(enumerable, {
      id: "1",
      ...identifiersInUpdateNestedModels,
    });

    // ...unbinding
    singletonPromiseInput = store.set(singleton, unrefsInUpdateNestedModels);
    singletonInput = store.sync(singleton, unrefsInUpdateNestedModels);
    enumerablePromiseInput = store.set(enumerable, {
      id: "1",
      ...unrefsInUpdateNestedModels,
    });
    enumerableInput = store.sync(enumerable, {
      id: "1",
      ...unrefsInUpdateNestedModels,
    });

    // ...check collisions
    /// @ts-expect-error
    singletonPromiseInput = store.set(
      singleton,
      collisionsInUpdateNestedModels,
    );
    /// @ts-expect-error
    singletonInput = store.sync(singleton, collisionsInUpdateNestedModels);
    /// @ts-expect-error
    enumerablePromiseInput = store.set(enumerable, {
      id: "1",
      ...collisionsInUpdateNestedModels,
    });
    /// @ts-expect-error
    enumerableInput = store.sync(enumerable, {
      id: "1",
      ...collisionsInUpdateNestedModels,
    });
  }

  // Mixed...
  {
    // Update model and Create nested via Definition
    {
      // ...set primitive propertiers
      singletonPromiseInput = store.set(
        singleton,
        primitivesInCreateNestedModels,
      );
      singletonInput = store.sync(singleton, primitivesInCreateNestedModels);
      enumerablePromiseInput = store.set(enumerable, {
        id: "1",
        ...primitivesInCreateNestedModels,
      });
      enumerableInput = store.sync(enumerable, {
        id: "1",
        ...primitivesInCreateNestedModels,
      });

      // ...use default values
      singletonPromiseInput = store.set(singleton, emptyInCreateNestedModels);
      singletonInput = store.sync(singleton, emptyInCreateNestedModels);
      enumerablePromiseInput = store.set(enumerable, {
        id: "1",
        ...emptyInCreateNestedModels,
      });
      enumerableInput = store.sync(enumerable, {
        id: "1",
        ...emptyInCreateNestedModels,
      });

      // ...binding through refs
      singletonPromiseInput = store.set(singleton, refsInCreateNestedModels);
      singletonInput = store.sync(singleton, refsInCreateNestedModels);
      enumerablePromiseInput = store.set(enumerable, {
        id: "1",
        ...refsInCreateNestedModels,
      });
      enumerableInput = store.sync(enumerable, {
        id: "1",
        ...refsInCreateNestedModels,
      });

      // ...binding through identifiers
      singletonPromiseInput = store.set(
        singleton,
        identifiersInCreateNestedModels,
      );
      singletonInput = store.sync(singleton, identifiersInCreateNestedModels);
      enumerablePromiseInput = store.set(enumerable, {
        id: "1",
        ...identifiersInCreateNestedModels,
      });
      enumerableInput = store.sync(enumerable, {
        id: "1",
        ...identifiersInCreateNestedModels,
      });

      // ...unbinding
      singletonPromiseInput = store.set(singleton, unrefsInCreateNestedModels);
      singletonInput = store.sync(singleton, unrefsInCreateNestedModels);
      enumerablePromiseInput = store.set(enumerable, {
        id: "1",
        ...unrefsInCreateNestedModels,
      });
      enumerableInput = store.sync(enumerable, {
        id: "1",
        ...unrefsInCreateNestedModels,
      });

      // ...check collisions
      /// @ts-expect-error
      singletonPromiseInput = store.set(
        singleton,
        collisionsInCreateNestedModels,
      );
      /// @ts-expect-error
      singletonInput = store.sync(singleton, collisionsInCreateNestedModels);
      /// @ts-expect-error
      enumerablePromiseInput = store.set(enumerable, {
        id: "1",
        ...collisionsInCreateNestedModels,
      });
      /// @ts-expect-error
      enumerableInput = store.sync(enumerable, {
        id: "1",
        ...collisionsInCreateNestedModels,
      });
    }
  }
}

// Delete...
{
  // delete model via instance
  {
    enumerablePromiseInput = store.set(enumerable, null);
    enumerableInput = store.sync(enumerable, null);
    singletonPromiseInput = store.set(singleton, null); // is may be cleaning of the model values or draft values
    singletonInput = store.sync(singleton, null); // is may be cleaning of the model values or draft values
  }
}
