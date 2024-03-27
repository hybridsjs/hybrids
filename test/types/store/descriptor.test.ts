// This test is not intended to be run by JavaScript.
// This test is for static analysis of TypeScript and must be run by TypeScript-compiler to detect errors.

import { Model, define, store } from "/types/index";

interface IEnumerableModel { id: string, prop: number; }
interface ISingletonModel { prop: number; }

const EnumerableDefinition: Model<IEnumerableModel> = { id: true, prop: 0 };
const SingletonDefinition: Model<ISingletonModel> = { prop: 0 };

interface IAComponent extends HTMLElement {
    modelId: undefined | string;

    singleton: ISingletonModel;
    singletonDraft: ISingletonModel;
    model: undefined | IEnumerableModel;
    modelDraft: IEnumerableModel;

    singletonById: ISingletonModel;
    singletonDraftById: ISingletonModel;
    modelById: undefined | IEnumerableModel;
    modelDraftById: IEnumerableModel;

    singletonList: ISingletonModel[];
    singletonDraftList: ISingletonModel[];
    modelList: IEnumerableModel[];
    modelDraftList: IEnumerableModel[];

    singletonListById: ISingletonModel[];
    singletonDraftListById: ISingletonModel[];
    modelListById: IEnumerableModel[];
    modelDraftListById: IEnumerableModel[];

    looseSingletonList: ISingletonModel[];
    looseSingletonDraftList: ISingletonModel[];
    looseModelList: IEnumerableModel[];
    looseModelDraftList: IEnumerableModel[];

    looseSingletonListById: ISingletonModel[];
    looseSingletonDraftListById: ISingletonModel[];
    looseModelListById: IEnumerableModel[];
    looseModelDraftListById: IEnumerableModel[];
}

const Component = define<IAComponent>({
    tag: "a-component",
    modelId: undefined,

    singleton: store(SingletonDefinition),
    singletonDraft: store(SingletonDefinition, { draft: true }),
    model: store(EnumerableDefinition),
    modelDraft: store(EnumerableDefinition, { draft: true }),

    singletonById: store(SingletonDefinition, { id: 'modelId' }),
    singletonDraftById: store(SingletonDefinition, { id: 'modelId', draft: true }),
    modelById: store(EnumerableDefinition, { id: 'modelId' }),
    modelDraftById: store(EnumerableDefinition, { draft: true, id: 'modelId' }),

    /// @ts-expect-error
    singletonList: store([SingletonDefinition]),
    /// @ts-expect-error
    singletonDraftList: store([SingletonDefinition], { draft: true }),
    modelList: store([EnumerableDefinition]),
    /// @ts-expect-error
    modelDraftList: store([EnumerableDefinition], { draft: true }),

    /// @ts-expect-error
    singletonListById: store([SingletonDefinition], { id: 'modelId' }),
    /// @ts-expect-error
    singletonDraftListById: store([SingletonDefinition], { id: 'modelId', draft: true }),
    modelListById: store([EnumerableDefinition], { id: 'modelId' }),
    /// @ts-expect-error
    modelDraftListById: store([EnumerableDefinition], { id: 'modelId', draft: true }),

    /// @ts-expect-error
    looseSingletonList: store([SingletonDefinition], { loose: true }),
    /// @ts-expect-error
    looseSingletonDraftList: store([SingletonDefinition], { draft: true, loose: true }),
    looseModelList: store([EnumerableDefinition], { loose: true }),
    /// @ts-expect-error
    looseModelDraftList: store([EnumerableDefinition], { draft: true, loose: true }),

    /// @ts-expect-error
    looseSingletonListById: store([SingletonDefinition], { id: 'modelId', loose: true }),
    /// @ts-expect-error
    looseSingletonDraftListById: store([SingletonDefinition], { id: 'modelId', draft: true, loose: true }),
    looseModelListById: store([EnumerableDefinition], { id: 'modelId', loose: true }),
    /// @ts-expect-error
    looseModelDraftListById: store([EnumerableDefinition], { id: 'modelId', draft: true, loose: true }),
});