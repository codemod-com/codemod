
/**
 * Client
**/

import * as runtime from './runtime/binary.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Codemod
 * 
 */
export type Codemod = $Result.DefaultSelection<Prisma.$CodemodPayload>
/**
 * Model CodemodVersion
 * 
 */
export type CodemodVersion = $Result.DefaultSelection<Prisma.$CodemodVersionPayload>
/**
 * Model Tag
 * 
 */
export type Tag = $Result.DefaultSelection<Prisma.$TagPayload>
/**
 * Model UserLoginIntent
 * 
 */
export type UserLoginIntent = $Result.DefaultSelection<Prisma.$UserLoginIntentPayload>
/**
 * Model CodeDiff
 * 
 */
export type CodeDiff = $Result.DefaultSelection<Prisma.$CodeDiffPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Codemods
 * const codemods = await prisma.codemod.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Codemods
   * const codemods = await prisma.codemod.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends (U | 'beforeExit')>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : V extends 'beforeExit' ? () => $Utils.JsPromise<void> : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.codemod`: Exposes CRUD operations for the **Codemod** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Codemods
    * const codemods = await prisma.codemod.findMany()
    * ```
    */
  get codemod(): Prisma.CodemodDelegate<ExtArgs>;

  /**
   * `prisma.codemodVersion`: Exposes CRUD operations for the **CodemodVersion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CodemodVersions
    * const codemodVersions = await prisma.codemodVersion.findMany()
    * ```
    */
  get codemodVersion(): Prisma.CodemodVersionDelegate<ExtArgs>;

  /**
   * `prisma.tag`: Exposes CRUD operations for the **Tag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tags
    * const tags = await prisma.tag.findMany()
    * ```
    */
  get tag(): Prisma.TagDelegate<ExtArgs>;

  /**
   * `prisma.userLoginIntent`: Exposes CRUD operations for the **UserLoginIntent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserLoginIntents
    * const userLoginIntents = await prisma.userLoginIntent.findMany()
    * ```
    */
  get userLoginIntent(): Prisma.UserLoginIntentDelegate<ExtArgs>;

  /**
   * `prisma.codeDiff`: Exposes CRUD operations for the **CodeDiff** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CodeDiffs
    * const codeDiffs = await prisma.codeDiff.findMany()
    * ```
    */
  get codeDiff(): Prisma.CodeDiffDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.15.1
   * Query Engine version: 5675a3182f972f1a8f31d16eee6abf4fd54910e3
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown }

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Codemod: 'Codemod',
    CodemodVersion: 'CodemodVersion',
    Tag: 'Tag',
    UserLoginIntent: 'UserLoginIntent',
    CodeDiff: 'CodeDiff'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }


  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs}, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meta: {
      modelProps: 'codemod' | 'codemodVersion' | 'tag' | 'userLoginIntent' | 'codeDiff'
      txIsolationLevel: Prisma.TransactionIsolationLevel
    },
    model: {
      Codemod: {
        payload: Prisma.$CodemodPayload<ExtArgs>
        fields: Prisma.CodemodFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CodemodFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CodemodFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload>
          }
          findFirst: {
            args: Prisma.CodemodFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CodemodFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload>
          }
          findMany: {
            args: Prisma.CodemodFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload>[]
          }
          create: {
            args: Prisma.CodemodCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload>
          }
          createMany: {
            args: Prisma.CodemodCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CodemodCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload>[]
          }
          delete: {
            args: Prisma.CodemodDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload>
          }
          update: {
            args: Prisma.CodemodUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload>
          }
          deleteMany: {
            args: Prisma.CodemodDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.CodemodUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.CodemodUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodPayload>
          }
          aggregate: {
            args: Prisma.CodemodAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCodemod>
          }
          groupBy: {
            args: Prisma.CodemodGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CodemodGroupByOutputType>[]
          }
          count: {
            args: Prisma.CodemodCountArgs<ExtArgs>,
            result: $Utils.Optional<CodemodCountAggregateOutputType> | number
          }
        }
      }
      CodemodVersion: {
        payload: Prisma.$CodemodVersionPayload<ExtArgs>
        fields: Prisma.CodemodVersionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CodemodVersionFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CodemodVersionFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload>
          }
          findFirst: {
            args: Prisma.CodemodVersionFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CodemodVersionFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload>
          }
          findMany: {
            args: Prisma.CodemodVersionFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload>[]
          }
          create: {
            args: Prisma.CodemodVersionCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload>
          }
          createMany: {
            args: Prisma.CodemodVersionCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CodemodVersionCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload>[]
          }
          delete: {
            args: Prisma.CodemodVersionDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload>
          }
          update: {
            args: Prisma.CodemodVersionUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload>
          }
          deleteMany: {
            args: Prisma.CodemodVersionDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.CodemodVersionUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.CodemodVersionUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodemodVersionPayload>
          }
          aggregate: {
            args: Prisma.CodemodVersionAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCodemodVersion>
          }
          groupBy: {
            args: Prisma.CodemodVersionGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CodemodVersionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CodemodVersionCountArgs<ExtArgs>,
            result: $Utils.Optional<CodemodVersionCountAggregateOutputType> | number
          }
        }
      }
      Tag: {
        payload: Prisma.$TagPayload<ExtArgs>
        fields: Prisma.TagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TagFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TagFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findFirst: {
            args: Prisma.TagFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TagFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findMany: {
            args: Prisma.TagFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          create: {
            args: Prisma.TagCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          createMany: {
            args: Prisma.TagCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TagCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          delete: {
            args: Prisma.TagDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          update: {
            args: Prisma.TagUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          deleteMany: {
            args: Prisma.TagDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.TagUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.TagUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          aggregate: {
            args: Prisma.TagAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateTag>
          }
          groupBy: {
            args: Prisma.TagGroupByArgs<ExtArgs>,
            result: $Utils.Optional<TagGroupByOutputType>[]
          }
          count: {
            args: Prisma.TagCountArgs<ExtArgs>,
            result: $Utils.Optional<TagCountAggregateOutputType> | number
          }
        }
      }
      UserLoginIntent: {
        payload: Prisma.$UserLoginIntentPayload<ExtArgs>
        fields: Prisma.UserLoginIntentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserLoginIntentFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserLoginIntentFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload>
          }
          findFirst: {
            args: Prisma.UserLoginIntentFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserLoginIntentFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload>
          }
          findMany: {
            args: Prisma.UserLoginIntentFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload>[]
          }
          create: {
            args: Prisma.UserLoginIntentCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload>
          }
          createMany: {
            args: Prisma.UserLoginIntentCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserLoginIntentCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload>[]
          }
          delete: {
            args: Prisma.UserLoginIntentDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload>
          }
          update: {
            args: Prisma.UserLoginIntentUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload>
          }
          deleteMany: {
            args: Prisma.UserLoginIntentDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.UserLoginIntentUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.UserLoginIntentUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$UserLoginIntentPayload>
          }
          aggregate: {
            args: Prisma.UserLoginIntentAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateUserLoginIntent>
          }
          groupBy: {
            args: Prisma.UserLoginIntentGroupByArgs<ExtArgs>,
            result: $Utils.Optional<UserLoginIntentGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserLoginIntentCountArgs<ExtArgs>,
            result: $Utils.Optional<UserLoginIntentCountAggregateOutputType> | number
          }
        }
      }
      CodeDiff: {
        payload: Prisma.$CodeDiffPayload<ExtArgs>
        fields: Prisma.CodeDiffFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CodeDiffFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CodeDiffFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload>
          }
          findFirst: {
            args: Prisma.CodeDiffFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CodeDiffFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload>
          }
          findMany: {
            args: Prisma.CodeDiffFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload>[]
          }
          create: {
            args: Prisma.CodeDiffCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload>
          }
          createMany: {
            args: Prisma.CodeDiffCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CodeDiffCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload>[]
          }
          delete: {
            args: Prisma.CodeDiffDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload>
          }
          update: {
            args: Prisma.CodeDiffUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload>
          }
          deleteMany: {
            args: Prisma.CodeDiffDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.CodeDiffUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.CodeDiffUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CodeDiffPayload>
          }
          aggregate: {
            args: Prisma.CodeDiffAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCodeDiff>
          }
          groupBy: {
            args: Prisma.CodeDiffGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CodeDiffGroupByOutputType>[]
          }
          count: {
            args: Prisma.CodeDiffCountArgs<ExtArgs>,
            result: $Utils.Optional<CodeDiffCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<'define', Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CodemodCountOutputType
   */

  export type CodemodCountOutputType = {
    versions: number
  }

  export type CodemodCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    versions?: boolean | CodemodCountOutputTypeCountVersionsArgs
  }

  // Custom InputTypes
  /**
   * CodemodCountOutputType without action
   */
  export type CodemodCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodCountOutputType
     */
    select?: CodemodCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CodemodCountOutputType without action
   */
  export type CodemodCountOutputTypeCountVersionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodemodVersionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Codemod
   */

  export type AggregateCodemod = {
    _count: CodemodCountAggregateOutputType | null
    _avg: CodemodAvgAggregateOutputType | null
    _sum: CodemodSumAggregateOutputType | null
    _min: CodemodMinAggregateOutputType | null
    _max: CodemodMaxAggregateOutputType | null
  }

  export type CodemodAvgAggregateOutputType = {
    id: number | null
    totalRuns: number | null
    amountOfUses: number | null
    totalTimeSaved: number | null
    openedPrs: number | null
  }

  export type CodemodSumAggregateOutputType = {
    id: number | null
    totalRuns: number | null
    amountOfUses: number | null
    totalTimeSaved: number | null
    openedPrs: number | null
  }

  export type CodemodMinAggregateOutputType = {
    id: number | null
    slug: string | null
    shortDescription: string | null
    engine: string | null
    name: string | null
    featured: boolean | null
    verified: boolean | null
    private: boolean | null
    author: string | null
    totalRuns: number | null
    amountOfUses: number | null
    totalTimeSaved: number | null
    openedPrs: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CodemodMaxAggregateOutputType = {
    id: number | null
    slug: string | null
    shortDescription: string | null
    engine: string | null
    name: string | null
    featured: boolean | null
    verified: boolean | null
    private: boolean | null
    author: string | null
    totalRuns: number | null
    amountOfUses: number | null
    totalTimeSaved: number | null
    openedPrs: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CodemodCountAggregateOutputType = {
    id: number
    slug: number
    shortDescription: number
    tags: number
    engine: number
    applicability: number
    arguments: number
    name: number
    featured: number
    verified: number
    private: number
    author: number
    totalRuns: number
    amountOfUses: number
    totalTimeSaved: number
    openedPrs: number
    labels: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CodemodAvgAggregateInputType = {
    id?: true
    totalRuns?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
  }

  export type CodemodSumAggregateInputType = {
    id?: true
    totalRuns?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
  }

  export type CodemodMinAggregateInputType = {
    id?: true
    slug?: true
    shortDescription?: true
    engine?: true
    name?: true
    featured?: true
    verified?: true
    private?: true
    author?: true
    totalRuns?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CodemodMaxAggregateInputType = {
    id?: true
    slug?: true
    shortDescription?: true
    engine?: true
    name?: true
    featured?: true
    verified?: true
    private?: true
    author?: true
    totalRuns?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CodemodCountAggregateInputType = {
    id?: true
    slug?: true
    shortDescription?: true
    tags?: true
    engine?: true
    applicability?: true
    arguments?: true
    name?: true
    featured?: true
    verified?: true
    private?: true
    author?: true
    totalRuns?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
    labels?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CodemodAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Codemod to aggregate.
     */
    where?: CodemodWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codemods to fetch.
     */
    orderBy?: CodemodOrderByWithRelationInput | CodemodOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CodemodWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codemods from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codemods.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Codemods
    **/
    _count?: true | CodemodCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CodemodAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CodemodSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CodemodMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CodemodMaxAggregateInputType
  }

  export type GetCodemodAggregateType<T extends CodemodAggregateArgs> = {
        [P in keyof T & keyof AggregateCodemod]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCodemod[P]>
      : GetScalarType<T[P], AggregateCodemod[P]>
  }




  export type CodemodGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodemodWhereInput
    orderBy?: CodemodOrderByWithAggregationInput | CodemodOrderByWithAggregationInput[]
    by: CodemodScalarFieldEnum[] | CodemodScalarFieldEnum
    having?: CodemodScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CodemodCountAggregateInputType | true
    _avg?: CodemodAvgAggregateInputType
    _sum?: CodemodSumAggregateInputType
    _min?: CodemodMinAggregateInputType
    _max?: CodemodMaxAggregateInputType
  }

  export type CodemodGroupByOutputType = {
    id: number
    slug: string
    shortDescription: string | null
    tags: string[]
    engine: string | null
    applicability: JsonValue | null
    arguments: JsonValue | null
    name: string
    featured: boolean
    verified: boolean
    private: boolean
    author: string
    totalRuns: number
    amountOfUses: number
    totalTimeSaved: number
    openedPrs: number
    labels: string[]
    createdAt: Date
    updatedAt: Date
    _count: CodemodCountAggregateOutputType | null
    _avg: CodemodAvgAggregateOutputType | null
    _sum: CodemodSumAggregateOutputType | null
    _min: CodemodMinAggregateOutputType | null
    _max: CodemodMaxAggregateOutputType | null
  }

  type GetCodemodGroupByPayload<T extends CodemodGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CodemodGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CodemodGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CodemodGroupByOutputType[P]>
            : GetScalarType<T[P], CodemodGroupByOutputType[P]>
        }
      >
    >


  export type CodemodSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    shortDescription?: boolean
    tags?: boolean
    engine?: boolean
    applicability?: boolean
    arguments?: boolean
    name?: boolean
    featured?: boolean
    verified?: boolean
    private?: boolean
    author?: boolean
    totalRuns?: boolean
    amountOfUses?: boolean
    totalTimeSaved?: boolean
    openedPrs?: boolean
    labels?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    versions?: boolean | Codemod$versionsArgs<ExtArgs>
    _count?: boolean | CodemodCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["codemod"]>

  export type CodemodSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    shortDescription?: boolean
    tags?: boolean
    engine?: boolean
    applicability?: boolean
    arguments?: boolean
    name?: boolean
    featured?: boolean
    verified?: boolean
    private?: boolean
    author?: boolean
    totalRuns?: boolean
    amountOfUses?: boolean
    totalTimeSaved?: boolean
    openedPrs?: boolean
    labels?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["codemod"]>

  export type CodemodSelectScalar = {
    id?: boolean
    slug?: boolean
    shortDescription?: boolean
    tags?: boolean
    engine?: boolean
    applicability?: boolean
    arguments?: boolean
    name?: boolean
    featured?: boolean
    verified?: boolean
    private?: boolean
    author?: boolean
    totalRuns?: boolean
    amountOfUses?: boolean
    totalTimeSaved?: boolean
    openedPrs?: boolean
    labels?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CodemodInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    versions?: boolean | Codemod$versionsArgs<ExtArgs>
    _count?: boolean | CodemodCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CodemodIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CodemodPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Codemod"
    objects: {
      versions: Prisma.$CodemodVersionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      slug: string
      shortDescription: string | null
      tags: string[]
      engine: string | null
      applicability: Prisma.JsonValue | null
      arguments: Prisma.JsonValue | null
      name: string
      featured: boolean
      verified: boolean
      private: boolean
      author: string
      totalRuns: number
      amountOfUses: number
      totalTimeSaved: number
      openedPrs: number
      labels: string[]
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["codemod"]>
    composites: {}
  }

  type CodemodGetPayload<S extends boolean | null | undefined | CodemodDefaultArgs> = $Result.GetResult<Prisma.$CodemodPayload, S>

  type CodemodCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CodemodFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CodemodCountAggregateInputType | true
    }

  export interface CodemodDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Codemod'], meta: { name: 'Codemod' } }
    /**
     * Find zero or one Codemod that matches the filter.
     * @param {CodemodFindUniqueArgs} args - Arguments to find a Codemod
     * @example
     * // Get one Codemod
     * const codemod = await prisma.codemod.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends CodemodFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodFindUniqueArgs<ExtArgs>>
    ): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Codemod that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CodemodFindUniqueOrThrowArgs} args - Arguments to find a Codemod
     * @example
     * // Get one Codemod
     * const codemod = await prisma.codemod.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends CodemodFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Codemod that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodFindFirstArgs} args - Arguments to find a Codemod
     * @example
     * // Get one Codemod
     * const codemod = await prisma.codemod.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends CodemodFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodFindFirstArgs<ExtArgs>>
    ): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Codemod that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodFindFirstOrThrowArgs} args - Arguments to find a Codemod
     * @example
     * // Get one Codemod
     * const codemod = await prisma.codemod.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends CodemodFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Codemods that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Codemods
     * const codemods = await prisma.codemod.findMany()
     * 
     * // Get first 10 Codemods
     * const codemods = await prisma.codemod.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const codemodWithIdOnly = await prisma.codemod.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends CodemodFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Codemod.
     * @param {CodemodCreateArgs} args - Arguments to create a Codemod.
     * @example
     * // Create one Codemod
     * const Codemod = await prisma.codemod.create({
     *   data: {
     *     // ... data to create a Codemod
     *   }
     * })
     * 
    **/
    create<T extends CodemodCreateArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodCreateArgs<ExtArgs>>
    ): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Codemods.
     * @param {CodemodCreateManyArgs} args - Arguments to create many Codemods.
     * @example
     * // Create many Codemods
     * const codemod = await prisma.codemod.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends CodemodCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Codemods and returns the data saved in the database.
     * @param {CodemodCreateManyAndReturnArgs} args - Arguments to create many Codemods.
     * @example
     * // Create many Codemods
     * const codemod = await prisma.codemod.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Codemods and only return the `id`
     * const codemodWithIdOnly = await prisma.codemod.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends CodemodCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a Codemod.
     * @param {CodemodDeleteArgs} args - Arguments to delete one Codemod.
     * @example
     * // Delete one Codemod
     * const Codemod = await prisma.codemod.delete({
     *   where: {
     *     // ... filter to delete one Codemod
     *   }
     * })
     * 
    **/
    delete<T extends CodemodDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodDeleteArgs<ExtArgs>>
    ): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Codemod.
     * @param {CodemodUpdateArgs} args - Arguments to update one Codemod.
     * @example
     * // Update one Codemod
     * const codemod = await prisma.codemod.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends CodemodUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodUpdateArgs<ExtArgs>>
    ): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Codemods.
     * @param {CodemodDeleteManyArgs} args - Arguments to filter Codemods to delete.
     * @example
     * // Delete a few Codemods
     * const { count } = await prisma.codemod.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends CodemodDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Codemods.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Codemods
     * const codemod = await prisma.codemod.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends CodemodUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Codemod.
     * @param {CodemodUpsertArgs} args - Arguments to update or create a Codemod.
     * @example
     * // Update or create a Codemod
     * const codemod = await prisma.codemod.upsert({
     *   create: {
     *     // ... data to create a Codemod
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Codemod we want to update
     *   }
     * })
    **/
    upsert<T extends CodemodUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodUpsertArgs<ExtArgs>>
    ): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Codemods.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodCountArgs} args - Arguments to filter Codemods to count.
     * @example
     * // Count the number of Codemods
     * const count = await prisma.codemod.count({
     *   where: {
     *     // ... the filter for the Codemods we want to count
     *   }
     * })
    **/
    count<T extends CodemodCountArgs>(
      args?: Subset<T, CodemodCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CodemodCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Codemod.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CodemodAggregateArgs>(args: Subset<T, CodemodAggregateArgs>): Prisma.PrismaPromise<GetCodemodAggregateType<T>>

    /**
     * Group by Codemod.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CodemodGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CodemodGroupByArgs['orderBy'] }
        : { orderBy?: CodemodGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CodemodGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCodemodGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Codemod model
   */
  readonly fields: CodemodFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Codemod.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CodemodClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    versions<T extends Codemod$versionsArgs<ExtArgs> = {}>(args?: Subset<T, Codemod$versionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'findMany'> | Null>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the Codemod model
   */ 
  interface CodemodFieldRefs {
    readonly id: FieldRef<"Codemod", 'Int'>
    readonly slug: FieldRef<"Codemod", 'String'>
    readonly shortDescription: FieldRef<"Codemod", 'String'>
    readonly tags: FieldRef<"Codemod", 'String[]'>
    readonly engine: FieldRef<"Codemod", 'String'>
    readonly applicability: FieldRef<"Codemod", 'Json'>
    readonly arguments: FieldRef<"Codemod", 'Json'>
    readonly name: FieldRef<"Codemod", 'String'>
    readonly featured: FieldRef<"Codemod", 'Boolean'>
    readonly verified: FieldRef<"Codemod", 'Boolean'>
    readonly private: FieldRef<"Codemod", 'Boolean'>
    readonly author: FieldRef<"Codemod", 'String'>
    readonly totalRuns: FieldRef<"Codemod", 'Int'>
    readonly amountOfUses: FieldRef<"Codemod", 'Int'>
    readonly totalTimeSaved: FieldRef<"Codemod", 'Int'>
    readonly openedPrs: FieldRef<"Codemod", 'Int'>
    readonly labels: FieldRef<"Codemod", 'String[]'>
    readonly createdAt: FieldRef<"Codemod", 'DateTime'>
    readonly updatedAt: FieldRef<"Codemod", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Codemod findUnique
   */
  export type CodemodFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * Filter, which Codemod to fetch.
     */
    where: CodemodWhereUniqueInput
  }

  /**
   * Codemod findUniqueOrThrow
   */
  export type CodemodFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * Filter, which Codemod to fetch.
     */
    where: CodemodWhereUniqueInput
  }

  /**
   * Codemod findFirst
   */
  export type CodemodFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * Filter, which Codemod to fetch.
     */
    where?: CodemodWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codemods to fetch.
     */
    orderBy?: CodemodOrderByWithRelationInput | CodemodOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Codemods.
     */
    cursor?: CodemodWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codemods from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codemods.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Codemods.
     */
    distinct?: CodemodScalarFieldEnum | CodemodScalarFieldEnum[]
  }

  /**
   * Codemod findFirstOrThrow
   */
  export type CodemodFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * Filter, which Codemod to fetch.
     */
    where?: CodemodWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codemods to fetch.
     */
    orderBy?: CodemodOrderByWithRelationInput | CodemodOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Codemods.
     */
    cursor?: CodemodWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codemods from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codemods.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Codemods.
     */
    distinct?: CodemodScalarFieldEnum | CodemodScalarFieldEnum[]
  }

  /**
   * Codemod findMany
   */
  export type CodemodFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * Filter, which Codemods to fetch.
     */
    where?: CodemodWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codemods to fetch.
     */
    orderBy?: CodemodOrderByWithRelationInput | CodemodOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Codemods.
     */
    cursor?: CodemodWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codemods from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codemods.
     */
    skip?: number
    distinct?: CodemodScalarFieldEnum | CodemodScalarFieldEnum[]
  }

  /**
   * Codemod create
   */
  export type CodemodCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * The data needed to create a Codemod.
     */
    data: XOR<CodemodCreateInput, CodemodUncheckedCreateInput>
  }

  /**
   * Codemod createMany
   */
  export type CodemodCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Codemods.
     */
    data: CodemodCreateManyInput | CodemodCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Codemod createManyAndReturn
   */
  export type CodemodCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Codemods.
     */
    data: CodemodCreateManyInput | CodemodCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Codemod update
   */
  export type CodemodUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * The data needed to update a Codemod.
     */
    data: XOR<CodemodUpdateInput, CodemodUncheckedUpdateInput>
    /**
     * Choose, which Codemod to update.
     */
    where: CodemodWhereUniqueInput
  }

  /**
   * Codemod updateMany
   */
  export type CodemodUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Codemods.
     */
    data: XOR<CodemodUpdateManyMutationInput, CodemodUncheckedUpdateManyInput>
    /**
     * Filter which Codemods to update
     */
    where?: CodemodWhereInput
  }

  /**
   * Codemod upsert
   */
  export type CodemodUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * The filter to search for the Codemod to update in case it exists.
     */
    where: CodemodWhereUniqueInput
    /**
     * In case the Codemod found by the `where` argument doesn't exist, create a new Codemod with this data.
     */
    create: XOR<CodemodCreateInput, CodemodUncheckedCreateInput>
    /**
     * In case the Codemod was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CodemodUpdateInput, CodemodUncheckedUpdateInput>
  }

  /**
   * Codemod delete
   */
  export type CodemodDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
    /**
     * Filter which Codemod to delete.
     */
    where: CodemodWhereUniqueInput
  }

  /**
   * Codemod deleteMany
   */
  export type CodemodDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Codemods to delete
     */
    where?: CodemodWhereInput
  }

  /**
   * Codemod.versions
   */
  export type Codemod$versionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    where?: CodemodVersionWhereInput
    orderBy?: CodemodVersionOrderByWithRelationInput | CodemodVersionOrderByWithRelationInput[]
    cursor?: CodemodVersionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CodemodVersionScalarFieldEnum | CodemodVersionScalarFieldEnum[]
  }

  /**
   * Codemod without action
   */
  export type CodemodDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Codemod
     */
    select?: CodemodSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodInclude<ExtArgs> | null
  }


  /**
   * Model CodemodVersion
   */

  export type AggregateCodemodVersion = {
    _count: CodemodVersionCountAggregateOutputType | null
    _avg: CodemodVersionAvgAggregateOutputType | null
    _sum: CodemodVersionSumAggregateOutputType | null
    _min: CodemodVersionMinAggregateOutputType | null
    _max: CodemodVersionMaxAggregateOutputType | null
  }

  export type CodemodVersionAvgAggregateOutputType = {
    id: number | null
    amountOfUses: number | null
    totalTimeSaved: number | null
    openedPrs: number | null
    codemodId: number | null
  }

  export type CodemodVersionSumAggregateOutputType = {
    id: number | null
    amountOfUses: number | null
    totalTimeSaved: number | null
    openedPrs: number | null
    codemodId: number | null
  }

  export type CodemodVersionMinAggregateOutputType = {
    id: number | null
    version: string | null
    shortDescription: string | null
    engine: string | null
    vsCodeLink: string | null
    codemodStudioExampleLink: string | null
    testProjectCommand: string | null
    sourceRepo: string | null
    amountOfUses: number | null
    totalTimeSaved: number | null
    openedPrs: number | null
    s3Bucket: string | null
    s3UploadKey: string | null
    codemodId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CodemodVersionMaxAggregateOutputType = {
    id: number | null
    version: string | null
    shortDescription: string | null
    engine: string | null
    vsCodeLink: string | null
    codemodStudioExampleLink: string | null
    testProjectCommand: string | null
    sourceRepo: string | null
    amountOfUses: number | null
    totalTimeSaved: number | null
    openedPrs: number | null
    s3Bucket: string | null
    s3UploadKey: string | null
    codemodId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CodemodVersionCountAggregateOutputType = {
    id: number
    version: number
    shortDescription: number
    engine: number
    applicability: number
    arguments: number
    vsCodeLink: number
    codemodStudioExampleLink: number
    testProjectCommand: number
    sourceRepo: number
    amountOfUses: number
    totalTimeSaved: number
    openedPrs: number
    s3Bucket: number
    s3UploadKey: number
    tags: number
    codemodId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CodemodVersionAvgAggregateInputType = {
    id?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
    codemodId?: true
  }

  export type CodemodVersionSumAggregateInputType = {
    id?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
    codemodId?: true
  }

  export type CodemodVersionMinAggregateInputType = {
    id?: true
    version?: true
    shortDescription?: true
    engine?: true
    vsCodeLink?: true
    codemodStudioExampleLink?: true
    testProjectCommand?: true
    sourceRepo?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
    s3Bucket?: true
    s3UploadKey?: true
    codemodId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CodemodVersionMaxAggregateInputType = {
    id?: true
    version?: true
    shortDescription?: true
    engine?: true
    vsCodeLink?: true
    codemodStudioExampleLink?: true
    testProjectCommand?: true
    sourceRepo?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
    s3Bucket?: true
    s3UploadKey?: true
    codemodId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CodemodVersionCountAggregateInputType = {
    id?: true
    version?: true
    shortDescription?: true
    engine?: true
    applicability?: true
    arguments?: true
    vsCodeLink?: true
    codemodStudioExampleLink?: true
    testProjectCommand?: true
    sourceRepo?: true
    amountOfUses?: true
    totalTimeSaved?: true
    openedPrs?: true
    s3Bucket?: true
    s3UploadKey?: true
    tags?: true
    codemodId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CodemodVersionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CodemodVersion to aggregate.
     */
    where?: CodemodVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodemodVersions to fetch.
     */
    orderBy?: CodemodVersionOrderByWithRelationInput | CodemodVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CodemodVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodemodVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodemodVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CodemodVersions
    **/
    _count?: true | CodemodVersionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CodemodVersionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CodemodVersionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CodemodVersionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CodemodVersionMaxAggregateInputType
  }

  export type GetCodemodVersionAggregateType<T extends CodemodVersionAggregateArgs> = {
        [P in keyof T & keyof AggregateCodemodVersion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCodemodVersion[P]>
      : GetScalarType<T[P], AggregateCodemodVersion[P]>
  }




  export type CodemodVersionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodemodVersionWhereInput
    orderBy?: CodemodVersionOrderByWithAggregationInput | CodemodVersionOrderByWithAggregationInput[]
    by: CodemodVersionScalarFieldEnum[] | CodemodVersionScalarFieldEnum
    having?: CodemodVersionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CodemodVersionCountAggregateInputType | true
    _avg?: CodemodVersionAvgAggregateInputType
    _sum?: CodemodVersionSumAggregateInputType
    _min?: CodemodVersionMinAggregateInputType
    _max?: CodemodVersionMaxAggregateInputType
  }

  export type CodemodVersionGroupByOutputType = {
    id: number
    version: string
    shortDescription: string | null
    engine: string
    applicability: JsonValue | null
    arguments: JsonValue | null
    vsCodeLink: string
    codemodStudioExampleLink: string | null
    testProjectCommand: string | null
    sourceRepo: string | null
    amountOfUses: number
    totalTimeSaved: number
    openedPrs: number
    s3Bucket: string
    s3UploadKey: string
    tags: string[]
    codemodId: number
    createdAt: Date
    updatedAt: Date
    _count: CodemodVersionCountAggregateOutputType | null
    _avg: CodemodVersionAvgAggregateOutputType | null
    _sum: CodemodVersionSumAggregateOutputType | null
    _min: CodemodVersionMinAggregateOutputType | null
    _max: CodemodVersionMaxAggregateOutputType | null
  }

  type GetCodemodVersionGroupByPayload<T extends CodemodVersionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CodemodVersionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CodemodVersionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CodemodVersionGroupByOutputType[P]>
            : GetScalarType<T[P], CodemodVersionGroupByOutputType[P]>
        }
      >
    >


  export type CodemodVersionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    version?: boolean
    shortDescription?: boolean
    engine?: boolean
    applicability?: boolean
    arguments?: boolean
    vsCodeLink?: boolean
    codemodStudioExampleLink?: boolean
    testProjectCommand?: boolean
    sourceRepo?: boolean
    amountOfUses?: boolean
    totalTimeSaved?: boolean
    openedPrs?: boolean
    s3Bucket?: boolean
    s3UploadKey?: boolean
    tags?: boolean
    codemodId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    codemod?: boolean | CodemodDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["codemodVersion"]>

  export type CodemodVersionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    version?: boolean
    shortDescription?: boolean
    engine?: boolean
    applicability?: boolean
    arguments?: boolean
    vsCodeLink?: boolean
    codemodStudioExampleLink?: boolean
    testProjectCommand?: boolean
    sourceRepo?: boolean
    amountOfUses?: boolean
    totalTimeSaved?: boolean
    openedPrs?: boolean
    s3Bucket?: boolean
    s3UploadKey?: boolean
    tags?: boolean
    codemodId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    codemod?: boolean | CodemodDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["codemodVersion"]>

  export type CodemodVersionSelectScalar = {
    id?: boolean
    version?: boolean
    shortDescription?: boolean
    engine?: boolean
    applicability?: boolean
    arguments?: boolean
    vsCodeLink?: boolean
    codemodStudioExampleLink?: boolean
    testProjectCommand?: boolean
    sourceRepo?: boolean
    amountOfUses?: boolean
    totalTimeSaved?: boolean
    openedPrs?: boolean
    s3Bucket?: boolean
    s3UploadKey?: boolean
    tags?: boolean
    codemodId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CodemodVersionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    codemod?: boolean | CodemodDefaultArgs<ExtArgs>
  }
  export type CodemodVersionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    codemod?: boolean | CodemodDefaultArgs<ExtArgs>
  }

  export type $CodemodVersionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CodemodVersion"
    objects: {
      codemod: Prisma.$CodemodPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      version: string
      shortDescription: string | null
      engine: string
      applicability: Prisma.JsonValue | null
      arguments: Prisma.JsonValue | null
      vsCodeLink: string
      codemodStudioExampleLink: string | null
      testProjectCommand: string | null
      sourceRepo: string | null
      amountOfUses: number
      totalTimeSaved: number
      openedPrs: number
      s3Bucket: string
      s3UploadKey: string
      tags: string[]
      codemodId: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["codemodVersion"]>
    composites: {}
  }

  type CodemodVersionGetPayload<S extends boolean | null | undefined | CodemodVersionDefaultArgs> = $Result.GetResult<Prisma.$CodemodVersionPayload, S>

  type CodemodVersionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CodemodVersionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CodemodVersionCountAggregateInputType | true
    }

  export interface CodemodVersionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CodemodVersion'], meta: { name: 'CodemodVersion' } }
    /**
     * Find zero or one CodemodVersion that matches the filter.
     * @param {CodemodVersionFindUniqueArgs} args - Arguments to find a CodemodVersion
     * @example
     * // Get one CodemodVersion
     * const codemodVersion = await prisma.codemodVersion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends CodemodVersionFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodVersionFindUniqueArgs<ExtArgs>>
    ): Prisma__CodemodVersionClient<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one CodemodVersion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CodemodVersionFindUniqueOrThrowArgs} args - Arguments to find a CodemodVersion
     * @example
     * // Get one CodemodVersion
     * const codemodVersion = await prisma.codemodVersion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends CodemodVersionFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodVersionFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__CodemodVersionClient<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first CodemodVersion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodVersionFindFirstArgs} args - Arguments to find a CodemodVersion
     * @example
     * // Get one CodemodVersion
     * const codemodVersion = await prisma.codemodVersion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends CodemodVersionFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodVersionFindFirstArgs<ExtArgs>>
    ): Prisma__CodemodVersionClient<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first CodemodVersion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodVersionFindFirstOrThrowArgs} args - Arguments to find a CodemodVersion
     * @example
     * // Get one CodemodVersion
     * const codemodVersion = await prisma.codemodVersion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends CodemodVersionFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodVersionFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__CodemodVersionClient<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more CodemodVersions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodVersionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CodemodVersions
     * const codemodVersions = await prisma.codemodVersion.findMany()
     * 
     * // Get first 10 CodemodVersions
     * const codemodVersions = await prisma.codemodVersion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const codemodVersionWithIdOnly = await prisma.codemodVersion.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends CodemodVersionFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodVersionFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a CodemodVersion.
     * @param {CodemodVersionCreateArgs} args - Arguments to create a CodemodVersion.
     * @example
     * // Create one CodemodVersion
     * const CodemodVersion = await prisma.codemodVersion.create({
     *   data: {
     *     // ... data to create a CodemodVersion
     *   }
     * })
     * 
    **/
    create<T extends CodemodVersionCreateArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodVersionCreateArgs<ExtArgs>>
    ): Prisma__CodemodVersionClient<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many CodemodVersions.
     * @param {CodemodVersionCreateManyArgs} args - Arguments to create many CodemodVersions.
     * @example
     * // Create many CodemodVersions
     * const codemodVersion = await prisma.codemodVersion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends CodemodVersionCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodVersionCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CodemodVersions and returns the data saved in the database.
     * @param {CodemodVersionCreateManyAndReturnArgs} args - Arguments to create many CodemodVersions.
     * @example
     * // Create many CodemodVersions
     * const codemodVersion = await prisma.codemodVersion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CodemodVersions and only return the `id`
     * const codemodVersionWithIdOnly = await prisma.codemodVersion.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends CodemodVersionCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodVersionCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a CodemodVersion.
     * @param {CodemodVersionDeleteArgs} args - Arguments to delete one CodemodVersion.
     * @example
     * // Delete one CodemodVersion
     * const CodemodVersion = await prisma.codemodVersion.delete({
     *   where: {
     *     // ... filter to delete one CodemodVersion
     *   }
     * })
     * 
    **/
    delete<T extends CodemodVersionDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodVersionDeleteArgs<ExtArgs>>
    ): Prisma__CodemodVersionClient<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one CodemodVersion.
     * @param {CodemodVersionUpdateArgs} args - Arguments to update one CodemodVersion.
     * @example
     * // Update one CodemodVersion
     * const codemodVersion = await prisma.codemodVersion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends CodemodVersionUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodVersionUpdateArgs<ExtArgs>>
    ): Prisma__CodemodVersionClient<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more CodemodVersions.
     * @param {CodemodVersionDeleteManyArgs} args - Arguments to filter CodemodVersions to delete.
     * @example
     * // Delete a few CodemodVersions
     * const { count } = await prisma.codemodVersion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends CodemodVersionDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodemodVersionDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CodemodVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodVersionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CodemodVersions
     * const codemodVersion = await prisma.codemodVersion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends CodemodVersionUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodVersionUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CodemodVersion.
     * @param {CodemodVersionUpsertArgs} args - Arguments to update or create a CodemodVersion.
     * @example
     * // Update or create a CodemodVersion
     * const codemodVersion = await prisma.codemodVersion.upsert({
     *   create: {
     *     // ... data to create a CodemodVersion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CodemodVersion we want to update
     *   }
     * })
    **/
    upsert<T extends CodemodVersionUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, CodemodVersionUpsertArgs<ExtArgs>>
    ): Prisma__CodemodVersionClient<$Result.GetResult<Prisma.$CodemodVersionPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of CodemodVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodVersionCountArgs} args - Arguments to filter CodemodVersions to count.
     * @example
     * // Count the number of CodemodVersions
     * const count = await prisma.codemodVersion.count({
     *   where: {
     *     // ... the filter for the CodemodVersions we want to count
     *   }
     * })
    **/
    count<T extends CodemodVersionCountArgs>(
      args?: Subset<T, CodemodVersionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CodemodVersionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CodemodVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodVersionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CodemodVersionAggregateArgs>(args: Subset<T, CodemodVersionAggregateArgs>): Prisma.PrismaPromise<GetCodemodVersionAggregateType<T>>

    /**
     * Group by CodemodVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodemodVersionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CodemodVersionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CodemodVersionGroupByArgs['orderBy'] }
        : { orderBy?: CodemodVersionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CodemodVersionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCodemodVersionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CodemodVersion model
   */
  readonly fields: CodemodVersionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CodemodVersion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CodemodVersionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    codemod<T extends CodemodDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CodemodDefaultArgs<ExtArgs>>): Prisma__CodemodClient<$Result.GetResult<Prisma.$CodemodPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the CodemodVersion model
   */ 
  interface CodemodVersionFieldRefs {
    readonly id: FieldRef<"CodemodVersion", 'Int'>
    readonly version: FieldRef<"CodemodVersion", 'String'>
    readonly shortDescription: FieldRef<"CodemodVersion", 'String'>
    readonly engine: FieldRef<"CodemodVersion", 'String'>
    readonly applicability: FieldRef<"CodemodVersion", 'Json'>
    readonly arguments: FieldRef<"CodemodVersion", 'Json'>
    readonly vsCodeLink: FieldRef<"CodemodVersion", 'String'>
    readonly codemodStudioExampleLink: FieldRef<"CodemodVersion", 'String'>
    readonly testProjectCommand: FieldRef<"CodemodVersion", 'String'>
    readonly sourceRepo: FieldRef<"CodemodVersion", 'String'>
    readonly amountOfUses: FieldRef<"CodemodVersion", 'Int'>
    readonly totalTimeSaved: FieldRef<"CodemodVersion", 'Int'>
    readonly openedPrs: FieldRef<"CodemodVersion", 'Int'>
    readonly s3Bucket: FieldRef<"CodemodVersion", 'String'>
    readonly s3UploadKey: FieldRef<"CodemodVersion", 'String'>
    readonly tags: FieldRef<"CodemodVersion", 'String[]'>
    readonly codemodId: FieldRef<"CodemodVersion", 'Int'>
    readonly createdAt: FieldRef<"CodemodVersion", 'DateTime'>
    readonly updatedAt: FieldRef<"CodemodVersion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CodemodVersion findUnique
   */
  export type CodemodVersionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * Filter, which CodemodVersion to fetch.
     */
    where: CodemodVersionWhereUniqueInput
  }

  /**
   * CodemodVersion findUniqueOrThrow
   */
  export type CodemodVersionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * Filter, which CodemodVersion to fetch.
     */
    where: CodemodVersionWhereUniqueInput
  }

  /**
   * CodemodVersion findFirst
   */
  export type CodemodVersionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * Filter, which CodemodVersion to fetch.
     */
    where?: CodemodVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodemodVersions to fetch.
     */
    orderBy?: CodemodVersionOrderByWithRelationInput | CodemodVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CodemodVersions.
     */
    cursor?: CodemodVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodemodVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodemodVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CodemodVersions.
     */
    distinct?: CodemodVersionScalarFieldEnum | CodemodVersionScalarFieldEnum[]
  }

  /**
   * CodemodVersion findFirstOrThrow
   */
  export type CodemodVersionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * Filter, which CodemodVersion to fetch.
     */
    where?: CodemodVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodemodVersions to fetch.
     */
    orderBy?: CodemodVersionOrderByWithRelationInput | CodemodVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CodemodVersions.
     */
    cursor?: CodemodVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodemodVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodemodVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CodemodVersions.
     */
    distinct?: CodemodVersionScalarFieldEnum | CodemodVersionScalarFieldEnum[]
  }

  /**
   * CodemodVersion findMany
   */
  export type CodemodVersionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * Filter, which CodemodVersions to fetch.
     */
    where?: CodemodVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodemodVersions to fetch.
     */
    orderBy?: CodemodVersionOrderByWithRelationInput | CodemodVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CodemodVersions.
     */
    cursor?: CodemodVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodemodVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodemodVersions.
     */
    skip?: number
    distinct?: CodemodVersionScalarFieldEnum | CodemodVersionScalarFieldEnum[]
  }

  /**
   * CodemodVersion create
   */
  export type CodemodVersionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * The data needed to create a CodemodVersion.
     */
    data: XOR<CodemodVersionCreateInput, CodemodVersionUncheckedCreateInput>
  }

  /**
   * CodemodVersion createMany
   */
  export type CodemodVersionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CodemodVersions.
     */
    data: CodemodVersionCreateManyInput | CodemodVersionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CodemodVersion createManyAndReturn
   */
  export type CodemodVersionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CodemodVersions.
     */
    data: CodemodVersionCreateManyInput | CodemodVersionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CodemodVersion update
   */
  export type CodemodVersionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * The data needed to update a CodemodVersion.
     */
    data: XOR<CodemodVersionUpdateInput, CodemodVersionUncheckedUpdateInput>
    /**
     * Choose, which CodemodVersion to update.
     */
    where: CodemodVersionWhereUniqueInput
  }

  /**
   * CodemodVersion updateMany
   */
  export type CodemodVersionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CodemodVersions.
     */
    data: XOR<CodemodVersionUpdateManyMutationInput, CodemodVersionUncheckedUpdateManyInput>
    /**
     * Filter which CodemodVersions to update
     */
    where?: CodemodVersionWhereInput
  }

  /**
   * CodemodVersion upsert
   */
  export type CodemodVersionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * The filter to search for the CodemodVersion to update in case it exists.
     */
    where: CodemodVersionWhereUniqueInput
    /**
     * In case the CodemodVersion found by the `where` argument doesn't exist, create a new CodemodVersion with this data.
     */
    create: XOR<CodemodVersionCreateInput, CodemodVersionUncheckedCreateInput>
    /**
     * In case the CodemodVersion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CodemodVersionUpdateInput, CodemodVersionUncheckedUpdateInput>
  }

  /**
   * CodemodVersion delete
   */
  export type CodemodVersionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
    /**
     * Filter which CodemodVersion to delete.
     */
    where: CodemodVersionWhereUniqueInput
  }

  /**
   * CodemodVersion deleteMany
   */
  export type CodemodVersionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CodemodVersions to delete
     */
    where?: CodemodVersionWhereInput
  }

  /**
   * CodemodVersion without action
   */
  export type CodemodVersionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodemodVersion
     */
    select?: CodemodVersionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodemodVersionInclude<ExtArgs> | null
  }


  /**
   * Model Tag
   */

  export type AggregateTag = {
    _count: TagCountAggregateOutputType | null
    _avg: TagAvgAggregateOutputType | null
    _sum: TagSumAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  export type TagAvgAggregateOutputType = {
    id: number | null
  }

  export type TagSumAggregateOutputType = {
    id: number | null
  }

  export type TagMinAggregateOutputType = {
    id: number | null
    title: string | null
    classification: string | null
    displayName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TagMaxAggregateOutputType = {
    id: number | null
    title: string | null
    classification: string | null
    displayName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TagCountAggregateOutputType = {
    id: number
    title: number
    aliases: number
    classification: number
    displayName: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TagAvgAggregateInputType = {
    id?: true
  }

  export type TagSumAggregateInputType = {
    id?: true
  }

  export type TagMinAggregateInputType = {
    id?: true
    title?: true
    classification?: true
    displayName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TagMaxAggregateInputType = {
    id?: true
    title?: true
    classification?: true
    displayName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TagCountAggregateInputType = {
    id?: true
    title?: true
    aliases?: true
    classification?: true
    displayName?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tag to aggregate.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tags
    **/
    _count?: true | TagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TagAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TagSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TagMaxAggregateInputType
  }

  export type GetTagAggregateType<T extends TagAggregateArgs> = {
        [P in keyof T & keyof AggregateTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTag[P]>
      : GetScalarType<T[P], AggregateTag[P]>
  }




  export type TagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
    orderBy?: TagOrderByWithAggregationInput | TagOrderByWithAggregationInput[]
    by: TagScalarFieldEnum[] | TagScalarFieldEnum
    having?: TagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TagCountAggregateInputType | true
    _avg?: TagAvgAggregateInputType
    _sum?: TagSumAggregateInputType
    _min?: TagMinAggregateInputType
    _max?: TagMaxAggregateInputType
  }

  export type TagGroupByOutputType = {
    id: number
    title: string
    aliases: string[]
    classification: string
    displayName: string
    createdAt: Date
    updatedAt: Date
    _count: TagCountAggregateOutputType | null
    _avg: TagAvgAggregateOutputType | null
    _sum: TagSumAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  type GetTagGroupByPayload<T extends TagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TagGroupByOutputType[P]>
            : GetScalarType<T[P], TagGroupByOutputType[P]>
        }
      >
    >


  export type TagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    aliases?: boolean
    classification?: boolean
    displayName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tag"]>

  export type TagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    aliases?: boolean
    classification?: boolean
    displayName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tag"]>

  export type TagSelectScalar = {
    id?: boolean
    title?: boolean
    aliases?: boolean
    classification?: boolean
    displayName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $TagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tag"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      title: string
      aliases: string[]
      classification: string
      displayName: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tag"]>
    composites: {}
  }

  type TagGetPayload<S extends boolean | null | undefined | TagDefaultArgs> = $Result.GetResult<Prisma.$TagPayload, S>

  type TagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TagFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TagCountAggregateInputType | true
    }

  export interface TagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tag'], meta: { name: 'Tag' } }
    /**
     * Find zero or one Tag that matches the filter.
     * @param {TagFindUniqueArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends TagFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, TagFindUniqueArgs<ExtArgs>>
    ): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Tag that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TagFindUniqueOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends TagFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, TagFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Tag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends TagFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, TagFindFirstArgs<ExtArgs>>
    ): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Tag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends TagFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, TagFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Tags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tags
     * const tags = await prisma.tag.findMany()
     * 
     * // Get first 10 Tags
     * const tags = await prisma.tag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tagWithIdOnly = await prisma.tag.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends TagFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, TagFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Tag.
     * @param {TagCreateArgs} args - Arguments to create a Tag.
     * @example
     * // Create one Tag
     * const Tag = await prisma.tag.create({
     *   data: {
     *     // ... data to create a Tag
     *   }
     * })
     * 
    **/
    create<T extends TagCreateArgs<ExtArgs>>(
      args: SelectSubset<T, TagCreateArgs<ExtArgs>>
    ): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Tags.
     * @param {TagCreateManyArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends TagCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, TagCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tags and returns the data saved in the database.
     * @param {TagCreateManyAndReturnArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tags and only return the `id`
     * const tagWithIdOnly = await prisma.tag.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends TagCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, TagCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a Tag.
     * @param {TagDeleteArgs} args - Arguments to delete one Tag.
     * @example
     * // Delete one Tag
     * const Tag = await prisma.tag.delete({
     *   where: {
     *     // ... filter to delete one Tag
     *   }
     * })
     * 
    **/
    delete<T extends TagDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, TagDeleteArgs<ExtArgs>>
    ): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Tag.
     * @param {TagUpdateArgs} args - Arguments to update one Tag.
     * @example
     * // Update one Tag
     * const tag = await prisma.tag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends TagUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, TagUpdateArgs<ExtArgs>>
    ): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Tags.
     * @param {TagDeleteManyArgs} args - Arguments to filter Tags to delete.
     * @example
     * // Delete a few Tags
     * const { count } = await prisma.tag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends TagDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, TagDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tags
     * const tag = await prisma.tag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends TagUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, TagUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tag.
     * @param {TagUpsertArgs} args - Arguments to update or create a Tag.
     * @example
     * // Update or create a Tag
     * const tag = await prisma.tag.upsert({
     *   create: {
     *     // ... data to create a Tag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tag we want to update
     *   }
     * })
    **/
    upsert<T extends TagUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, TagUpsertArgs<ExtArgs>>
    ): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagCountArgs} args - Arguments to filter Tags to count.
     * @example
     * // Count the number of Tags
     * const count = await prisma.tag.count({
     *   where: {
     *     // ... the filter for the Tags we want to count
     *   }
     * })
    **/
    count<T extends TagCountArgs>(
      args?: Subset<T, TagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TagAggregateArgs>(args: Subset<T, TagAggregateArgs>): Prisma.PrismaPromise<GetTagAggregateType<T>>

    /**
     * Group by Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TagGroupByArgs['orderBy'] }
        : { orderBy?: TagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tag model
   */
  readonly fields: TagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the Tag model
   */ 
  interface TagFieldRefs {
    readonly id: FieldRef<"Tag", 'Int'>
    readonly title: FieldRef<"Tag", 'String'>
    readonly aliases: FieldRef<"Tag", 'String[]'>
    readonly classification: FieldRef<"Tag", 'String'>
    readonly displayName: FieldRef<"Tag", 'String'>
    readonly createdAt: FieldRef<"Tag", 'DateTime'>
    readonly updatedAt: FieldRef<"Tag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tag findUnique
   */
  export type TagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findUniqueOrThrow
   */
  export type TagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findFirst
   */
  export type TagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findFirstOrThrow
   */
  export type TagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findMany
   */
  export type TagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Filter, which Tags to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag create
   */
  export type TagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * The data needed to create a Tag.
     */
    data: XOR<TagCreateInput, TagUncheckedCreateInput>
  }

  /**
   * Tag createMany
   */
  export type TagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag createManyAndReturn
   */
  export type TagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag update
   */
  export type TagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * The data needed to update a Tag.
     */
    data: XOR<TagUpdateInput, TagUncheckedUpdateInput>
    /**
     * Choose, which Tag to update.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag updateMany
   */
  export type TagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tags.
     */
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyInput>
    /**
     * Filter which Tags to update
     */
    where?: TagWhereInput
  }

  /**
   * Tag upsert
   */
  export type TagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * The filter to search for the Tag to update in case it exists.
     */
    where: TagWhereUniqueInput
    /**
     * In case the Tag found by the `where` argument doesn't exist, create a new Tag with this data.
     */
    create: XOR<TagCreateInput, TagUncheckedCreateInput>
    /**
     * In case the Tag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TagUpdateInput, TagUncheckedUpdateInput>
  }

  /**
   * Tag delete
   */
  export type TagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Filter which Tag to delete.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag deleteMany
   */
  export type TagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tags to delete
     */
    where?: TagWhereInput
  }

  /**
   * Tag without action
   */
  export type TagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
  }


  /**
   * Model UserLoginIntent
   */

  export type AggregateUserLoginIntent = {
    _count: UserLoginIntentCountAggregateOutputType | null
    _min: UserLoginIntentMinAggregateOutputType | null
    _max: UserLoginIntentMaxAggregateOutputType | null
  }

  export type UserLoginIntentMinAggregateOutputType = {
    id: string | null
    token: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserLoginIntentMaxAggregateOutputType = {
    id: string | null
    token: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserLoginIntentCountAggregateOutputType = {
    id: number
    token: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserLoginIntentMinAggregateInputType = {
    id?: true
    token?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserLoginIntentMaxAggregateInputType = {
    id?: true
    token?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserLoginIntentCountAggregateInputType = {
    id?: true
    token?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserLoginIntentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserLoginIntent to aggregate.
     */
    where?: UserLoginIntentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserLoginIntents to fetch.
     */
    orderBy?: UserLoginIntentOrderByWithRelationInput | UserLoginIntentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserLoginIntentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserLoginIntents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserLoginIntents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserLoginIntents
    **/
    _count?: true | UserLoginIntentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserLoginIntentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserLoginIntentMaxAggregateInputType
  }

  export type GetUserLoginIntentAggregateType<T extends UserLoginIntentAggregateArgs> = {
        [P in keyof T & keyof AggregateUserLoginIntent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserLoginIntent[P]>
      : GetScalarType<T[P], AggregateUserLoginIntent[P]>
  }




  export type UserLoginIntentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserLoginIntentWhereInput
    orderBy?: UserLoginIntentOrderByWithAggregationInput | UserLoginIntentOrderByWithAggregationInput[]
    by: UserLoginIntentScalarFieldEnum[] | UserLoginIntentScalarFieldEnum
    having?: UserLoginIntentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserLoginIntentCountAggregateInputType | true
    _min?: UserLoginIntentMinAggregateInputType
    _max?: UserLoginIntentMaxAggregateInputType
  }

  export type UserLoginIntentGroupByOutputType = {
    id: string
    token: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserLoginIntentCountAggregateOutputType | null
    _min: UserLoginIntentMinAggregateOutputType | null
    _max: UserLoginIntentMaxAggregateOutputType | null
  }

  type GetUserLoginIntentGroupByPayload<T extends UserLoginIntentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserLoginIntentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserLoginIntentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserLoginIntentGroupByOutputType[P]>
            : GetScalarType<T[P], UserLoginIntentGroupByOutputType[P]>
        }
      >
    >


  export type UserLoginIntentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userLoginIntent"]>

  export type UserLoginIntentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userLoginIntent"]>

  export type UserLoginIntentSelectScalar = {
    id?: boolean
    token?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $UserLoginIntentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserLoginIntent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      token: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userLoginIntent"]>
    composites: {}
  }

  type UserLoginIntentGetPayload<S extends boolean | null | undefined | UserLoginIntentDefaultArgs> = $Result.GetResult<Prisma.$UserLoginIntentPayload, S>

  type UserLoginIntentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserLoginIntentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserLoginIntentCountAggregateInputType | true
    }

  export interface UserLoginIntentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserLoginIntent'], meta: { name: 'UserLoginIntent' } }
    /**
     * Find zero or one UserLoginIntent that matches the filter.
     * @param {UserLoginIntentFindUniqueArgs} args - Arguments to find a UserLoginIntent
     * @example
     * // Get one UserLoginIntent
     * const userLoginIntent = await prisma.userLoginIntent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends UserLoginIntentFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, UserLoginIntentFindUniqueArgs<ExtArgs>>
    ): Prisma__UserLoginIntentClient<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one UserLoginIntent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserLoginIntentFindUniqueOrThrowArgs} args - Arguments to find a UserLoginIntent
     * @example
     * // Get one UserLoginIntent
     * const userLoginIntent = await prisma.userLoginIntent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends UserLoginIntentFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, UserLoginIntentFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__UserLoginIntentClient<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first UserLoginIntent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLoginIntentFindFirstArgs} args - Arguments to find a UserLoginIntent
     * @example
     * // Get one UserLoginIntent
     * const userLoginIntent = await prisma.userLoginIntent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends UserLoginIntentFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, UserLoginIntentFindFirstArgs<ExtArgs>>
    ): Prisma__UserLoginIntentClient<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first UserLoginIntent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLoginIntentFindFirstOrThrowArgs} args - Arguments to find a UserLoginIntent
     * @example
     * // Get one UserLoginIntent
     * const userLoginIntent = await prisma.userLoginIntent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends UserLoginIntentFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, UserLoginIntentFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__UserLoginIntentClient<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more UserLoginIntents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLoginIntentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserLoginIntents
     * const userLoginIntents = await prisma.userLoginIntent.findMany()
     * 
     * // Get first 10 UserLoginIntents
     * const userLoginIntents = await prisma.userLoginIntent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userLoginIntentWithIdOnly = await prisma.userLoginIntent.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends UserLoginIntentFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, UserLoginIntentFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a UserLoginIntent.
     * @param {UserLoginIntentCreateArgs} args - Arguments to create a UserLoginIntent.
     * @example
     * // Create one UserLoginIntent
     * const UserLoginIntent = await prisma.userLoginIntent.create({
     *   data: {
     *     // ... data to create a UserLoginIntent
     *   }
     * })
     * 
    **/
    create<T extends UserLoginIntentCreateArgs<ExtArgs>>(
      args: SelectSubset<T, UserLoginIntentCreateArgs<ExtArgs>>
    ): Prisma__UserLoginIntentClient<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many UserLoginIntents.
     * @param {UserLoginIntentCreateManyArgs} args - Arguments to create many UserLoginIntents.
     * @example
     * // Create many UserLoginIntents
     * const userLoginIntent = await prisma.userLoginIntent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends UserLoginIntentCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, UserLoginIntentCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserLoginIntents and returns the data saved in the database.
     * @param {UserLoginIntentCreateManyAndReturnArgs} args - Arguments to create many UserLoginIntents.
     * @example
     * // Create many UserLoginIntents
     * const userLoginIntent = await prisma.userLoginIntent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserLoginIntents and only return the `id`
     * const userLoginIntentWithIdOnly = await prisma.userLoginIntent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends UserLoginIntentCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, UserLoginIntentCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a UserLoginIntent.
     * @param {UserLoginIntentDeleteArgs} args - Arguments to delete one UserLoginIntent.
     * @example
     * // Delete one UserLoginIntent
     * const UserLoginIntent = await prisma.userLoginIntent.delete({
     *   where: {
     *     // ... filter to delete one UserLoginIntent
     *   }
     * })
     * 
    **/
    delete<T extends UserLoginIntentDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, UserLoginIntentDeleteArgs<ExtArgs>>
    ): Prisma__UserLoginIntentClient<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one UserLoginIntent.
     * @param {UserLoginIntentUpdateArgs} args - Arguments to update one UserLoginIntent.
     * @example
     * // Update one UserLoginIntent
     * const userLoginIntent = await prisma.userLoginIntent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends UserLoginIntentUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, UserLoginIntentUpdateArgs<ExtArgs>>
    ): Prisma__UserLoginIntentClient<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more UserLoginIntents.
     * @param {UserLoginIntentDeleteManyArgs} args - Arguments to filter UserLoginIntents to delete.
     * @example
     * // Delete a few UserLoginIntents
     * const { count } = await prisma.userLoginIntent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends UserLoginIntentDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, UserLoginIntentDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserLoginIntents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLoginIntentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserLoginIntents
     * const userLoginIntent = await prisma.userLoginIntent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends UserLoginIntentUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, UserLoginIntentUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserLoginIntent.
     * @param {UserLoginIntentUpsertArgs} args - Arguments to update or create a UserLoginIntent.
     * @example
     * // Update or create a UserLoginIntent
     * const userLoginIntent = await prisma.userLoginIntent.upsert({
     *   create: {
     *     // ... data to create a UserLoginIntent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserLoginIntent we want to update
     *   }
     * })
    **/
    upsert<T extends UserLoginIntentUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, UserLoginIntentUpsertArgs<ExtArgs>>
    ): Prisma__UserLoginIntentClient<$Result.GetResult<Prisma.$UserLoginIntentPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of UserLoginIntents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLoginIntentCountArgs} args - Arguments to filter UserLoginIntents to count.
     * @example
     * // Count the number of UserLoginIntents
     * const count = await prisma.userLoginIntent.count({
     *   where: {
     *     // ... the filter for the UserLoginIntents we want to count
     *   }
     * })
    **/
    count<T extends UserLoginIntentCountArgs>(
      args?: Subset<T, UserLoginIntentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserLoginIntentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserLoginIntent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLoginIntentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserLoginIntentAggregateArgs>(args: Subset<T, UserLoginIntentAggregateArgs>): Prisma.PrismaPromise<GetUserLoginIntentAggregateType<T>>

    /**
     * Group by UserLoginIntent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLoginIntentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserLoginIntentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserLoginIntentGroupByArgs['orderBy'] }
        : { orderBy?: UserLoginIntentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserLoginIntentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserLoginIntentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserLoginIntent model
   */
  readonly fields: UserLoginIntentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserLoginIntent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserLoginIntentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the UserLoginIntent model
   */ 
  interface UserLoginIntentFieldRefs {
    readonly id: FieldRef<"UserLoginIntent", 'String'>
    readonly token: FieldRef<"UserLoginIntent", 'String'>
    readonly createdAt: FieldRef<"UserLoginIntent", 'DateTime'>
    readonly updatedAt: FieldRef<"UserLoginIntent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserLoginIntent findUnique
   */
  export type UserLoginIntentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * Filter, which UserLoginIntent to fetch.
     */
    where: UserLoginIntentWhereUniqueInput
  }

  /**
   * UserLoginIntent findUniqueOrThrow
   */
  export type UserLoginIntentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * Filter, which UserLoginIntent to fetch.
     */
    where: UserLoginIntentWhereUniqueInput
  }

  /**
   * UserLoginIntent findFirst
   */
  export type UserLoginIntentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * Filter, which UserLoginIntent to fetch.
     */
    where?: UserLoginIntentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserLoginIntents to fetch.
     */
    orderBy?: UserLoginIntentOrderByWithRelationInput | UserLoginIntentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserLoginIntents.
     */
    cursor?: UserLoginIntentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserLoginIntents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserLoginIntents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserLoginIntents.
     */
    distinct?: UserLoginIntentScalarFieldEnum | UserLoginIntentScalarFieldEnum[]
  }

  /**
   * UserLoginIntent findFirstOrThrow
   */
  export type UserLoginIntentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * Filter, which UserLoginIntent to fetch.
     */
    where?: UserLoginIntentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserLoginIntents to fetch.
     */
    orderBy?: UserLoginIntentOrderByWithRelationInput | UserLoginIntentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserLoginIntents.
     */
    cursor?: UserLoginIntentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserLoginIntents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserLoginIntents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserLoginIntents.
     */
    distinct?: UserLoginIntentScalarFieldEnum | UserLoginIntentScalarFieldEnum[]
  }

  /**
   * UserLoginIntent findMany
   */
  export type UserLoginIntentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * Filter, which UserLoginIntents to fetch.
     */
    where?: UserLoginIntentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserLoginIntents to fetch.
     */
    orderBy?: UserLoginIntentOrderByWithRelationInput | UserLoginIntentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserLoginIntents.
     */
    cursor?: UserLoginIntentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserLoginIntents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserLoginIntents.
     */
    skip?: number
    distinct?: UserLoginIntentScalarFieldEnum | UserLoginIntentScalarFieldEnum[]
  }

  /**
   * UserLoginIntent create
   */
  export type UserLoginIntentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * The data needed to create a UserLoginIntent.
     */
    data?: XOR<UserLoginIntentCreateInput, UserLoginIntentUncheckedCreateInput>
  }

  /**
   * UserLoginIntent createMany
   */
  export type UserLoginIntentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserLoginIntents.
     */
    data: UserLoginIntentCreateManyInput | UserLoginIntentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserLoginIntent createManyAndReturn
   */
  export type UserLoginIntentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserLoginIntents.
     */
    data: UserLoginIntentCreateManyInput | UserLoginIntentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserLoginIntent update
   */
  export type UserLoginIntentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * The data needed to update a UserLoginIntent.
     */
    data: XOR<UserLoginIntentUpdateInput, UserLoginIntentUncheckedUpdateInput>
    /**
     * Choose, which UserLoginIntent to update.
     */
    where: UserLoginIntentWhereUniqueInput
  }

  /**
   * UserLoginIntent updateMany
   */
  export type UserLoginIntentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserLoginIntents.
     */
    data: XOR<UserLoginIntentUpdateManyMutationInput, UserLoginIntentUncheckedUpdateManyInput>
    /**
     * Filter which UserLoginIntents to update
     */
    where?: UserLoginIntentWhereInput
  }

  /**
   * UserLoginIntent upsert
   */
  export type UserLoginIntentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * The filter to search for the UserLoginIntent to update in case it exists.
     */
    where: UserLoginIntentWhereUniqueInput
    /**
     * In case the UserLoginIntent found by the `where` argument doesn't exist, create a new UserLoginIntent with this data.
     */
    create: XOR<UserLoginIntentCreateInput, UserLoginIntentUncheckedCreateInput>
    /**
     * In case the UserLoginIntent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserLoginIntentUpdateInput, UserLoginIntentUncheckedUpdateInput>
  }

  /**
   * UserLoginIntent delete
   */
  export type UserLoginIntentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
    /**
     * Filter which UserLoginIntent to delete.
     */
    where: UserLoginIntentWhereUniqueInput
  }

  /**
   * UserLoginIntent deleteMany
   */
  export type UserLoginIntentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserLoginIntents to delete
     */
    where?: UserLoginIntentWhereInput
  }

  /**
   * UserLoginIntent without action
   */
  export type UserLoginIntentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLoginIntent
     */
    select?: UserLoginIntentSelect<ExtArgs> | null
  }


  /**
   * Model CodeDiff
   */

  export type AggregateCodeDiff = {
    _count: CodeDiffCountAggregateOutputType | null
    _min: CodeDiffMinAggregateOutputType | null
    _max: CodeDiffMaxAggregateOutputType | null
  }

  export type CodeDiffMinAggregateOutputType = {
    id: string | null
    name: string | null
    source: string | null
    before: string | null
    after: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CodeDiffMaxAggregateOutputType = {
    id: string | null
    name: string | null
    source: string | null
    before: string | null
    after: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CodeDiffCountAggregateOutputType = {
    id: number
    name: number
    source: number
    before: number
    after: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CodeDiffMinAggregateInputType = {
    id?: true
    name?: true
    source?: true
    before?: true
    after?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CodeDiffMaxAggregateInputType = {
    id?: true
    name?: true
    source?: true
    before?: true
    after?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CodeDiffCountAggregateInputType = {
    id?: true
    name?: true
    source?: true
    before?: true
    after?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CodeDiffAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CodeDiff to aggregate.
     */
    where?: CodeDiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodeDiffs to fetch.
     */
    orderBy?: CodeDiffOrderByWithRelationInput | CodeDiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CodeDiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodeDiffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodeDiffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CodeDiffs
    **/
    _count?: true | CodeDiffCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CodeDiffMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CodeDiffMaxAggregateInputType
  }

  export type GetCodeDiffAggregateType<T extends CodeDiffAggregateArgs> = {
        [P in keyof T & keyof AggregateCodeDiff]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCodeDiff[P]>
      : GetScalarType<T[P], AggregateCodeDiff[P]>
  }




  export type CodeDiffGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodeDiffWhereInput
    orderBy?: CodeDiffOrderByWithAggregationInput | CodeDiffOrderByWithAggregationInput[]
    by: CodeDiffScalarFieldEnum[] | CodeDiffScalarFieldEnum
    having?: CodeDiffScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CodeDiffCountAggregateInputType | true
    _min?: CodeDiffMinAggregateInputType
    _max?: CodeDiffMaxAggregateInputType
  }

  export type CodeDiffGroupByOutputType = {
    id: string
    name: string | null
    source: string
    before: string
    after: string
    createdAt: Date
    updatedAt: Date
    _count: CodeDiffCountAggregateOutputType | null
    _min: CodeDiffMinAggregateOutputType | null
    _max: CodeDiffMaxAggregateOutputType | null
  }

  type GetCodeDiffGroupByPayload<T extends CodeDiffGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CodeDiffGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CodeDiffGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CodeDiffGroupByOutputType[P]>
            : GetScalarType<T[P], CodeDiffGroupByOutputType[P]>
        }
      >
    >


  export type CodeDiffSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    source?: boolean
    before?: boolean
    after?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["codeDiff"]>

  export type CodeDiffSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    source?: boolean
    before?: boolean
    after?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["codeDiff"]>

  export type CodeDiffSelectScalar = {
    id?: boolean
    name?: boolean
    source?: boolean
    before?: boolean
    after?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $CodeDiffPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CodeDiff"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string | null
      source: string
      before: string
      after: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["codeDiff"]>
    composites: {}
  }

  type CodeDiffGetPayload<S extends boolean | null | undefined | CodeDiffDefaultArgs> = $Result.GetResult<Prisma.$CodeDiffPayload, S>

  type CodeDiffCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CodeDiffFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CodeDiffCountAggregateInputType | true
    }

  export interface CodeDiffDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CodeDiff'], meta: { name: 'CodeDiff' } }
    /**
     * Find zero or one CodeDiff that matches the filter.
     * @param {CodeDiffFindUniqueArgs} args - Arguments to find a CodeDiff
     * @example
     * // Get one CodeDiff
     * const codeDiff = await prisma.codeDiff.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends CodeDiffFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, CodeDiffFindUniqueArgs<ExtArgs>>
    ): Prisma__CodeDiffClient<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one CodeDiff that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CodeDiffFindUniqueOrThrowArgs} args - Arguments to find a CodeDiff
     * @example
     * // Get one CodeDiff
     * const codeDiff = await prisma.codeDiff.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends CodeDiffFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CodeDiffFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__CodeDiffClient<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first CodeDiff that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeDiffFindFirstArgs} args - Arguments to find a CodeDiff
     * @example
     * // Get one CodeDiff
     * const codeDiff = await prisma.codeDiff.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends CodeDiffFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, CodeDiffFindFirstArgs<ExtArgs>>
    ): Prisma__CodeDiffClient<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first CodeDiff that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeDiffFindFirstOrThrowArgs} args - Arguments to find a CodeDiff
     * @example
     * // Get one CodeDiff
     * const codeDiff = await prisma.codeDiff.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends CodeDiffFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CodeDiffFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__CodeDiffClient<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more CodeDiffs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeDiffFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CodeDiffs
     * const codeDiffs = await prisma.codeDiff.findMany()
     * 
     * // Get first 10 CodeDiffs
     * const codeDiffs = await prisma.codeDiff.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const codeDiffWithIdOnly = await prisma.codeDiff.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends CodeDiffFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodeDiffFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a CodeDiff.
     * @param {CodeDiffCreateArgs} args - Arguments to create a CodeDiff.
     * @example
     * // Create one CodeDiff
     * const CodeDiff = await prisma.codeDiff.create({
     *   data: {
     *     // ... data to create a CodeDiff
     *   }
     * })
     * 
    **/
    create<T extends CodeDiffCreateArgs<ExtArgs>>(
      args: SelectSubset<T, CodeDiffCreateArgs<ExtArgs>>
    ): Prisma__CodeDiffClient<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many CodeDiffs.
     * @param {CodeDiffCreateManyArgs} args - Arguments to create many CodeDiffs.
     * @example
     * // Create many CodeDiffs
     * const codeDiff = await prisma.codeDiff.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends CodeDiffCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodeDiffCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CodeDiffs and returns the data saved in the database.
     * @param {CodeDiffCreateManyAndReturnArgs} args - Arguments to create many CodeDiffs.
     * @example
     * // Create many CodeDiffs
     * const codeDiff = await prisma.codeDiff.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CodeDiffs and only return the `id`
     * const codeDiffWithIdOnly = await prisma.codeDiff.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends CodeDiffCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, CodeDiffCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a CodeDiff.
     * @param {CodeDiffDeleteArgs} args - Arguments to delete one CodeDiff.
     * @example
     * // Delete one CodeDiff
     * const CodeDiff = await prisma.codeDiff.delete({
     *   where: {
     *     // ... filter to delete one CodeDiff
     *   }
     * })
     * 
    **/
    delete<T extends CodeDiffDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, CodeDiffDeleteArgs<ExtArgs>>
    ): Prisma__CodeDiffClient<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one CodeDiff.
     * @param {CodeDiffUpdateArgs} args - Arguments to update one CodeDiff.
     * @example
     * // Update one CodeDiff
     * const codeDiff = await prisma.codeDiff.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends CodeDiffUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, CodeDiffUpdateArgs<ExtArgs>>
    ): Prisma__CodeDiffClient<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more CodeDiffs.
     * @param {CodeDiffDeleteManyArgs} args - Arguments to filter CodeDiffs to delete.
     * @example
     * // Delete a few CodeDiffs
     * const { count } = await prisma.codeDiff.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends CodeDiffDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CodeDiffDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CodeDiffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeDiffUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CodeDiffs
     * const codeDiff = await prisma.codeDiff.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends CodeDiffUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, CodeDiffUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CodeDiff.
     * @param {CodeDiffUpsertArgs} args - Arguments to update or create a CodeDiff.
     * @example
     * // Update or create a CodeDiff
     * const codeDiff = await prisma.codeDiff.upsert({
     *   create: {
     *     // ... data to create a CodeDiff
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CodeDiff we want to update
     *   }
     * })
    **/
    upsert<T extends CodeDiffUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, CodeDiffUpsertArgs<ExtArgs>>
    ): Prisma__CodeDiffClient<$Result.GetResult<Prisma.$CodeDiffPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of CodeDiffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeDiffCountArgs} args - Arguments to filter CodeDiffs to count.
     * @example
     * // Count the number of CodeDiffs
     * const count = await prisma.codeDiff.count({
     *   where: {
     *     // ... the filter for the CodeDiffs we want to count
     *   }
     * })
    **/
    count<T extends CodeDiffCountArgs>(
      args?: Subset<T, CodeDiffCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CodeDiffCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CodeDiff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeDiffAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CodeDiffAggregateArgs>(args: Subset<T, CodeDiffAggregateArgs>): Prisma.PrismaPromise<GetCodeDiffAggregateType<T>>

    /**
     * Group by CodeDiff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeDiffGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CodeDiffGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CodeDiffGroupByArgs['orderBy'] }
        : { orderBy?: CodeDiffGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CodeDiffGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCodeDiffGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CodeDiff model
   */
  readonly fields: CodeDiffFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CodeDiff.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CodeDiffClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the CodeDiff model
   */ 
  interface CodeDiffFieldRefs {
    readonly id: FieldRef<"CodeDiff", 'String'>
    readonly name: FieldRef<"CodeDiff", 'String'>
    readonly source: FieldRef<"CodeDiff", 'String'>
    readonly before: FieldRef<"CodeDiff", 'String'>
    readonly after: FieldRef<"CodeDiff", 'String'>
    readonly createdAt: FieldRef<"CodeDiff", 'DateTime'>
    readonly updatedAt: FieldRef<"CodeDiff", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CodeDiff findUnique
   */
  export type CodeDiffFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * Filter, which CodeDiff to fetch.
     */
    where: CodeDiffWhereUniqueInput
  }

  /**
   * CodeDiff findUniqueOrThrow
   */
  export type CodeDiffFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * Filter, which CodeDiff to fetch.
     */
    where: CodeDiffWhereUniqueInput
  }

  /**
   * CodeDiff findFirst
   */
  export type CodeDiffFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * Filter, which CodeDiff to fetch.
     */
    where?: CodeDiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodeDiffs to fetch.
     */
    orderBy?: CodeDiffOrderByWithRelationInput | CodeDiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CodeDiffs.
     */
    cursor?: CodeDiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodeDiffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodeDiffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CodeDiffs.
     */
    distinct?: CodeDiffScalarFieldEnum | CodeDiffScalarFieldEnum[]
  }

  /**
   * CodeDiff findFirstOrThrow
   */
  export type CodeDiffFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * Filter, which CodeDiff to fetch.
     */
    where?: CodeDiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodeDiffs to fetch.
     */
    orderBy?: CodeDiffOrderByWithRelationInput | CodeDiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CodeDiffs.
     */
    cursor?: CodeDiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodeDiffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodeDiffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CodeDiffs.
     */
    distinct?: CodeDiffScalarFieldEnum | CodeDiffScalarFieldEnum[]
  }

  /**
   * CodeDiff findMany
   */
  export type CodeDiffFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * Filter, which CodeDiffs to fetch.
     */
    where?: CodeDiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodeDiffs to fetch.
     */
    orderBy?: CodeDiffOrderByWithRelationInput | CodeDiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CodeDiffs.
     */
    cursor?: CodeDiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodeDiffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodeDiffs.
     */
    skip?: number
    distinct?: CodeDiffScalarFieldEnum | CodeDiffScalarFieldEnum[]
  }

  /**
   * CodeDiff create
   */
  export type CodeDiffCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * The data needed to create a CodeDiff.
     */
    data: XOR<CodeDiffCreateInput, CodeDiffUncheckedCreateInput>
  }

  /**
   * CodeDiff createMany
   */
  export type CodeDiffCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CodeDiffs.
     */
    data: CodeDiffCreateManyInput | CodeDiffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CodeDiff createManyAndReturn
   */
  export type CodeDiffCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CodeDiffs.
     */
    data: CodeDiffCreateManyInput | CodeDiffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CodeDiff update
   */
  export type CodeDiffUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * The data needed to update a CodeDiff.
     */
    data: XOR<CodeDiffUpdateInput, CodeDiffUncheckedUpdateInput>
    /**
     * Choose, which CodeDiff to update.
     */
    where: CodeDiffWhereUniqueInput
  }

  /**
   * CodeDiff updateMany
   */
  export type CodeDiffUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CodeDiffs.
     */
    data: XOR<CodeDiffUpdateManyMutationInput, CodeDiffUncheckedUpdateManyInput>
    /**
     * Filter which CodeDiffs to update
     */
    where?: CodeDiffWhereInput
  }

  /**
   * CodeDiff upsert
   */
  export type CodeDiffUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * The filter to search for the CodeDiff to update in case it exists.
     */
    where: CodeDiffWhereUniqueInput
    /**
     * In case the CodeDiff found by the `where` argument doesn't exist, create a new CodeDiff with this data.
     */
    create: XOR<CodeDiffCreateInput, CodeDiffUncheckedCreateInput>
    /**
     * In case the CodeDiff was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CodeDiffUpdateInput, CodeDiffUncheckedUpdateInput>
  }

  /**
   * CodeDiff delete
   */
  export type CodeDiffDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
    /**
     * Filter which CodeDiff to delete.
     */
    where: CodeDiffWhereUniqueInput
  }

  /**
   * CodeDiff deleteMany
   */
  export type CodeDiffDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CodeDiffs to delete
     */
    where?: CodeDiffWhereInput
  }

  /**
   * CodeDiff without action
   */
  export type CodeDiffDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeDiff
     */
    select?: CodeDiffSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CodemodScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    shortDescription: 'shortDescription',
    tags: 'tags',
    engine: 'engine',
    applicability: 'applicability',
    arguments: 'arguments',
    name: 'name',
    featured: 'featured',
    verified: 'verified',
    private: 'private',
    author: 'author',
    totalRuns: 'totalRuns',
    amountOfUses: 'amountOfUses',
    totalTimeSaved: 'totalTimeSaved',
    openedPrs: 'openedPrs',
    labels: 'labels',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CodemodScalarFieldEnum = (typeof CodemodScalarFieldEnum)[keyof typeof CodemodScalarFieldEnum]


  export const CodemodVersionScalarFieldEnum: {
    id: 'id',
    version: 'version',
    shortDescription: 'shortDescription',
    engine: 'engine',
    applicability: 'applicability',
    arguments: 'arguments',
    vsCodeLink: 'vsCodeLink',
    codemodStudioExampleLink: 'codemodStudioExampleLink',
    testProjectCommand: 'testProjectCommand',
    sourceRepo: 'sourceRepo',
    amountOfUses: 'amountOfUses',
    totalTimeSaved: 'totalTimeSaved',
    openedPrs: 'openedPrs',
    s3Bucket: 's3Bucket',
    s3UploadKey: 's3UploadKey',
    tags: 'tags',
    codemodId: 'codemodId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CodemodVersionScalarFieldEnum = (typeof CodemodVersionScalarFieldEnum)[keyof typeof CodemodVersionScalarFieldEnum]


  export const TagScalarFieldEnum: {
    id: 'id',
    title: 'title',
    aliases: 'aliases',
    classification: 'classification',
    displayName: 'displayName',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TagScalarFieldEnum = (typeof TagScalarFieldEnum)[keyof typeof TagScalarFieldEnum]


  export const UserLoginIntentScalarFieldEnum: {
    id: 'id',
    token: 'token',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserLoginIntentScalarFieldEnum = (typeof UserLoginIntentScalarFieldEnum)[keyof typeof UserLoginIntentScalarFieldEnum]


  export const CodeDiffScalarFieldEnum: {
    id: 'id',
    name: 'name',
    source: 'source',
    before: 'before',
    after: 'after',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CodeDiffScalarFieldEnum = (typeof CodeDiffScalarFieldEnum)[keyof typeof CodeDiffScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CodemodWhereInput = {
    AND?: CodemodWhereInput | CodemodWhereInput[]
    OR?: CodemodWhereInput[]
    NOT?: CodemodWhereInput | CodemodWhereInput[]
    id?: IntFilter<"Codemod"> | number
    slug?: StringFilter<"Codemod"> | string
    shortDescription?: StringNullableFilter<"Codemod"> | string | null
    tags?: StringNullableListFilter<"Codemod">
    engine?: StringNullableFilter<"Codemod"> | string | null
    applicability?: JsonNullableFilter<"Codemod">
    arguments?: JsonNullableFilter<"Codemod">
    name?: StringFilter<"Codemod"> | string
    featured?: BoolFilter<"Codemod"> | boolean
    verified?: BoolFilter<"Codemod"> | boolean
    private?: BoolFilter<"Codemod"> | boolean
    author?: StringFilter<"Codemod"> | string
    totalRuns?: IntFilter<"Codemod"> | number
    amountOfUses?: IntFilter<"Codemod"> | number
    totalTimeSaved?: IntFilter<"Codemod"> | number
    openedPrs?: IntFilter<"Codemod"> | number
    labels?: StringNullableListFilter<"Codemod">
    createdAt?: DateTimeFilter<"Codemod"> | Date | string
    updatedAt?: DateTimeFilter<"Codemod"> | Date | string
    versions?: CodemodVersionListRelationFilter
  }

  export type CodemodOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrderInput | SortOrder
    tags?: SortOrder
    engine?: SortOrderInput | SortOrder
    applicability?: SortOrderInput | SortOrder
    arguments?: SortOrderInput | SortOrder
    name?: SortOrder
    featured?: SortOrder
    verified?: SortOrder
    private?: SortOrder
    author?: SortOrder
    totalRuns?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    labels?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    versions?: CodemodVersionOrderByRelationAggregateInput
  }

  export type CodemodWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    slug?: string
    name?: string
    AND?: CodemodWhereInput | CodemodWhereInput[]
    OR?: CodemodWhereInput[]
    NOT?: CodemodWhereInput | CodemodWhereInput[]
    shortDescription?: StringNullableFilter<"Codemod"> | string | null
    tags?: StringNullableListFilter<"Codemod">
    engine?: StringNullableFilter<"Codemod"> | string | null
    applicability?: JsonNullableFilter<"Codemod">
    arguments?: JsonNullableFilter<"Codemod">
    featured?: BoolFilter<"Codemod"> | boolean
    verified?: BoolFilter<"Codemod"> | boolean
    private?: BoolFilter<"Codemod"> | boolean
    author?: StringFilter<"Codemod"> | string
    totalRuns?: IntFilter<"Codemod"> | number
    amountOfUses?: IntFilter<"Codemod"> | number
    totalTimeSaved?: IntFilter<"Codemod"> | number
    openedPrs?: IntFilter<"Codemod"> | number
    labels?: StringNullableListFilter<"Codemod">
    createdAt?: DateTimeFilter<"Codemod"> | Date | string
    updatedAt?: DateTimeFilter<"Codemod"> | Date | string
    versions?: CodemodVersionListRelationFilter
  }, "id" | "slug" | "name">

  export type CodemodOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrderInput | SortOrder
    tags?: SortOrder
    engine?: SortOrderInput | SortOrder
    applicability?: SortOrderInput | SortOrder
    arguments?: SortOrderInput | SortOrder
    name?: SortOrder
    featured?: SortOrder
    verified?: SortOrder
    private?: SortOrder
    author?: SortOrder
    totalRuns?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    labels?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CodemodCountOrderByAggregateInput
    _avg?: CodemodAvgOrderByAggregateInput
    _max?: CodemodMaxOrderByAggregateInput
    _min?: CodemodMinOrderByAggregateInput
    _sum?: CodemodSumOrderByAggregateInput
  }

  export type CodemodScalarWhereWithAggregatesInput = {
    AND?: CodemodScalarWhereWithAggregatesInput | CodemodScalarWhereWithAggregatesInput[]
    OR?: CodemodScalarWhereWithAggregatesInput[]
    NOT?: CodemodScalarWhereWithAggregatesInput | CodemodScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Codemod"> | number
    slug?: StringWithAggregatesFilter<"Codemod"> | string
    shortDescription?: StringNullableWithAggregatesFilter<"Codemod"> | string | null
    tags?: StringNullableListFilter<"Codemod">
    engine?: StringNullableWithAggregatesFilter<"Codemod"> | string | null
    applicability?: JsonNullableWithAggregatesFilter<"Codemod">
    arguments?: JsonNullableWithAggregatesFilter<"Codemod">
    name?: StringWithAggregatesFilter<"Codemod"> | string
    featured?: BoolWithAggregatesFilter<"Codemod"> | boolean
    verified?: BoolWithAggregatesFilter<"Codemod"> | boolean
    private?: BoolWithAggregatesFilter<"Codemod"> | boolean
    author?: StringWithAggregatesFilter<"Codemod"> | string
    totalRuns?: IntWithAggregatesFilter<"Codemod"> | number
    amountOfUses?: IntWithAggregatesFilter<"Codemod"> | number
    totalTimeSaved?: IntWithAggregatesFilter<"Codemod"> | number
    openedPrs?: IntWithAggregatesFilter<"Codemod"> | number
    labels?: StringNullableListFilter<"Codemod">
    createdAt?: DateTimeWithAggregatesFilter<"Codemod"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Codemod"> | Date | string
  }

  export type CodemodVersionWhereInput = {
    AND?: CodemodVersionWhereInput | CodemodVersionWhereInput[]
    OR?: CodemodVersionWhereInput[]
    NOT?: CodemodVersionWhereInput | CodemodVersionWhereInput[]
    id?: IntFilter<"CodemodVersion"> | number
    version?: StringFilter<"CodemodVersion"> | string
    shortDescription?: StringNullableFilter<"CodemodVersion"> | string | null
    engine?: StringFilter<"CodemodVersion"> | string
    applicability?: JsonNullableFilter<"CodemodVersion">
    arguments?: JsonNullableFilter<"CodemodVersion">
    vsCodeLink?: StringFilter<"CodemodVersion"> | string
    codemodStudioExampleLink?: StringNullableFilter<"CodemodVersion"> | string | null
    testProjectCommand?: StringNullableFilter<"CodemodVersion"> | string | null
    sourceRepo?: StringNullableFilter<"CodemodVersion"> | string | null
    amountOfUses?: IntFilter<"CodemodVersion"> | number
    totalTimeSaved?: IntFilter<"CodemodVersion"> | number
    openedPrs?: IntFilter<"CodemodVersion"> | number
    s3Bucket?: StringFilter<"CodemodVersion"> | string
    s3UploadKey?: StringFilter<"CodemodVersion"> | string
    tags?: StringNullableListFilter<"CodemodVersion">
    codemodId?: IntFilter<"CodemodVersion"> | number
    createdAt?: DateTimeFilter<"CodemodVersion"> | Date | string
    updatedAt?: DateTimeFilter<"CodemodVersion"> | Date | string
    codemod?: XOR<CodemodRelationFilter, CodemodWhereInput>
  }

  export type CodemodVersionOrderByWithRelationInput = {
    id?: SortOrder
    version?: SortOrder
    shortDescription?: SortOrderInput | SortOrder
    engine?: SortOrder
    applicability?: SortOrderInput | SortOrder
    arguments?: SortOrderInput | SortOrder
    vsCodeLink?: SortOrder
    codemodStudioExampleLink?: SortOrderInput | SortOrder
    testProjectCommand?: SortOrderInput | SortOrder
    sourceRepo?: SortOrderInput | SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    s3Bucket?: SortOrder
    s3UploadKey?: SortOrder
    tags?: SortOrder
    codemodId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    codemod?: CodemodOrderByWithRelationInput
  }

  export type CodemodVersionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CodemodVersionWhereInput | CodemodVersionWhereInput[]
    OR?: CodemodVersionWhereInput[]
    NOT?: CodemodVersionWhereInput | CodemodVersionWhereInput[]
    version?: StringFilter<"CodemodVersion"> | string
    shortDescription?: StringNullableFilter<"CodemodVersion"> | string | null
    engine?: StringFilter<"CodemodVersion"> | string
    applicability?: JsonNullableFilter<"CodemodVersion">
    arguments?: JsonNullableFilter<"CodemodVersion">
    vsCodeLink?: StringFilter<"CodemodVersion"> | string
    codemodStudioExampleLink?: StringNullableFilter<"CodemodVersion"> | string | null
    testProjectCommand?: StringNullableFilter<"CodemodVersion"> | string | null
    sourceRepo?: StringNullableFilter<"CodemodVersion"> | string | null
    amountOfUses?: IntFilter<"CodemodVersion"> | number
    totalTimeSaved?: IntFilter<"CodemodVersion"> | number
    openedPrs?: IntFilter<"CodemodVersion"> | number
    s3Bucket?: StringFilter<"CodemodVersion"> | string
    s3UploadKey?: StringFilter<"CodemodVersion"> | string
    tags?: StringNullableListFilter<"CodemodVersion">
    codemodId?: IntFilter<"CodemodVersion"> | number
    createdAt?: DateTimeFilter<"CodemodVersion"> | Date | string
    updatedAt?: DateTimeFilter<"CodemodVersion"> | Date | string
    codemod?: XOR<CodemodRelationFilter, CodemodWhereInput>
  }, "id">

  export type CodemodVersionOrderByWithAggregationInput = {
    id?: SortOrder
    version?: SortOrder
    shortDescription?: SortOrderInput | SortOrder
    engine?: SortOrder
    applicability?: SortOrderInput | SortOrder
    arguments?: SortOrderInput | SortOrder
    vsCodeLink?: SortOrder
    codemodStudioExampleLink?: SortOrderInput | SortOrder
    testProjectCommand?: SortOrderInput | SortOrder
    sourceRepo?: SortOrderInput | SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    s3Bucket?: SortOrder
    s3UploadKey?: SortOrder
    tags?: SortOrder
    codemodId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CodemodVersionCountOrderByAggregateInput
    _avg?: CodemodVersionAvgOrderByAggregateInput
    _max?: CodemodVersionMaxOrderByAggregateInput
    _min?: CodemodVersionMinOrderByAggregateInput
    _sum?: CodemodVersionSumOrderByAggregateInput
  }

  export type CodemodVersionScalarWhereWithAggregatesInput = {
    AND?: CodemodVersionScalarWhereWithAggregatesInput | CodemodVersionScalarWhereWithAggregatesInput[]
    OR?: CodemodVersionScalarWhereWithAggregatesInput[]
    NOT?: CodemodVersionScalarWhereWithAggregatesInput | CodemodVersionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CodemodVersion"> | number
    version?: StringWithAggregatesFilter<"CodemodVersion"> | string
    shortDescription?: StringNullableWithAggregatesFilter<"CodemodVersion"> | string | null
    engine?: StringWithAggregatesFilter<"CodemodVersion"> | string
    applicability?: JsonNullableWithAggregatesFilter<"CodemodVersion">
    arguments?: JsonNullableWithAggregatesFilter<"CodemodVersion">
    vsCodeLink?: StringWithAggregatesFilter<"CodemodVersion"> | string
    codemodStudioExampleLink?: StringNullableWithAggregatesFilter<"CodemodVersion"> | string | null
    testProjectCommand?: StringNullableWithAggregatesFilter<"CodemodVersion"> | string | null
    sourceRepo?: StringNullableWithAggregatesFilter<"CodemodVersion"> | string | null
    amountOfUses?: IntWithAggregatesFilter<"CodemodVersion"> | number
    totalTimeSaved?: IntWithAggregatesFilter<"CodemodVersion"> | number
    openedPrs?: IntWithAggregatesFilter<"CodemodVersion"> | number
    s3Bucket?: StringWithAggregatesFilter<"CodemodVersion"> | string
    s3UploadKey?: StringWithAggregatesFilter<"CodemodVersion"> | string
    tags?: StringNullableListFilter<"CodemodVersion">
    codemodId?: IntWithAggregatesFilter<"CodemodVersion"> | number
    createdAt?: DateTimeWithAggregatesFilter<"CodemodVersion"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CodemodVersion"> | Date | string
  }

  export type TagWhereInput = {
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    id?: IntFilter<"Tag"> | number
    title?: StringFilter<"Tag"> | string
    aliases?: StringNullableListFilter<"Tag">
    classification?: StringFilter<"Tag"> | string
    displayName?: StringFilter<"Tag"> | string
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    updatedAt?: DateTimeFilter<"Tag"> | Date | string
  }

  export type TagOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    aliases?: SortOrder
    classification?: SortOrder
    displayName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TagWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    title?: string
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    aliases?: StringNullableListFilter<"Tag">
    classification?: StringFilter<"Tag"> | string
    displayName?: StringFilter<"Tag"> | string
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    updatedAt?: DateTimeFilter<"Tag"> | Date | string
  }, "id" | "title">

  export type TagOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    aliases?: SortOrder
    classification?: SortOrder
    displayName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TagCountOrderByAggregateInput
    _avg?: TagAvgOrderByAggregateInput
    _max?: TagMaxOrderByAggregateInput
    _min?: TagMinOrderByAggregateInput
    _sum?: TagSumOrderByAggregateInput
  }

  export type TagScalarWhereWithAggregatesInput = {
    AND?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    OR?: TagScalarWhereWithAggregatesInput[]
    NOT?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Tag"> | number
    title?: StringWithAggregatesFilter<"Tag"> | string
    aliases?: StringNullableListFilter<"Tag">
    classification?: StringWithAggregatesFilter<"Tag"> | string
    displayName?: StringWithAggregatesFilter<"Tag"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tag"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tag"> | Date | string
  }

  export type UserLoginIntentWhereInput = {
    AND?: UserLoginIntentWhereInput | UserLoginIntentWhereInput[]
    OR?: UserLoginIntentWhereInput[]
    NOT?: UserLoginIntentWhereInput | UserLoginIntentWhereInput[]
    id?: UuidFilter<"UserLoginIntent"> | string
    token?: StringNullableFilter<"UserLoginIntent"> | string | null
    createdAt?: DateTimeFilter<"UserLoginIntent"> | Date | string
    updatedAt?: DateTimeFilter<"UserLoginIntent"> | Date | string
  }

  export type UserLoginIntentOrderByWithRelationInput = {
    id?: SortOrder
    token?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserLoginIntentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserLoginIntentWhereInput | UserLoginIntentWhereInput[]
    OR?: UserLoginIntentWhereInput[]
    NOT?: UserLoginIntentWhereInput | UserLoginIntentWhereInput[]
    token?: StringNullableFilter<"UserLoginIntent"> | string | null
    createdAt?: DateTimeFilter<"UserLoginIntent"> | Date | string
    updatedAt?: DateTimeFilter<"UserLoginIntent"> | Date | string
  }, "id" | "id">

  export type UserLoginIntentOrderByWithAggregationInput = {
    id?: SortOrder
    token?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserLoginIntentCountOrderByAggregateInput
    _max?: UserLoginIntentMaxOrderByAggregateInput
    _min?: UserLoginIntentMinOrderByAggregateInput
  }

  export type UserLoginIntentScalarWhereWithAggregatesInput = {
    AND?: UserLoginIntentScalarWhereWithAggregatesInput | UserLoginIntentScalarWhereWithAggregatesInput[]
    OR?: UserLoginIntentScalarWhereWithAggregatesInput[]
    NOT?: UserLoginIntentScalarWhereWithAggregatesInput | UserLoginIntentScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserLoginIntent"> | string
    token?: StringNullableWithAggregatesFilter<"UserLoginIntent"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UserLoginIntent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserLoginIntent"> | Date | string
  }

  export type CodeDiffWhereInput = {
    AND?: CodeDiffWhereInput | CodeDiffWhereInput[]
    OR?: CodeDiffWhereInput[]
    NOT?: CodeDiffWhereInput | CodeDiffWhereInput[]
    id?: UuidFilter<"CodeDiff"> | string
    name?: StringNullableFilter<"CodeDiff"> | string | null
    source?: StringFilter<"CodeDiff"> | string
    before?: StringFilter<"CodeDiff"> | string
    after?: StringFilter<"CodeDiff"> | string
    createdAt?: DateTimeFilter<"CodeDiff"> | Date | string
    updatedAt?: DateTimeFilter<"CodeDiff"> | Date | string
  }

  export type CodeDiffOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    source?: SortOrder
    before?: SortOrder
    after?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodeDiffWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CodeDiffWhereInput | CodeDiffWhereInput[]
    OR?: CodeDiffWhereInput[]
    NOT?: CodeDiffWhereInput | CodeDiffWhereInput[]
    name?: StringNullableFilter<"CodeDiff"> | string | null
    source?: StringFilter<"CodeDiff"> | string
    before?: StringFilter<"CodeDiff"> | string
    after?: StringFilter<"CodeDiff"> | string
    createdAt?: DateTimeFilter<"CodeDiff"> | Date | string
    updatedAt?: DateTimeFilter<"CodeDiff"> | Date | string
  }, "id" | "id">

  export type CodeDiffOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    source?: SortOrder
    before?: SortOrder
    after?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CodeDiffCountOrderByAggregateInput
    _max?: CodeDiffMaxOrderByAggregateInput
    _min?: CodeDiffMinOrderByAggregateInput
  }

  export type CodeDiffScalarWhereWithAggregatesInput = {
    AND?: CodeDiffScalarWhereWithAggregatesInput | CodeDiffScalarWhereWithAggregatesInput[]
    OR?: CodeDiffScalarWhereWithAggregatesInput[]
    NOT?: CodeDiffScalarWhereWithAggregatesInput | CodeDiffScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"CodeDiff"> | string
    name?: StringNullableWithAggregatesFilter<"CodeDiff"> | string | null
    source?: StringWithAggregatesFilter<"CodeDiff"> | string
    before?: StringWithAggregatesFilter<"CodeDiff"> | string
    after?: StringWithAggregatesFilter<"CodeDiff"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CodeDiff"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CodeDiff"> | Date | string
  }

  export type CodemodCreateInput = {
    slug: string
    shortDescription?: string | null
    tags?: CodemodCreatetagsInput | string[]
    engine?: string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name: string
    featured?: boolean
    verified?: boolean
    private: boolean
    author: string
    totalRuns?: number
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    labels?: CodemodCreatelabelsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    versions?: CodemodVersionCreateNestedManyWithoutCodemodInput
  }

  export type CodemodUncheckedCreateInput = {
    id?: number
    slug: string
    shortDescription?: string | null
    tags?: CodemodCreatetagsInput | string[]
    engine?: string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name: string
    featured?: boolean
    verified?: boolean
    private: boolean
    author: string
    totalRuns?: number
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    labels?: CodemodCreatelabelsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    versions?: CodemodVersionUncheckedCreateNestedManyWithoutCodemodInput
  }

  export type CodemodUpdateInput = {
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CodemodUpdatetagsInput | string[]
    engine?: NullableStringFieldUpdateOperationsInput | string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name?: StringFieldUpdateOperationsInput | string
    featured?: BoolFieldUpdateOperationsInput | boolean
    verified?: BoolFieldUpdateOperationsInput | boolean
    private?: BoolFieldUpdateOperationsInput | boolean
    author?: StringFieldUpdateOperationsInput | string
    totalRuns?: IntFieldUpdateOperationsInput | number
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    labels?: CodemodUpdatelabelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    versions?: CodemodVersionUpdateManyWithoutCodemodNestedInput
  }

  export type CodemodUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CodemodUpdatetagsInput | string[]
    engine?: NullableStringFieldUpdateOperationsInput | string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name?: StringFieldUpdateOperationsInput | string
    featured?: BoolFieldUpdateOperationsInput | boolean
    verified?: BoolFieldUpdateOperationsInput | boolean
    private?: BoolFieldUpdateOperationsInput | boolean
    author?: StringFieldUpdateOperationsInput | string
    totalRuns?: IntFieldUpdateOperationsInput | number
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    labels?: CodemodUpdatelabelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    versions?: CodemodVersionUncheckedUpdateManyWithoutCodemodNestedInput
  }

  export type CodemodCreateManyInput = {
    id?: number
    slug: string
    shortDescription?: string | null
    tags?: CodemodCreatetagsInput | string[]
    engine?: string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name: string
    featured?: boolean
    verified?: boolean
    private: boolean
    author: string
    totalRuns?: number
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    labels?: CodemodCreatelabelsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodemodUpdateManyMutationInput = {
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CodemodUpdatetagsInput | string[]
    engine?: NullableStringFieldUpdateOperationsInput | string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name?: StringFieldUpdateOperationsInput | string
    featured?: BoolFieldUpdateOperationsInput | boolean
    verified?: BoolFieldUpdateOperationsInput | boolean
    private?: BoolFieldUpdateOperationsInput | boolean
    author?: StringFieldUpdateOperationsInput | string
    totalRuns?: IntFieldUpdateOperationsInput | number
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    labels?: CodemodUpdatelabelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodemodUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CodemodUpdatetagsInput | string[]
    engine?: NullableStringFieldUpdateOperationsInput | string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name?: StringFieldUpdateOperationsInput | string
    featured?: BoolFieldUpdateOperationsInput | boolean
    verified?: BoolFieldUpdateOperationsInput | boolean
    private?: BoolFieldUpdateOperationsInput | boolean
    author?: StringFieldUpdateOperationsInput | string
    totalRuns?: IntFieldUpdateOperationsInput | number
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    labels?: CodemodUpdatelabelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodemodVersionCreateInput = {
    version: string
    shortDescription?: string | null
    engine: string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink: string
    codemodStudioExampleLink?: string | null
    testProjectCommand?: string | null
    sourceRepo?: string | null
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    s3Bucket: string
    s3UploadKey: string
    tags?: CodemodVersionCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    codemod: CodemodCreateNestedOneWithoutVersionsInput
  }

  export type CodemodVersionUncheckedCreateInput = {
    id?: number
    version: string
    shortDescription?: string | null
    engine: string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink: string
    codemodStudioExampleLink?: string | null
    testProjectCommand?: string | null
    sourceRepo?: string | null
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    s3Bucket: string
    s3UploadKey: string
    tags?: CodemodVersionCreatetagsInput | string[]
    codemodId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodemodVersionUpdateInput = {
    version?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    engine?: StringFieldUpdateOperationsInput | string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink?: StringFieldUpdateOperationsInput | string
    codemodStudioExampleLink?: NullableStringFieldUpdateOperationsInput | string | null
    testProjectCommand?: NullableStringFieldUpdateOperationsInput | string | null
    sourceRepo?: NullableStringFieldUpdateOperationsInput | string | null
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    s3Bucket?: StringFieldUpdateOperationsInput | string
    s3UploadKey?: StringFieldUpdateOperationsInput | string
    tags?: CodemodVersionUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codemod?: CodemodUpdateOneRequiredWithoutVersionsNestedInput
  }

  export type CodemodVersionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    version?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    engine?: StringFieldUpdateOperationsInput | string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink?: StringFieldUpdateOperationsInput | string
    codemodStudioExampleLink?: NullableStringFieldUpdateOperationsInput | string | null
    testProjectCommand?: NullableStringFieldUpdateOperationsInput | string | null
    sourceRepo?: NullableStringFieldUpdateOperationsInput | string | null
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    s3Bucket?: StringFieldUpdateOperationsInput | string
    s3UploadKey?: StringFieldUpdateOperationsInput | string
    tags?: CodemodVersionUpdatetagsInput | string[]
    codemodId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodemodVersionCreateManyInput = {
    id?: number
    version: string
    shortDescription?: string | null
    engine: string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink: string
    codemodStudioExampleLink?: string | null
    testProjectCommand?: string | null
    sourceRepo?: string | null
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    s3Bucket: string
    s3UploadKey: string
    tags?: CodemodVersionCreatetagsInput | string[]
    codemodId: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodemodVersionUpdateManyMutationInput = {
    version?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    engine?: StringFieldUpdateOperationsInput | string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink?: StringFieldUpdateOperationsInput | string
    codemodStudioExampleLink?: NullableStringFieldUpdateOperationsInput | string | null
    testProjectCommand?: NullableStringFieldUpdateOperationsInput | string | null
    sourceRepo?: NullableStringFieldUpdateOperationsInput | string | null
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    s3Bucket?: StringFieldUpdateOperationsInput | string
    s3UploadKey?: StringFieldUpdateOperationsInput | string
    tags?: CodemodVersionUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodemodVersionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    version?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    engine?: StringFieldUpdateOperationsInput | string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink?: StringFieldUpdateOperationsInput | string
    codemodStudioExampleLink?: NullableStringFieldUpdateOperationsInput | string | null
    testProjectCommand?: NullableStringFieldUpdateOperationsInput | string | null
    sourceRepo?: NullableStringFieldUpdateOperationsInput | string | null
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    s3Bucket?: StringFieldUpdateOperationsInput | string
    s3UploadKey?: StringFieldUpdateOperationsInput | string
    tags?: CodemodVersionUpdatetagsInput | string[]
    codemodId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagCreateInput = {
    title: string
    aliases?: TagCreatealiasesInput | string[]
    classification: string
    displayName: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagUncheckedCreateInput = {
    id?: number
    title: string
    aliases?: TagCreatealiasesInput | string[]
    classification: string
    displayName: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    aliases?: TagUpdatealiasesInput | string[]
    classification?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    aliases?: TagUpdatealiasesInput | string[]
    classification?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagCreateManyInput = {
    id?: number
    title: string
    aliases?: TagCreatealiasesInput | string[]
    classification: string
    displayName: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    aliases?: TagUpdatealiasesInput | string[]
    classification?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    aliases?: TagUpdatealiasesInput | string[]
    classification?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLoginIntentCreateInput = {
    id?: string
    token?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserLoginIntentUncheckedCreateInput = {
    id?: string
    token?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserLoginIntentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLoginIntentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLoginIntentCreateManyInput = {
    id?: string
    token?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserLoginIntentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLoginIntentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeDiffCreateInput = {
    id?: string
    name?: string | null
    source: string
    before: string
    after: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodeDiffUncheckedCreateInput = {
    id?: string
    name?: string | null
    source: string
    before: string
    after: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodeDiffUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    before?: StringFieldUpdateOperationsInput | string
    after?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeDiffUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    before?: StringFieldUpdateOperationsInput | string
    after?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeDiffCreateManyInput = {
    id?: string
    name?: string | null
    source: string
    before: string
    after: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodeDiffUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    before?: StringFieldUpdateOperationsInput | string
    after?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeDiffUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    source?: StringFieldUpdateOperationsInput | string
    before?: StringFieldUpdateOperationsInput | string
    after?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CodemodVersionListRelationFilter = {
    every?: CodemodVersionWhereInput
    some?: CodemodVersionWhereInput
    none?: CodemodVersionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CodemodVersionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CodemodCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrder
    tags?: SortOrder
    engine?: SortOrder
    applicability?: SortOrder
    arguments?: SortOrder
    name?: SortOrder
    featured?: SortOrder
    verified?: SortOrder
    private?: SortOrder
    author?: SortOrder
    totalRuns?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    labels?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodemodAvgOrderByAggregateInput = {
    id?: SortOrder
    totalRuns?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
  }

  export type CodemodMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrder
    engine?: SortOrder
    name?: SortOrder
    featured?: SortOrder
    verified?: SortOrder
    private?: SortOrder
    author?: SortOrder
    totalRuns?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodemodMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrder
    engine?: SortOrder
    name?: SortOrder
    featured?: SortOrder
    verified?: SortOrder
    private?: SortOrder
    author?: SortOrder
    totalRuns?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodemodSumOrderByAggregateInput = {
    id?: SortOrder
    totalRuns?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type CodemodRelationFilter = {
    is?: CodemodWhereInput
    isNot?: CodemodWhereInput
  }

  export type CodemodVersionCountOrderByAggregateInput = {
    id?: SortOrder
    version?: SortOrder
    shortDescription?: SortOrder
    engine?: SortOrder
    applicability?: SortOrder
    arguments?: SortOrder
    vsCodeLink?: SortOrder
    codemodStudioExampleLink?: SortOrder
    testProjectCommand?: SortOrder
    sourceRepo?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    s3Bucket?: SortOrder
    s3UploadKey?: SortOrder
    tags?: SortOrder
    codemodId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodemodVersionAvgOrderByAggregateInput = {
    id?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    codemodId?: SortOrder
  }

  export type CodemodVersionMaxOrderByAggregateInput = {
    id?: SortOrder
    version?: SortOrder
    shortDescription?: SortOrder
    engine?: SortOrder
    vsCodeLink?: SortOrder
    codemodStudioExampleLink?: SortOrder
    testProjectCommand?: SortOrder
    sourceRepo?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    s3Bucket?: SortOrder
    s3UploadKey?: SortOrder
    codemodId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodemodVersionMinOrderByAggregateInput = {
    id?: SortOrder
    version?: SortOrder
    shortDescription?: SortOrder
    engine?: SortOrder
    vsCodeLink?: SortOrder
    codemodStudioExampleLink?: SortOrder
    testProjectCommand?: SortOrder
    sourceRepo?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    s3Bucket?: SortOrder
    s3UploadKey?: SortOrder
    codemodId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodemodVersionSumOrderByAggregateInput = {
    id?: SortOrder
    amountOfUses?: SortOrder
    totalTimeSaved?: SortOrder
    openedPrs?: SortOrder
    codemodId?: SortOrder
  }

  export type TagCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    aliases?: SortOrder
    classification?: SortOrder
    displayName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TagAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type TagMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    classification?: SortOrder
    displayName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TagMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    classification?: SortOrder
    displayName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TagSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type UserLoginIntentCountOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserLoginIntentMaxOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserLoginIntentMinOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type CodeDiffCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    source?: SortOrder
    before?: SortOrder
    after?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodeDiffMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    source?: SortOrder
    before?: SortOrder
    after?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodeDiffMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    source?: SortOrder
    before?: SortOrder
    after?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CodemodCreatetagsInput = {
    set: string[]
  }

  export type CodemodCreatelabelsInput = {
    set: string[]
  }

  export type CodemodVersionCreateNestedManyWithoutCodemodInput = {
    create?: XOR<CodemodVersionCreateWithoutCodemodInput, CodemodVersionUncheckedCreateWithoutCodemodInput> | CodemodVersionCreateWithoutCodemodInput[] | CodemodVersionUncheckedCreateWithoutCodemodInput[]
    connectOrCreate?: CodemodVersionCreateOrConnectWithoutCodemodInput | CodemodVersionCreateOrConnectWithoutCodemodInput[]
    createMany?: CodemodVersionCreateManyCodemodInputEnvelope
    connect?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
  }

  export type CodemodVersionUncheckedCreateNestedManyWithoutCodemodInput = {
    create?: XOR<CodemodVersionCreateWithoutCodemodInput, CodemodVersionUncheckedCreateWithoutCodemodInput> | CodemodVersionCreateWithoutCodemodInput[] | CodemodVersionUncheckedCreateWithoutCodemodInput[]
    connectOrCreate?: CodemodVersionCreateOrConnectWithoutCodemodInput | CodemodVersionCreateOrConnectWithoutCodemodInput[]
    createMany?: CodemodVersionCreateManyCodemodInputEnvelope
    connect?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type CodemodUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CodemodUpdatelabelsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CodemodVersionUpdateManyWithoutCodemodNestedInput = {
    create?: XOR<CodemodVersionCreateWithoutCodemodInput, CodemodVersionUncheckedCreateWithoutCodemodInput> | CodemodVersionCreateWithoutCodemodInput[] | CodemodVersionUncheckedCreateWithoutCodemodInput[]
    connectOrCreate?: CodemodVersionCreateOrConnectWithoutCodemodInput | CodemodVersionCreateOrConnectWithoutCodemodInput[]
    upsert?: CodemodVersionUpsertWithWhereUniqueWithoutCodemodInput | CodemodVersionUpsertWithWhereUniqueWithoutCodemodInput[]
    createMany?: CodemodVersionCreateManyCodemodInputEnvelope
    set?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
    disconnect?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
    delete?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
    connect?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
    update?: CodemodVersionUpdateWithWhereUniqueWithoutCodemodInput | CodemodVersionUpdateWithWhereUniqueWithoutCodemodInput[]
    updateMany?: CodemodVersionUpdateManyWithWhereWithoutCodemodInput | CodemodVersionUpdateManyWithWhereWithoutCodemodInput[]
    deleteMany?: CodemodVersionScalarWhereInput | CodemodVersionScalarWhereInput[]
  }

  export type CodemodVersionUncheckedUpdateManyWithoutCodemodNestedInput = {
    create?: XOR<CodemodVersionCreateWithoutCodemodInput, CodemodVersionUncheckedCreateWithoutCodemodInput> | CodemodVersionCreateWithoutCodemodInput[] | CodemodVersionUncheckedCreateWithoutCodemodInput[]
    connectOrCreate?: CodemodVersionCreateOrConnectWithoutCodemodInput | CodemodVersionCreateOrConnectWithoutCodemodInput[]
    upsert?: CodemodVersionUpsertWithWhereUniqueWithoutCodemodInput | CodemodVersionUpsertWithWhereUniqueWithoutCodemodInput[]
    createMany?: CodemodVersionCreateManyCodemodInputEnvelope
    set?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
    disconnect?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
    delete?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
    connect?: CodemodVersionWhereUniqueInput | CodemodVersionWhereUniqueInput[]
    update?: CodemodVersionUpdateWithWhereUniqueWithoutCodemodInput | CodemodVersionUpdateWithWhereUniqueWithoutCodemodInput[]
    updateMany?: CodemodVersionUpdateManyWithWhereWithoutCodemodInput | CodemodVersionUpdateManyWithWhereWithoutCodemodInput[]
    deleteMany?: CodemodVersionScalarWhereInput | CodemodVersionScalarWhereInput[]
  }

  export type CodemodVersionCreatetagsInput = {
    set: string[]
  }

  export type CodemodCreateNestedOneWithoutVersionsInput = {
    create?: XOR<CodemodCreateWithoutVersionsInput, CodemodUncheckedCreateWithoutVersionsInput>
    connectOrCreate?: CodemodCreateOrConnectWithoutVersionsInput
    connect?: CodemodWhereUniqueInput
  }

  export type CodemodVersionUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type CodemodUpdateOneRequiredWithoutVersionsNestedInput = {
    create?: XOR<CodemodCreateWithoutVersionsInput, CodemodUncheckedCreateWithoutVersionsInput>
    connectOrCreate?: CodemodCreateOrConnectWithoutVersionsInput
    upsert?: CodemodUpsertWithoutVersionsInput
    connect?: CodemodWhereUniqueInput
    update?: XOR<XOR<CodemodUpdateToOneWithWhereWithoutVersionsInput, CodemodUpdateWithoutVersionsInput>, CodemodUncheckedUpdateWithoutVersionsInput>
  }

  export type TagCreatealiasesInput = {
    set: string[]
  }

  export type TagUpdatealiasesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type CodemodVersionCreateWithoutCodemodInput = {
    version: string
    shortDescription?: string | null
    engine: string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink: string
    codemodStudioExampleLink?: string | null
    testProjectCommand?: string | null
    sourceRepo?: string | null
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    s3Bucket: string
    s3UploadKey: string
    tags?: CodemodVersionCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodemodVersionUncheckedCreateWithoutCodemodInput = {
    id?: number
    version: string
    shortDescription?: string | null
    engine: string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink: string
    codemodStudioExampleLink?: string | null
    testProjectCommand?: string | null
    sourceRepo?: string | null
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    s3Bucket: string
    s3UploadKey: string
    tags?: CodemodVersionCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodemodVersionCreateOrConnectWithoutCodemodInput = {
    where: CodemodVersionWhereUniqueInput
    create: XOR<CodemodVersionCreateWithoutCodemodInput, CodemodVersionUncheckedCreateWithoutCodemodInput>
  }

  export type CodemodVersionCreateManyCodemodInputEnvelope = {
    data: CodemodVersionCreateManyCodemodInput | CodemodVersionCreateManyCodemodInput[]
    skipDuplicates?: boolean
  }

  export type CodemodVersionUpsertWithWhereUniqueWithoutCodemodInput = {
    where: CodemodVersionWhereUniqueInput
    update: XOR<CodemodVersionUpdateWithoutCodemodInput, CodemodVersionUncheckedUpdateWithoutCodemodInput>
    create: XOR<CodemodVersionCreateWithoutCodemodInput, CodemodVersionUncheckedCreateWithoutCodemodInput>
  }

  export type CodemodVersionUpdateWithWhereUniqueWithoutCodemodInput = {
    where: CodemodVersionWhereUniqueInput
    data: XOR<CodemodVersionUpdateWithoutCodemodInput, CodemodVersionUncheckedUpdateWithoutCodemodInput>
  }

  export type CodemodVersionUpdateManyWithWhereWithoutCodemodInput = {
    where: CodemodVersionScalarWhereInput
    data: XOR<CodemodVersionUpdateManyMutationInput, CodemodVersionUncheckedUpdateManyWithoutCodemodInput>
  }

  export type CodemodVersionScalarWhereInput = {
    AND?: CodemodVersionScalarWhereInput | CodemodVersionScalarWhereInput[]
    OR?: CodemodVersionScalarWhereInput[]
    NOT?: CodemodVersionScalarWhereInput | CodemodVersionScalarWhereInput[]
    id?: IntFilter<"CodemodVersion"> | number
    version?: StringFilter<"CodemodVersion"> | string
    shortDescription?: StringNullableFilter<"CodemodVersion"> | string | null
    engine?: StringFilter<"CodemodVersion"> | string
    applicability?: JsonNullableFilter<"CodemodVersion">
    arguments?: JsonNullableFilter<"CodemodVersion">
    vsCodeLink?: StringFilter<"CodemodVersion"> | string
    codemodStudioExampleLink?: StringNullableFilter<"CodemodVersion"> | string | null
    testProjectCommand?: StringNullableFilter<"CodemodVersion"> | string | null
    sourceRepo?: StringNullableFilter<"CodemodVersion"> | string | null
    amountOfUses?: IntFilter<"CodemodVersion"> | number
    totalTimeSaved?: IntFilter<"CodemodVersion"> | number
    openedPrs?: IntFilter<"CodemodVersion"> | number
    s3Bucket?: StringFilter<"CodemodVersion"> | string
    s3UploadKey?: StringFilter<"CodemodVersion"> | string
    tags?: StringNullableListFilter<"CodemodVersion">
    codemodId?: IntFilter<"CodemodVersion"> | number
    createdAt?: DateTimeFilter<"CodemodVersion"> | Date | string
    updatedAt?: DateTimeFilter<"CodemodVersion"> | Date | string
  }

  export type CodemodCreateWithoutVersionsInput = {
    slug: string
    shortDescription?: string | null
    tags?: CodemodCreatetagsInput | string[]
    engine?: string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name: string
    featured?: boolean
    verified?: boolean
    private: boolean
    author: string
    totalRuns?: number
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    labels?: CodemodCreatelabelsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodemodUncheckedCreateWithoutVersionsInput = {
    id?: number
    slug: string
    shortDescription?: string | null
    tags?: CodemodCreatetagsInput | string[]
    engine?: string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name: string
    featured?: boolean
    verified?: boolean
    private: boolean
    author: string
    totalRuns?: number
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    labels?: CodemodCreatelabelsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodemodCreateOrConnectWithoutVersionsInput = {
    where: CodemodWhereUniqueInput
    create: XOR<CodemodCreateWithoutVersionsInput, CodemodUncheckedCreateWithoutVersionsInput>
  }

  export type CodemodUpsertWithoutVersionsInput = {
    update: XOR<CodemodUpdateWithoutVersionsInput, CodemodUncheckedUpdateWithoutVersionsInput>
    create: XOR<CodemodCreateWithoutVersionsInput, CodemodUncheckedCreateWithoutVersionsInput>
    where?: CodemodWhereInput
  }

  export type CodemodUpdateToOneWithWhereWithoutVersionsInput = {
    where?: CodemodWhereInput
    data: XOR<CodemodUpdateWithoutVersionsInput, CodemodUncheckedUpdateWithoutVersionsInput>
  }

  export type CodemodUpdateWithoutVersionsInput = {
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CodemodUpdatetagsInput | string[]
    engine?: NullableStringFieldUpdateOperationsInput | string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name?: StringFieldUpdateOperationsInput | string
    featured?: BoolFieldUpdateOperationsInput | boolean
    verified?: BoolFieldUpdateOperationsInput | boolean
    private?: BoolFieldUpdateOperationsInput | boolean
    author?: StringFieldUpdateOperationsInput | string
    totalRuns?: IntFieldUpdateOperationsInput | number
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    labels?: CodemodUpdatelabelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodemodUncheckedUpdateWithoutVersionsInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CodemodUpdatetagsInput | string[]
    engine?: NullableStringFieldUpdateOperationsInput | string | null
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    name?: StringFieldUpdateOperationsInput | string
    featured?: BoolFieldUpdateOperationsInput | boolean
    verified?: BoolFieldUpdateOperationsInput | boolean
    private?: BoolFieldUpdateOperationsInput | boolean
    author?: StringFieldUpdateOperationsInput | string
    totalRuns?: IntFieldUpdateOperationsInput | number
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    labels?: CodemodUpdatelabelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodemodVersionCreateManyCodemodInput = {
    id?: number
    version: string
    shortDescription?: string | null
    engine: string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink: string
    codemodStudioExampleLink?: string | null
    testProjectCommand?: string | null
    sourceRepo?: string | null
    amountOfUses?: number
    totalTimeSaved?: number
    openedPrs?: number
    s3Bucket: string
    s3UploadKey: string
    tags?: CodemodVersionCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodemodVersionUpdateWithoutCodemodInput = {
    version?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    engine?: StringFieldUpdateOperationsInput | string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink?: StringFieldUpdateOperationsInput | string
    codemodStudioExampleLink?: NullableStringFieldUpdateOperationsInput | string | null
    testProjectCommand?: NullableStringFieldUpdateOperationsInput | string | null
    sourceRepo?: NullableStringFieldUpdateOperationsInput | string | null
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    s3Bucket?: StringFieldUpdateOperationsInput | string
    s3UploadKey?: StringFieldUpdateOperationsInput | string
    tags?: CodemodVersionUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodemodVersionUncheckedUpdateWithoutCodemodInput = {
    id?: IntFieldUpdateOperationsInput | number
    version?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    engine?: StringFieldUpdateOperationsInput | string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink?: StringFieldUpdateOperationsInput | string
    codemodStudioExampleLink?: NullableStringFieldUpdateOperationsInput | string | null
    testProjectCommand?: NullableStringFieldUpdateOperationsInput | string | null
    sourceRepo?: NullableStringFieldUpdateOperationsInput | string | null
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    s3Bucket?: StringFieldUpdateOperationsInput | string
    s3UploadKey?: StringFieldUpdateOperationsInput | string
    tags?: CodemodVersionUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodemodVersionUncheckedUpdateManyWithoutCodemodInput = {
    id?: IntFieldUpdateOperationsInput | number
    version?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    engine?: StringFieldUpdateOperationsInput | string
    applicability?: NullableJsonNullValueInput | InputJsonValue
    arguments?: NullableJsonNullValueInput | InputJsonValue
    vsCodeLink?: StringFieldUpdateOperationsInput | string
    codemodStudioExampleLink?: NullableStringFieldUpdateOperationsInput | string | null
    testProjectCommand?: NullableStringFieldUpdateOperationsInput | string | null
    sourceRepo?: NullableStringFieldUpdateOperationsInput | string | null
    amountOfUses?: IntFieldUpdateOperationsInput | number
    totalTimeSaved?: IntFieldUpdateOperationsInput | number
    openedPrs?: IntFieldUpdateOperationsInput | number
    s3Bucket?: StringFieldUpdateOperationsInput | string
    s3UploadKey?: StringFieldUpdateOperationsInput | string
    tags?: CodemodVersionUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use CodemodCountOutputTypeDefaultArgs instead
     */
    export type CodemodCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CodemodCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CodemodDefaultArgs instead
     */
    export type CodemodArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CodemodDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CodemodVersionDefaultArgs instead
     */
    export type CodemodVersionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CodemodVersionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TagDefaultArgs instead
     */
    export type TagArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TagDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserLoginIntentDefaultArgs instead
     */
    export type UserLoginIntentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserLoginIntentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CodeDiffDefaultArgs instead
     */
    export type CodeDiffArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CodeDiffDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}