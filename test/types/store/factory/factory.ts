import { Enumerable } from "../.internals/enumerable/enumerable.store";
import { IEnumerable } from "../.internals/enumerable/enumerable.entity";
import { Singleton } from "../.internals/singleton/singleton.store";
import { ISingleton } from "../.internals/singleton/singleton.entity";
import { define, store } from "/types/index";

interface IComponent extends HTMLElement {
  modelId: undefined | string;

  singleton: ISingleton;
  singletonDraft: ISingleton;
  model: undefined | IEnumerable;
  modelDraft: IEnumerable;

  singletonById: ISingleton;
  singletonDraftById: ISingleton;
  modelById: undefined | IEnumerable;
  modelDraftById: IEnumerable;

  singletonList: ISingleton[];
  singletonDraftList: ISingleton[];
  modelList: IEnumerable[];
  modelDraftList: IEnumerable[];

  singletonListById: ISingleton[];
  singletonDraftListById: ISingleton[];
  modelListById: IEnumerable[];
  modelDraftListById: IEnumerable[];

  looseSingletonList: ISingleton[];
  looseSingletonDraftList: ISingleton[];
  looseModelList: IEnumerable[];
  looseModelDraftList: IEnumerable[];

  looseSingletonListById: ISingleton[];
  looseSingletonDraftListById: ISingleton[];
  looseModelListById: IEnumerable[];
  looseModelDraftListById: IEnumerable[];
}

const Component = define<IComponent>({
  tag: "a-component",
  modelId: undefined,

  singleton: store(Singleton),
  singletonDraft: store(Singleton, { draft: true }),
  model: store(Enumerable),
  modelDraft: store(Enumerable, { draft: true }),

  singletonById: store(Singleton, { id: "modelId" }),
  singletonDraftById: store(Singleton, {
    id: "modelId",
    draft: true,
  }),
  modelById: store(Enumerable, { id: "modelId" }),
  modelDraftById: store(Enumerable, { draft: true, id: "modelId" }),

  /// @ts-expect-error
  singletonList: store([Singleton]),
  /// @ts-expect-error
  singletonDraftList: store([Singleton], { draft: true }),
  modelList: store([Enumerable]),
  /// @ts-expect-error
  modelDraftList: store([Enumerable], { draft: true }),

  /// @ts-expect-error
  singletonListById: store([Singleton], { id: "modelId" }),
  /// @ts-expect-error
  singletonDraftListById: store([Singleton], {
    id: "modelId",
    draft: true,
  }),
  modelListById: store([Enumerable], { id: "modelId" }),
  /// @ts-expect-error
  modelDraftListById: store([Enumerable], {
    id: "modelId",
    draft: true,
  }),

  /// @ts-expect-error
  looseSingletonList: store([Singleton], { loose: true }),
  /// @ts-expect-error
  looseSingletonDraftList: store([Singleton], {
    draft: true,
    loose: true,
  }),
  looseModelList: store([Enumerable], { loose: true }),
  /// @ts-expect-error
  looseModelDraftList: store([Enumerable], {
    draft: true,
    loose: true,
  }),

  /// @ts-expect-error
  looseSingletonListById: store([Singleton], {
    id: "modelId",
    loose: true,
  }),
  /// @ts-expect-error
  looseSingletonDraftListById: store([Singleton], {
    id: "modelId",
    draft: true,
    loose: true,
  }),
  looseModelListById: store([Enumerable], {
    id: "modelId",
    loose: true,
  }),
  /// @ts-expect-error
  looseModelDraftListById: store([Enumerable], {
    id: "modelId",
    draft: true,
    loose: true,
  }),
});
