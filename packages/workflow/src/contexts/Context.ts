export class Context<T extends Record<string, any>> {
  protected _context: T;

  constructor(data: T) {
    this._context = data;
  }

  set(key: keyof T, value: T[keyof T]) {
    (this._context as Record<keyof T, any>)[key] = value;
  }

  get(key: keyof T) {
    return this._context[key];
  }
}
