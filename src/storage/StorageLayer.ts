import { Result } from "../misc/Result";

export interface StorageLayer {
    add<T>(key: string, value: T, storeName: string): Promise<Result<unknown>>;
    update<T>(
        key: string,
        value: T,
        storeName: string,
    ): Promise<Result<unknown>>;
    delete(key: string, storeName: string): Promise<Result<unknown>>;
    get<T>(key: string, storeName: string): Promise<Result<T>>;
}
