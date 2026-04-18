import { assertNonNullable } from '../misc/AssertionFunctions'
import { Result } from '../misc/Result'

export type IDBStoreType<T = Record<string, unknown>> = {
  name: string
  value: T
}

export type IDBStore<T extends IDBStoreType> = {
  name: string
  keypath: keyof T['value'] extends string ? keyof T['value'] : string
  indices: {
    name: keyof T['value'] extends string ? keyof T['value'] : string
    unique?: boolean
  }[]
}

export type IDBStoreUpdate = {
  version: number
  updateFunction: (transaction: IDBTransaction) => void
}

export class IndexedDBStorageLayer<S extends IDBStoreType> {
  private database: IDBDatabase | undefined
  private readonly stores: IDBStore<S>[] = []

  constructor(
    private readonly databaseName: string,
    private readonly window: Window,
    private readonly updates?: IDBStoreUpdate[],
    private version: number = 1,
  ) {}

  addStore<N extends S['name']>(
    name: N,
    storeDefinition: Omit<IDBStore<Extract<S, { name: N }>>, 'name'>,
  ) {
    this.stores.push({
      ...storeDefinition,
      name,
    })
  }

  get<N extends S['name']>(
    storeName: N,
    key: string,
  ): Promise<Result<Extract<S, { name: N }>['value']>> {
    return new Promise((resolve) => {
      const transaction = this.createTransaction(storeName, 'readonly')
      const objectStore = transaction.objectStore(storeName)

      const getRequest: IDBRequest<Extract<S, { name: N }>['value']> = objectStore.get(key)
      getRequest.onsuccess = () => {
        const value = getRequest.result
        if (value == null) {
          resolve({
            ok: false,
            err: new Error(
              `value with id ${key} from store ${storeName} was nullish or does not exist`,
            ),
          })
        } else {
          resolve({
            ok: true,
            value: getRequest.result,
          })
        }
      }

      getRequest.onerror = () => {
        resolve({
          ok: false,
          err: new Error(`error getting value with id ${key} from store ${storeName}`),
        })
      }
    })
  }

  async open() {
    return new Promise((resolve, reject) => {
      const databaseOpenRequest = this.window.indexedDB.open(this.databaseName, this.version)

      databaseOpenRequest.onerror = () => {
        reject(new Error('error opening database'))
      }

      databaseOpenRequest.onsuccess = () => {
        this.database = databaseOpenRequest.result
        console.log('success opening database')
        resolve(true)
      }

      databaseOpenRequest.onupgradeneeded = (event) => {
        if (event.target == null) {
          reject(new Error('error upgrading indexedDB store, the upgrade event has no target'))
          return
        }

        this.database = (event.target as EventTarget & { result: IDBDatabase }).result

        this.database.onerror = () => {
          reject(new Error('error loading database'))
        }

        console.log('creating object stores')
        const storeNames = this.database.objectStoreNames
        for (const store of this.stores) {
          if (!storeNames.contains(store.name)) {
            const objectStore = this.database.createObjectStore(store.name, {
              keyPath: store.keypath,
            })

            for (const index of store.indices) {
              objectStore.createIndex(index.name, index.name, {
                unique: index.unique ?? false,
              })
            }
          }
        }

        if (this.updates) {
          for (const update of this.updates) {
            if (this.version !== update.version) {
              continue
            }
            const transaction = (
              event.target as EventTarget & {
                transaction: IDBTransaction
              }
            ).transaction
            update.updateFunction(transaction)
          }
        }
      }
    })
  }

  private createTransaction<N extends S['name']>(
    storeName: N,
    mode: 'readwrite' | 'readonly' | 'versionchange',
  ) {
    assertNonNullable(this.database)
    const transaction = this.database.transaction([storeName], mode)

    return transaction
  }

  add<N extends S['name']>(
    storeName: N,
    value: Extract<S, { name: N }>['value'],
  ): Promise<Result<unknown>> {
    return this.update(storeName, value)
  }

  update<N extends S['name']>(
    storeName: N,
    value: Extract<S, { name: N }>['value'],
  ): Promise<Result<unknown>> {
    return new Promise((resolve) => {
      const transaction = this.createTransaction(storeName, 'readwrite')
      const objectStore = transaction.objectStore(storeName)

      const updateRequest = objectStore.put(value)
      updateRequest.onsuccess = () => {
        resolve({
          ok: true,
          value: true,
        })
      }

      updateRequest.onerror = () => {
        resolve({
          ok: false,
          err: new Error(`error updating value ${value} in store ${storeName}`),
        })
      }
    })
  }

  delete<N extends S['name']>(storeName: N, key: string): Promise<Result<unknown>> {
    return new Promise((resolve) => {
      const transaction = this.createTransaction(storeName, 'readwrite')
      const objectStore = transaction.objectStore(storeName)

      const deleteRequest = objectStore.delete(key)
      deleteRequest.onsuccess = () => {
        resolve({
          ok: true,
          value: true,
        })
      }

      deleteRequest.onerror = () => {
        resolve({
          ok: false,
          err: new Error(`error deleting value with key ${key} in store ${storeName}`),
        })
      }
    })
  }

  forEach<N extends S['name']>(
    storeName: N,
    callback: (value: Extract<S, { name: N }>['value']) => void,
  ) {
    const transaction = this.createTransaction(storeName, 'readonly')
    const objectStore = transaction.objectStore(storeName)

    const cursorRequest = objectStore.openCursor()
    cursorRequest.onsuccess = (event: Event) => {
      const cursor = (event.target as EventTarget & { result: IDBCursorWithValue | undefined })
        .result
      if (!cursor) return

      callback(cursor.value)
      cursor.continue()
    }
    cursorRequest.onerror = () => {
      throw new Error(`error requesting cursor for store ${storeName}`)
    }
  }
}
