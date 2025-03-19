const mockIndexedDB = {
  _store: new Map(),
  
  clear() {
    this._store.clear();
  },
  
  async put(storeName, value, key) {
    const storeKey = `${storeName}:${key}`;
    this._store.set(storeKey, value);
    return key;
  },
  
  async get(storeName, key) {
    const storeKey = `${storeName}:${key}`;
    return this._store.get(storeKey);
  }
};

module.exports = { mockIndexedDB };