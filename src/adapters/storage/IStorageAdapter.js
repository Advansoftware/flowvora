// Interface para adaptadores de armazenamento
export class IStorageAdapter {
  async get(key) {
    throw new Error('Method get must be implemented');
  }

  async set(key, value) {
    throw new Error('Method set must be implemented');
  }

  async remove(key) {
    throw new Error('Method remove must be implemented');
  }

  async clear() {
    throw new Error('Method clear must be implemented');
  }

  async keys() {
    throw new Error('Method keys must be implemented');
  }
}
