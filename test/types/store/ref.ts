import { Model, store } from "/types/index";

interface IOtherModel {
  a: string;
}

interface IEnumerableModel {
  id: string;
  other: IOtherModel;
}

const IOtherModel: Model<IOtherModel> = {
  a: "",
};

const IEnumerableModel: Model<IEnumerableModel> = {
  id: true,
  other: store.ref(() => IOtherModel),
};
