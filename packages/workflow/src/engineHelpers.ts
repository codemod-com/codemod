import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
import { mapValues, memoize } from "lodash";
import { PLazy } from "./PLazy";
import { noContextFn } from "./helpers";

function getHash(data: any) {
  const h = createHash("sha1");
  h.update(JSON.stringify(data));
  return h.digest("hex");
}

class NodeContext {
  public name: string;
  public hash: string;
  public children: NodeContext[];
  constructor(name: string, fn: string, args: any) {
    this.name = name;
    this.hash = getHash({ name, fn: fn.toString(), args });
    this.children = [];
  }
}

const selfContext = new AsyncLocalStorage<NodeContext>();

const parentContext = new AsyncLocalStorage<NodeContext>();

const wrapContext = new AsyncLocalStorage<(...args: any[]) => any>();

const tree: { children: NodeContext[] } = {
  children: [],
};

export const getTree = () => tree;

export function fnWrapper<T extends (...args: any) => any>(
  name: string,
  fn: T,
): T {
  return ((...args: any[]) => {
    const parent = parentContext.getStore();
    const self = new NodeContext(name, fn.toString(), args);
    if (parent) {
      parent.children.push(self);
    } else {
      tree.children.push(self);
    }
    return selfContext.run(self, fn, ...args);
  }) as any;
}

export class FunctionExecutor<
  I extends (() => Promise<void> | void) | undefined = undefined, // init
  H extends Record<string, any> | undefined = undefined, // helpers
  R extends ((...args: any[]) => Promise<any> | any) | undefined = undefined, // return
  W extends boolean = true, // return wrapped helpers like PLazy<H> & H or not
  E extends ((...args: any[]) => Promise<any> | any) | undefined = undefined, // executor
  C extends ((...args: any[]) => Promise<any> | any) | undefined = undefined, // callback
  A extends (() => any | Promise<any> | any) | undefined = undefined, // arguments parser
> {
  // @ts-ignore
  private _init?: I;
  private _helpers?: H;
  private _return?: R;
  private _context: NodeContext;
  private _copyHelpersToPromise: W = true as W;
  private _executor?: E;
  private _parentWrapper: (...args: any[]) => any;
  private _callback?: C;
  private _arguments?: A;

  constructor(public name: string) {
    this._context = selfContext.getStore() as NodeContext;
    this._parentWrapper = wrapContext.getStore() ?? noContextFn;
  }

  doNotCopyHelpersToPromise(): FunctionExecutor<I, H, R, false, E, C, A> {
    this._copyHelpersToPromise = false as W;
    return this as any;
  }

  init<IE extends I>(init: IE): FunctionExecutor<IE, H, R, W, E, C, A> {
    if (init) {
      this._init = memoize(init);
    }
    return this as any;
  }

  arguments<AE extends () => any | Promise<any>>(
    args: AE,
  ): FunctionExecutor<I, H, R, W, E, C, AE> {
    this._arguments = args as any;
    return this as any;
  }

  getArguments(): A extends () => any | Promise<any>
    ? Awaited<ReturnType<A>>
    : undefined {
    return this._arguments?.();
  }

  helpers<HE extends Record<string, any>>(
    helpers: HE,
  ): FunctionExecutor<I, HE, R, W, E, C, A> {
    this._helpers = helpers as any;
    return this as any;
  }

  callback<
    CE extends (
      self: FunctionExecutor<I, H, R, W, E, C, A>,
    ) => Promise<any> | any,
  >(callback: CE): FunctionExecutor<I, H, R, W, E, CE, A> {
    this._callback = callback as any;
    return this as any;
  }

  wrappedHelpers(): H {
    return mapValues(
      // @ts-ignore
      this._helpers,
      (value: any) =>
        (...args: any[]) =>
          // @ts-ignore
          parentContext.run(this._context, () =>
            wrapContext.run(this.context(), () => value(...args)),
          ),
    ) as any;
  }

  wrapHelpers<HR extends Record<string, any>>(helpers: HR): HR {
    return mapValues(
      // @ts-ignore
      helpers,
      (value: any) =>
        (...args: any[]) =>
          // @ts-ignore
          parentContext.run(this._context, () =>
            wrapContext.run(this.context(), () => value(...args)),
          ),
    ) as any;
  }

  context() {
    return (cb?: any) =>
      this._parentWrapper(() =>
        (this._executor ?? noContextFn)(async () => {
          await this._callback?.(this);
          return cb?.();
        }, this),
      );
  }

  return<
    RE extends (
      self: FunctionExecutor<I, H, R, W, E, C, A>,
    ) => Promise<any> | any,
  >(_return: RE): FunctionExecutor<I, H, RE, W, E, C, A> {
    this._return = _return as any;
    return this as any;
  }

  executor<
    EE extends (
      next: any,
      self: FunctionExecutor<I, H, R, W, E, C, A>,
    ) => Promise<any> | any,
  >(executor: EE): FunctionExecutor<I, H, R, W, EE, C, A> {
    this._executor = executor as any;
    return this as any;
  }

  run(): R extends (...args: any[]) => Promise<any> | any
    ? W extends true
      ? PLazy<Awaited<ReturnType<R>>> & Awaited<ReturnType<R>>
      : PLazy<Awaited<ReturnType<R>>>
    : void {
    const promise = new PLazy((resolve, reject) => {
      (async () => {
        await this.context()();
        return this._return?.(this);
      })()
        .then(resolve)
        .catch(reject);
    }) as any;

    if (this._copyHelpersToPromise) {
      const wrappedHelpers = this.wrappedHelpers();
      for (const key in wrappedHelpers) {
        promise[key] = wrappedHelpers[key];
      }
    }

    return promise;
  }
}
