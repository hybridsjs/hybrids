import { Model } from "/types/index";

export interface ISingleton {
  prop: string;
  length: number;
}

const SingletonStore: Model<ISingleton> = {
  prop: "",
  length: 0,
};

export default SingletonStore;

const BrokenSingletonStore: Model<ISingleton> = {
  /// @ts-expect-error
  id: true,
  prop: "",
  length: 0,
};
