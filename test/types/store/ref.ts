import { ModelDefinition, store } from "/types/index";

interface IOtherModel {
  a: string;
}

interface IEnumerableModel {
  id: string;
  other: IOtherModel;
}

const IOtherModel: ModelDefinition<IOtherModel> = {
  a: "",
};

const IEnumerableModel: ModelDefinition<IEnumerableModel> = {
  id: true,
  other: store.ref(() => IOtherModel),
};
