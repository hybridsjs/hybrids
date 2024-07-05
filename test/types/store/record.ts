import { Model, define, store } from "/types/index";

interface IEnumerableModel {
  id: string;
  values: Record<string, { a: string }>;
}

const IEnumerableModel: Model<IEnumerableModel> = {
  id: true,
  values: store.record({ a: "test" }),
};

const IOtherModel: Model<IEnumerableModel> = {
  id: true,
  values: store.record(store.ref(() => ({ a: "test" }))),
};

interface IAComponent extends HTMLElement {
  model?: IEnumerableModel;
}

define<IAComponent>({
  tag: "a-component",
  model: store(IEnumerableModel),
});
