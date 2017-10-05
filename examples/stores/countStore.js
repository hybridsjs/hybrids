export class CountStore {
  constructor() {
    this.count = 0;
  }

  inc() {
    this.count += 1;
  }
}

export default new CountStore();
