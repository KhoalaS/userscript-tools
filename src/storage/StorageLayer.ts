import { Result } from '../misc/Result'

export interface StorageLayer<T> {
  add(key: string, value: T): Promise<Result<unknown>>
  update(key: string, value: T): Promise<Result<unknown>>
  delete(key: string): Promise<Result<unknown>>
  get(key: string): Promise<Result<T>>
}
