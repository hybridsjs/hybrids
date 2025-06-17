import { PickIndexes, FieldDefinition, GuardedModel, ModelDefinition, define, store, StoreRecord } from "/types/index";

type A = { a: string }

interface IEnumerableModel {
  id: string;
  property: string
  values: Record<string, A>;
}

type B = FieldDefinition<A>

const IEnumerableModel: ModelDefinition<IEnumerableModel> = {
  id: true,
  property: "",
  values: store.record({ a: "test" }),
};

const IOtherModel: ModelDefinition<IEnumerableModel> = {
  id: true,
  property: "",
  values: store.ref(() => store.record(({ a: "test" }))),
};

interface IAComponent extends HTMLElement {
  model?: IEnumerableModel;
}

define<IAComponent>({
  tag: "a-component",
  model: store(IEnumerableModel),
});
