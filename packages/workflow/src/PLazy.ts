// https://github.com/sindresorhus/p-lazy
// @ts-ignore
export class PLazy<ValueType> extends Promise<ValueType> {
  #executor;
  #promise?: Promise<ValueType>;

  constructor(
    executor: (
      resolve: (resolvedValue: ValueType) => void,
      reject: (error: any) => void,
    ) => void,
  ) {
    super((resolve) => {
      // @ts-ignore
      resolve();
    });

    this.#executor = executor;
  }

  // @ts-ignore
  static from(function_) {
    // @ts-ignore
    return new PLazy((resolve) => {
      resolve(function_());
    });
  }

  // @ts-ignore
  static resolve(value) {
    // @ts-ignore
    return new PLazy((resolve) => {
      resolve(value);
    });
  }

  // @ts-ignore
  static reject(error) {
    // @ts-ignore
    return new PLazy((resolve, reject) => {
      reject(error);
    });
  }

  // biome-ignore lint/suspicious/noThenProperty: <explanation>
  override then<TResult1 = ValueType, TResult2 = never>(
    onFulfilled:
      | ((resolvedValue: ValueType) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onRejected:
      | ((error: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ) {
    this.#promise ??= new Promise<ValueType>(this.#executor);
    return this.#promise.then(onFulfilled, onRejected);
  }

  // @ts-ignore
  catch(onRejected) {
    this.#promise = this.#promise || new Promise(this.#executor);
    return this.#promise.catch(onRejected);
  }
}
