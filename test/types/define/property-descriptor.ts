import { define } from "/types";

interface IMyComponent extends HTMLElement {
    primitiveProperty1: boolean
    primitiveProperty2: boolean
    primitiveProperty3: boolean
    primitiveProperty4: boolean
    primitiveProperty5: boolean
    primitiveProperty6: boolean
    
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
    primitiveProperty1: false,
    // getter
    primitiveProperty2: ({ primitiveProperty1 }) => primitiveProperty1,
    // setter
    primitiveProperty3: ({ primitiveProperty1 }, value?: boolean) => value ?? primitiveProperty1,

    // Regular with Descriptor

    // value
    primitiveProperty4: {
        value: false
    },
    // getter
    primitiveProperty5: {
        value: ({ primitiveProperty4 }) => primitiveProperty4,
    },
    // setter
    primitiveProperty6: {
        value: ({ primitiveProperty1 }, value?: boolean) => value ?? primitiveProperty1,
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
