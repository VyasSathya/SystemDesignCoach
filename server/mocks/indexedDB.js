class MockIndexedDB {
  constructor() {
    this.stores = new Map();
  }

  clear() {
    this.stores.clear();
  }

  async put(storeName, value, key) {
    if (!this.stores.has(storeName)) {
      this.stores.set(storeName, new Map());
    }
    const store = this.stores.get(storeName);
    store.set(key, value);
    return true;
  }

  async get(storeName, key) {
    const store = this.stores.get(storeName);
    if (!store) return null;
    return store.get(key) || null;
  }

  async delete(storeName, key) {
    const store = this.stores.get(storeName);
    if (!store) return false;
    return store.delete(key);
  }
}

const mockIndexedDB = new MockIndexedDB();

module.exports = { mockIndexedDB };