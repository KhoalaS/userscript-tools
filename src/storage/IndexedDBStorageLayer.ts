import { assertNonNullable } from "../misc/AssertionFunctions";
import { Result } from "../misc/Result";
import { StorageLayer } from "./StorageLayer";

export type IDBStore<N extends string> = {
    name: N;
    keypath: string;
    indices: {
        name: string;
        unique?: boolean;
    }[];
};

export type IDBStoreUpdate = {
    version: number;
    updateFunction: (transaction: IDBTransaction) => void;
};

export class IndexedDBStorageLayer<N extends string> implements StorageLayer {
    private database: IDBDatabase | undefined;

    constructor(
        private readonly databaseName: string,
        private readonly window: Window,
        private readonly stores: IDBStore<N>[],
        private readonly updates?: IDBStoreUpdate[],
        private version: number = 1,
    ) {}
    get<T>(key: string, storeName: N): Promise<Result<T>> {
        return new Promise((resolve) => {
            const transaction = this.createTransaction(storeName, "readonly");
            const objectStore = transaction.objectStore(storeName);

            const getRequest: IDBRequest<T> = objectStore.get(key);
            getRequest.onsuccess = () => {
                const value = getRequest.result;
                if (value == null) {
                    resolve({
                        ok: false,
                        err: new Error(
                            `value with id ${key} from store ${storeName} was nullish or does not exist`,
                        ),
                    });
                } else {
                    resolve({
                        ok: true,
                        value: getRequest.result,
                    });
                }
            };

            getRequest.onerror = () => {
                resolve({
                    ok: false,
                    err: new Error(
                        `error getting value with id ${key} from store ${storeName}`,
                    ),
                });
            };
        });
    }

    async open() {
        return new Promise((resolve, reject) => {
            const databaseOpenRequest = this.window.indexedDB.open(
                this.databaseName,
                this.version,
            );

            databaseOpenRequest.onerror = (event) => {
                reject(new Error("error opening database"));
            };

            databaseOpenRequest.onsuccess = (event) => {
                this.database = databaseOpenRequest.result;
                console.log("success opening database");
                resolve(true);
            };

            databaseOpenRequest.onupgradeneeded = (event) => {
                if (event.target == null) {
                    reject(
                        new Error(
                            "error upgrading indexedDB store, the upgrade event has no target",
                        ),
                    );
                    return;
                }

                this.database = (
                    event.target as EventTarget & { result: IDBDatabase }
                ).result;

                this.database.onerror = (event) => {
                    reject(new Error("error loading database"));
                };

                console.log("creating object stores");
                const storeNames = this.database.objectStoreNames;
                for (const store of this.stores) {
                    if (!storeNames.contains(store.name)) {
                        const objectStore = this.database.createObjectStore(
                            store.name,
                            {
                                keyPath: store.keypath,
                            },
                        );

                        for (const index of store.indices) {
                            objectStore.createIndex(index.name, index.name, {
                                unique: index.unique ?? false,
                            });
                        }
                    }
                }

                if (this.updates) {
                    for (const update of this.updates) {
                        if (this.version !== update.version) {
                            continue;
                        }
                        const transaction = (
                            event.target as EventTarget & {
                                transaction: IDBTransaction;
                            }
                        ).transaction;
                        update.updateFunction(transaction);
                    }
                }
            };
        });
    }

    private createTransaction(
        storeName: N,
        mode: "readwrite" | "readonly" | "versionchange",
    ) {
        assertNonNullable(this.database);
        const transaction = this.database.transaction([storeName], mode);

        return transaction;
    }

    add<T>(key: string, value: T, storeName: N): Promise<Result<unknown>> {
        return this.update(key, value, storeName);
    }

    update<T>(key: string, value: T, storeName: N): Promise<Result<unknown>> {
        return new Promise((resolve) => {
            const transaction = this.createTransaction(storeName, "readwrite");
            const objectStore = transaction.objectStore(storeName);

            const updateRequest = objectStore.put(value);
            updateRequest.onsuccess = () => {
                resolve({
                    ok: true,
                    value: true,
                });
            };

            updateRequest.onerror = () => {
                resolve({
                    ok: false,
                    err: new Error(
                        `error updating value with key ${key} in store ${storeName}`,
                    ),
                });
            };
        });
    }

    delete(key: string, storeName: N): Promise<Result<unknown>> {
        return new Promise((resolve) => {
            const transaction = this.createTransaction(storeName, "readwrite");
            const objectStore = transaction.objectStore(storeName);

            const deleteRequest = objectStore.delete(key);
            deleteRequest.onsuccess = () => {
                resolve({
                    ok: true,
                    value: true,
                });
            };

            deleteRequest.onerror = () => {
                resolve({
                    ok: false,
                    err: new Error(
                        `error deleting value with key ${key} in store ${storeName}`,
                    ),
                });
            };
        });
    }
}
