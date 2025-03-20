import { define } from "/types";

interface IMyComponent extends HTMLElement {
    booleanProperty1: boolean
    booleanProperty2: boolean
    booleanProperty3: boolean
    booleanProperty4: boolean
    booleanProperty5: boolean
    booleanProperty6: boolean
    
    nonprimitiveProperty1: {}
    nonprimitiveProperty2: {}
    nonprimitiveProperty3: {}
    nonprimitiveProperty4: {}
    nonprimitiveProperty5: {}
    nonprimitiveProperty6: {}
}

define<IMyComponent>({
    tag: "my-component",

    // Regular

    // value
    booleanProperty1: false,
    // getter
    booleanProperty2: ({ booleanProperty1 }) => booleanProperty1,
    // setter
    booleanProperty3: ({ booleanProperty1 }, value?: boolean) => value ?? booleanProperty1,

    // Regular with Descriptor

    // value
    booleanProperty4: {
        value: false
    },
    // getter
    booleanProperty5: {
        value: ({ booleanProperty4 }) => booleanProperty4,
    },
    // setter
    booleanProperty6: {
        value: ({ booleanProperty1 }, value?: boolean) => value ?? booleanProperty1,
    },

    // Exceptional case of non-primitives

    // value
    /// @ts-expect-error A default value as an object instance can only be set using full object descriptor with `value` option!
    nonprimitiveProperty1: {},
    // getter
    nonprimitiveProperty2: ({ nonprimitiveProperty1 }) => nonprimitiveProperty1,
    // setter
    nonprimitiveProperty3: ({ nonprimitiveProperty1 }, value?: object) => value ?? nonprimitiveProperty1,

    // Exceptional case of non-primitives - Descriptor

    nonprimitiveProperty4: {
        // value
        value: {},
    },
    nonprimitiveProperty5: {
        // getter
        value: ({ nonprimitiveProperty4 }) => nonprimitiveProperty4,
    },
    nonprimitiveProperty6: {
        // setter
        value: ({ nonprimitiveProperty4 }, value?: object) => value ?? nonprimitiveProperty4,
    },
})
