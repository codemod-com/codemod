export class Context<T extends Record<string, any>> {
  protected _context: T;

  constructor(data: T) {
    this._context = data;
  }

  set(key: string, value: T[keyof T]) {
    (this._context as Record<string, any>)[key] = value;
  }

  get(key: string) {
    return this._context[key];
  }
}
