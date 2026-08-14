
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Poll
 * 
 */
export type Poll = $Result.DefaultSelection<Prisma.$PollPayload>
/**
 * Model PollOption
 * 
 */
export type PollOption = $Result.DefaultSelection<Prisma.$PollOptionPayload>
/**
 * Model ProcessedVote
 * Idempotency guard: nullifier hash-ът е уникален за (poll, voter), така
 * redelivery на vote.cast от RabbitMQ никога не удвоява гласа.
 */
export type ProcessedVote = $Result.DefaultSelection<Prisma.$ProcessedVotePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const PollCategory: {
  GOVERNANCE: 'GOVERNANCE',
  TREASURY: 'TREASURY',
  TECHNICAL: 'TECHNICAL',
  COMMUNITY: 'COMMUNITY'
};

export type PollCategory = (typeof PollCategory)[keyof typeof PollCategory]

}

export type PollCategory = $Enums.PollCategory

export const PollCategory: typeof $Enums.PollCategory

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Polls
 * const polls = await prisma.poll.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Polls
   * const polls = await prisma.poll.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
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
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
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
   * Read more in our [docs](https://pris.ly/d/raw-queries).
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
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.poll`: Exposes CRUD operations for the **Poll** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Polls
    * const polls = await prisma.poll.findMany()
    * ```
    */
  get poll(): Prisma.PollDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pollOption`: Exposes CRUD operations for the **PollOption** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PollOptions
    * const pollOptions = await prisma.pollOption.findMany()
    * ```
    */
  get pollOption(): Prisma.PollOptionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.processedVote`: Exposes CRUD operations for the **ProcessedVote** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessedVotes
    * const processedVotes = await prisma.processedVote.findMany()
    * ```
    */
  get processedVote(): Prisma.ProcessedVoteDelegate<ExtArgs, ClientOptions>;
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
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.9.1
   * Query Engine version: e922089b7d7502aff4249d5da3420f6fa55fc6ad
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

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
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

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
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
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
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
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
    Poll: 'Poll',
    PollOption: 'PollOption',
    ProcessedVote: 'ProcessedVote'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "poll" | "pollOption" | "processedVote"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Poll: {
        payload: Prisma.$PollPayload<ExtArgs>
        fields: Prisma.PollFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PollFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PollFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>
          }
          findFirst: {
            args: Prisma.PollFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PollFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>
          }
          findMany: {
            args: Prisma.PollFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>[]
          }
          create: {
            args: Prisma.PollCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>
          }
          createMany: {
            args: Prisma.PollCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PollCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>[]
          }
          delete: {
            args: Prisma.PollDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>
          }
          update: {
            args: Prisma.PollUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>
          }
          deleteMany: {
            args: Prisma.PollDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PollUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PollUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>[]
          }
          upsert: {
            args: Prisma.PollUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollPayload>
          }
          aggregate: {
            args: Prisma.PollAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePoll>
          }
          groupBy: {
            args: Prisma.PollGroupByArgs<ExtArgs>
            result: $Utils.Optional<PollGroupByOutputType>[]
          }
          count: {
            args: Prisma.PollCountArgs<ExtArgs>
            result: $Utils.Optional<PollCountAggregateOutputType> | number
          }
        }
      }
      PollOption: {
        payload: Prisma.$PollOptionPayload<ExtArgs>
        fields: Prisma.PollOptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PollOptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PollOptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>
          }
          findFirst: {
            args: Prisma.PollOptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PollOptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>
          }
          findMany: {
            args: Prisma.PollOptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>[]
          }
          create: {
            args: Prisma.PollOptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>
          }
          createMany: {
            args: Prisma.PollOptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PollOptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>[]
          }
          delete: {
            args: Prisma.PollOptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>
          }
          update: {
            args: Prisma.PollOptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>
          }
          deleteMany: {
            args: Prisma.PollOptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PollOptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PollOptionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>[]
          }
          upsert: {
            args: Prisma.PollOptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PollOptionPayload>
          }
          aggregate: {
            args: Prisma.PollOptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePollOption>
          }
          groupBy: {
            args: Prisma.PollOptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PollOptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.PollOptionCountArgs<ExtArgs>
            result: $Utils.Optional<PollOptionCountAggregateOutputType> | number
          }
        }
      }
      ProcessedVote: {
        payload: Prisma.$ProcessedVotePayload<ExtArgs>
        fields: Prisma.ProcessedVoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessedVoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessedVoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>
          }
          findFirst: {
            args: Prisma.ProcessedVoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessedVoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>
          }
          findMany: {
            args: Prisma.ProcessedVoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>[]
          }
          create: {
            args: Prisma.ProcessedVoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>
          }
          createMany: {
            args: Prisma.ProcessedVoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessedVoteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>[]
          }
          delete: {
            args: Prisma.ProcessedVoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>
          }
          update: {
            args: Prisma.ProcessedVoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>
          }
          deleteMany: {
            args: Prisma.ProcessedVoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessedVoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProcessedVoteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>[]
          }
          upsert: {
            args: Prisma.ProcessedVoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessedVotePayload>
          }
          aggregate: {
            args: Prisma.ProcessedVoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessedVote>
          }
          groupBy: {
            args: Prisma.ProcessedVoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessedVoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessedVoteCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessedVoteCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
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
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    poll?: PollOmit
    pollOption?: PollOptionOmit
    processedVote?: ProcessedVoteOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
    | 'updateManyAndReturn'
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
   * Count Type PollCountOutputType
   */

  export type PollCountOutputType = {
    options: number
  }

  export type PollCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    options?: boolean | PollCountOutputTypeCountOptionsArgs
  }

  // Custom InputTypes
  /**
   * PollCountOutputType without action
   */
  export type PollCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollCountOutputType
     */
    select?: PollCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PollCountOutputType without action
   */
  export type PollCountOutputTypeCountOptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PollOptionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Poll
   */

  export type AggregatePoll = {
    _count: PollCountAggregateOutputType | null
    _avg: PollAvgAggregateOutputType | null
    _sum: PollSumAggregateOutputType | null
    _min: PollMinAggregateOutputType | null
    _max: PollMaxAggregateOutputType | null
  }

  export type PollAvgAggregateOutputType = {
    totalVotes: number | null
  }

  export type PollSumAggregateOutputType = {
    totalVotes: number | null
  }

  export type PollMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    imageUrl: string | null
    category: $Enums.PollCategory | null
    startsAt: Date | null
    endsAt: Date | null
    contractAddress: string | null
    creatorId: string | null
    totalVotes: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PollMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    imageUrl: string | null
    category: $Enums.PollCategory | null
    startsAt: Date | null
    endsAt: Date | null
    contractAddress: string | null
    creatorId: string | null
    totalVotes: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PollCountAggregateOutputType = {
    id: number
    title: number
    description: number
    imageUrl: number
    category: number
    startsAt: number
    endsAt: number
    contractAddress: number
    creatorId: number
    totalVotes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PollAvgAggregateInputType = {
    totalVotes?: true
  }

  export type PollSumAggregateInputType = {
    totalVotes?: true
  }

  export type PollMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    imageUrl?: true
    category?: true
    startsAt?: true
    endsAt?: true
    contractAddress?: true
    creatorId?: true
    totalVotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PollMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    imageUrl?: true
    category?: true
    startsAt?: true
    endsAt?: true
    contractAddress?: true
    creatorId?: true
    totalVotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PollCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    imageUrl?: true
    category?: true
    startsAt?: true
    endsAt?: true
    contractAddress?: true
    creatorId?: true
    totalVotes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PollAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Poll to aggregate.
     */
    where?: PollWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Polls to fetch.
     */
    orderBy?: PollOrderByWithRelationInput | PollOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PollWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Polls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Polls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Polls
    **/
    _count?: true | PollCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PollAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PollSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PollMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PollMaxAggregateInputType
  }

  export type GetPollAggregateType<T extends PollAggregateArgs> = {
        [P in keyof T & keyof AggregatePoll]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePoll[P]>
      : GetScalarType<T[P], AggregatePoll[P]>
  }




  export type PollGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PollWhereInput
    orderBy?: PollOrderByWithAggregationInput | PollOrderByWithAggregationInput[]
    by: PollScalarFieldEnum[] | PollScalarFieldEnum
    having?: PollScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PollCountAggregateInputType | true
    _avg?: PollAvgAggregateInputType
    _sum?: PollSumAggregateInputType
    _min?: PollMinAggregateInputType
    _max?: PollMaxAggregateInputType
  }

  export type PollGroupByOutputType = {
    id: string
    title: string
    description: string
    imageUrl: string
    category: $Enums.PollCategory
    startsAt: Date
    endsAt: Date
    contractAddress: string | null
    creatorId: string
    totalVotes: number
    createdAt: Date
    updatedAt: Date
    _count: PollCountAggregateOutputType | null
    _avg: PollAvgAggregateOutputType | null
    _sum: PollSumAggregateOutputType | null
    _min: PollMinAggregateOutputType | null
    _max: PollMaxAggregateOutputType | null
  }

  type GetPollGroupByPayload<T extends PollGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PollGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PollGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PollGroupByOutputType[P]>
            : GetScalarType<T[P], PollGroupByOutputType[P]>
        }
      >
    >


  export type PollSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    imageUrl?: boolean
    category?: boolean
    startsAt?: boolean
    endsAt?: boolean
    contractAddress?: boolean
    creatorId?: boolean
    totalVotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    options?: boolean | Poll$optionsArgs<ExtArgs>
    _count?: boolean | PollCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["poll"]>

  export type PollSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    imageUrl?: boolean
    category?: boolean
    startsAt?: boolean
    endsAt?: boolean
    contractAddress?: boolean
    creatorId?: boolean
    totalVotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["poll"]>

  export type PollSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    imageUrl?: boolean
    category?: boolean
    startsAt?: boolean
    endsAt?: boolean
    contractAddress?: boolean
    creatorId?: boolean
    totalVotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["poll"]>

  export type PollSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    imageUrl?: boolean
    category?: boolean
    startsAt?: boolean
    endsAt?: boolean
    contractAddress?: boolean
    creatorId?: boolean
    totalVotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PollOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "imageUrl" | "category" | "startsAt" | "endsAt" | "contractAddress" | "creatorId" | "totalVotes" | "createdAt" | "updatedAt", ExtArgs["result"]["poll"]>
  export type PollInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    options?: boolean | Poll$optionsArgs<ExtArgs>
    _count?: boolean | PollCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PollIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PollIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PollPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Poll"
    objects: {
      options: Prisma.$PollOptionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      imageUrl: string
      category: $Enums.PollCategory
      startsAt: Date
      endsAt: Date
      contractAddress: string | null
      creatorId: string
      /**
       * * cached sum of all votes, allows fast ORDER BY on sortBy=mostVotes.
       */
      totalVotes: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["poll"]>
    composites: {}
  }

  type PollGetPayload<S extends boolean | null | undefined | PollDefaultArgs> = $Result.GetResult<Prisma.$PollPayload, S>

  type PollCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PollFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PollCountAggregateInputType | true
    }

  export interface PollDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Poll'], meta: { name: 'Poll' } }
    /**
     * Find zero or one Poll that matches the filter.
     * @param {PollFindUniqueArgs} args - Arguments to find a Poll
     * @example
     * // Get one Poll
     * const poll = await prisma.poll.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PollFindUniqueArgs>(args: SelectSubset<T, PollFindUniqueArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Poll that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PollFindUniqueOrThrowArgs} args - Arguments to find a Poll
     * @example
     * // Get one Poll
     * const poll = await prisma.poll.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PollFindUniqueOrThrowArgs>(args: SelectSubset<T, PollFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Poll that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollFindFirstArgs} args - Arguments to find a Poll
     * @example
     * // Get one Poll
     * const poll = await prisma.poll.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PollFindFirstArgs>(args?: SelectSubset<T, PollFindFirstArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Poll that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollFindFirstOrThrowArgs} args - Arguments to find a Poll
     * @example
     * // Get one Poll
     * const poll = await prisma.poll.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PollFindFirstOrThrowArgs>(args?: SelectSubset<T, PollFindFirstOrThrowArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Polls that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Polls
     * const polls = await prisma.poll.findMany()
     * 
     * // Get first 10 Polls
     * const polls = await prisma.poll.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pollWithIdOnly = await prisma.poll.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PollFindManyArgs>(args?: SelectSubset<T, PollFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Poll.
     * @param {PollCreateArgs} args - Arguments to create a Poll.
     * @example
     * // Create one Poll
     * const Poll = await prisma.poll.create({
     *   data: {
     *     // ... data to create a Poll
     *   }
     * })
     * 
     */
    create<T extends PollCreateArgs>(args: SelectSubset<T, PollCreateArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Polls.
     * @param {PollCreateManyArgs} args - Arguments to create many Polls.
     * @example
     * // Create many Polls
     * const poll = await prisma.poll.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PollCreateManyArgs>(args?: SelectSubset<T, PollCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Polls and returns the data saved in the database.
     * @param {PollCreateManyAndReturnArgs} args - Arguments to create many Polls.
     * @example
     * // Create many Polls
     * const poll = await prisma.poll.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Polls and only return the `id`
     * const pollWithIdOnly = await prisma.poll.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PollCreateManyAndReturnArgs>(args?: SelectSubset<T, PollCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Poll.
     * @param {PollDeleteArgs} args - Arguments to delete one Poll.
     * @example
     * // Delete one Poll
     * const Poll = await prisma.poll.delete({
     *   where: {
     *     // ... filter to delete one Poll
     *   }
     * })
     * 
     */
    delete<T extends PollDeleteArgs>(args: SelectSubset<T, PollDeleteArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Poll.
     * @param {PollUpdateArgs} args - Arguments to update one Poll.
     * @example
     * // Update one Poll
     * const poll = await prisma.poll.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PollUpdateArgs>(args: SelectSubset<T, PollUpdateArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Polls.
     * @param {PollDeleteManyArgs} args - Arguments to filter Polls to delete.
     * @example
     * // Delete a few Polls
     * const { count } = await prisma.poll.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PollDeleteManyArgs>(args?: SelectSubset<T, PollDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Polls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Polls
     * const poll = await prisma.poll.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PollUpdateManyArgs>(args: SelectSubset<T, PollUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Polls and returns the data updated in the database.
     * @param {PollUpdateManyAndReturnArgs} args - Arguments to update many Polls.
     * @example
     * // Update many Polls
     * const poll = await prisma.poll.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Polls and only return the `id`
     * const pollWithIdOnly = await prisma.poll.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PollUpdateManyAndReturnArgs>(args: SelectSubset<T, PollUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Poll.
     * @param {PollUpsertArgs} args - Arguments to update or create a Poll.
     * @example
     * // Update or create a Poll
     * const poll = await prisma.poll.upsert({
     *   create: {
     *     // ... data to create a Poll
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Poll we want to update
     *   }
     * })
     */
    upsert<T extends PollUpsertArgs>(args: SelectSubset<T, PollUpsertArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Polls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollCountArgs} args - Arguments to filter Polls to count.
     * @example
     * // Count the number of Polls
     * const count = await prisma.poll.count({
     *   where: {
     *     // ... the filter for the Polls we want to count
     *   }
     * })
    **/
    count<T extends PollCountArgs>(
      args?: Subset<T, PollCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PollCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Poll.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PollAggregateArgs>(args: Subset<T, PollAggregateArgs>): Prisma.PrismaPromise<GetPollAggregateType<T>>

    /**
     * Group by Poll.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollGroupByArgs} args - Group by arguments.
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
      T extends PollGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PollGroupByArgs['orderBy'] }
        : { orderBy?: PollGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PollGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPollGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Poll model
   */
  readonly fields: PollFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Poll.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PollClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    options<T extends Poll$optionsArgs<ExtArgs> = {}>(args?: Subset<T, Poll$optionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Poll model
   */
  interface PollFieldRefs {
    readonly id: FieldRef<"Poll", 'String'>
    readonly title: FieldRef<"Poll", 'String'>
    readonly description: FieldRef<"Poll", 'String'>
    readonly imageUrl: FieldRef<"Poll", 'String'>
    readonly category: FieldRef<"Poll", 'PollCategory'>
    readonly startsAt: FieldRef<"Poll", 'DateTime'>
    readonly endsAt: FieldRef<"Poll", 'DateTime'>
    readonly contractAddress: FieldRef<"Poll", 'String'>
    readonly creatorId: FieldRef<"Poll", 'String'>
    readonly totalVotes: FieldRef<"Poll", 'Int'>
    readonly createdAt: FieldRef<"Poll", 'DateTime'>
    readonly updatedAt: FieldRef<"Poll", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Poll findUnique
   */
  export type PollFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * Filter, which Poll to fetch.
     */
    where: PollWhereUniqueInput
  }

  /**
   * Poll findUniqueOrThrow
   */
  export type PollFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * Filter, which Poll to fetch.
     */
    where: PollWhereUniqueInput
  }

  /**
   * Poll findFirst
   */
  export type PollFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * Filter, which Poll to fetch.
     */
    where?: PollWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Polls to fetch.
     */
    orderBy?: PollOrderByWithRelationInput | PollOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Polls.
     */
    cursor?: PollWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Polls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Polls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Polls.
     */
    distinct?: PollScalarFieldEnum | PollScalarFieldEnum[]
  }

  /**
   * Poll findFirstOrThrow
   */
  export type PollFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * Filter, which Poll to fetch.
     */
    where?: PollWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Polls to fetch.
     */
    orderBy?: PollOrderByWithRelationInput | PollOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Polls.
     */
    cursor?: PollWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Polls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Polls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Polls.
     */
    distinct?: PollScalarFieldEnum | PollScalarFieldEnum[]
  }

  /**
   * Poll findMany
   */
  export type PollFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * Filter, which Polls to fetch.
     */
    where?: PollWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Polls to fetch.
     */
    orderBy?: PollOrderByWithRelationInput | PollOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Polls.
     */
    cursor?: PollWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Polls from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Polls.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Polls.
     */
    distinct?: PollScalarFieldEnum | PollScalarFieldEnum[]
  }

  /**
   * Poll create
   */
  export type PollCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * The data needed to create a Poll.
     */
    data: XOR<PollCreateInput, PollUncheckedCreateInput>
  }

  /**
   * Poll createMany
   */
  export type PollCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Polls.
     */
    data: PollCreateManyInput | PollCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Poll createManyAndReturn
   */
  export type PollCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * The data used to create many Polls.
     */
    data: PollCreateManyInput | PollCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Poll update
   */
  export type PollUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * The data needed to update a Poll.
     */
    data: XOR<PollUpdateInput, PollUncheckedUpdateInput>
    /**
     * Choose, which Poll to update.
     */
    where: PollWhereUniqueInput
  }

  /**
   * Poll updateMany
   */
  export type PollUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Polls.
     */
    data: XOR<PollUpdateManyMutationInput, PollUncheckedUpdateManyInput>
    /**
     * Filter which Polls to update
     */
    where?: PollWhereInput
    /**
     * Limit how many Polls to update.
     */
    limit?: number
  }

  /**
   * Poll updateManyAndReturn
   */
  export type PollUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * The data used to update Polls.
     */
    data: XOR<PollUpdateManyMutationInput, PollUncheckedUpdateManyInput>
    /**
     * Filter which Polls to update
     */
    where?: PollWhereInput
    /**
     * Limit how many Polls to update.
     */
    limit?: number
  }

  /**
   * Poll upsert
   */
  export type PollUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * The filter to search for the Poll to update in case it exists.
     */
    where: PollWhereUniqueInput
    /**
     * In case the Poll found by the `where` argument doesn't exist, create a new Poll with this data.
     */
    create: XOR<PollCreateInput, PollUncheckedCreateInput>
    /**
     * In case the Poll was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PollUpdateInput, PollUncheckedUpdateInput>
  }

  /**
   * Poll delete
   */
  export type PollDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
    /**
     * Filter which Poll to delete.
     */
    where: PollWhereUniqueInput
  }

  /**
   * Poll deleteMany
   */
  export type PollDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Polls to delete
     */
    where?: PollWhereInput
    /**
     * Limit how many Polls to delete.
     */
    limit?: number
  }

  /**
   * Poll.options
   */
  export type Poll$optionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    where?: PollOptionWhereInput
    orderBy?: PollOptionOrderByWithRelationInput | PollOptionOrderByWithRelationInput[]
    cursor?: PollOptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PollOptionScalarFieldEnum | PollOptionScalarFieldEnum[]
  }

  /**
   * Poll without action
   */
  export type PollDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: PollSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Poll
     */
    omit?: PollOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollInclude<ExtArgs> | null
  }


  /**
   * Model PollOption
   */

  export type AggregatePollOption = {
    _count: PollOptionCountAggregateOutputType | null
    _avg: PollOptionAvgAggregateOutputType | null
    _sum: PollOptionSumAggregateOutputType | null
    _min: PollOptionMinAggregateOutputType | null
    _max: PollOptionMaxAggregateOutputType | null
  }

  export type PollOptionAvgAggregateOutputType = {
    votes: number | null
  }

  export type PollOptionSumAggregateOutputType = {
    votes: number | null
  }

  export type PollOptionMinAggregateOutputType = {
    id: string | null
    label: string | null
    votes: number | null
    pollId: string | null
  }

  export type PollOptionMaxAggregateOutputType = {
    id: string | null
    label: string | null
    votes: number | null
    pollId: string | null
  }

  export type PollOptionCountAggregateOutputType = {
    id: number
    label: number
    votes: number
    pollId: number
    _all: number
  }


  export type PollOptionAvgAggregateInputType = {
    votes?: true
  }

  export type PollOptionSumAggregateInputType = {
    votes?: true
  }

  export type PollOptionMinAggregateInputType = {
    id?: true
    label?: true
    votes?: true
    pollId?: true
  }

  export type PollOptionMaxAggregateInputType = {
    id?: true
    label?: true
    votes?: true
    pollId?: true
  }

  export type PollOptionCountAggregateInputType = {
    id?: true
    label?: true
    votes?: true
    pollId?: true
    _all?: true
  }

  export type PollOptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PollOption to aggregate.
     */
    where?: PollOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PollOptions to fetch.
     */
    orderBy?: PollOptionOrderByWithRelationInput | PollOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PollOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PollOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PollOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PollOptions
    **/
    _count?: true | PollOptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PollOptionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PollOptionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PollOptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PollOptionMaxAggregateInputType
  }

  export type GetPollOptionAggregateType<T extends PollOptionAggregateArgs> = {
        [P in keyof T & keyof AggregatePollOption]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePollOption[P]>
      : GetScalarType<T[P], AggregatePollOption[P]>
  }




  export type PollOptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PollOptionWhereInput
    orderBy?: PollOptionOrderByWithAggregationInput | PollOptionOrderByWithAggregationInput[]
    by: PollOptionScalarFieldEnum[] | PollOptionScalarFieldEnum
    having?: PollOptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PollOptionCountAggregateInputType | true
    _avg?: PollOptionAvgAggregateInputType
    _sum?: PollOptionSumAggregateInputType
    _min?: PollOptionMinAggregateInputType
    _max?: PollOptionMaxAggregateInputType
  }

  export type PollOptionGroupByOutputType = {
    id: string
    label: string
    votes: number
    pollId: string
    _count: PollOptionCountAggregateOutputType | null
    _avg: PollOptionAvgAggregateOutputType | null
    _sum: PollOptionSumAggregateOutputType | null
    _min: PollOptionMinAggregateOutputType | null
    _max: PollOptionMaxAggregateOutputType | null
  }

  type GetPollOptionGroupByPayload<T extends PollOptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PollOptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PollOptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PollOptionGroupByOutputType[P]>
            : GetScalarType<T[P], PollOptionGroupByOutputType[P]>
        }
      >
    >


  export type PollOptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    label?: boolean
    votes?: boolean
    pollId?: boolean
    poll?: boolean | PollDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pollOption"]>

  export type PollOptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    label?: boolean
    votes?: boolean
    pollId?: boolean
    poll?: boolean | PollDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pollOption"]>

  export type PollOptionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    label?: boolean
    votes?: boolean
    pollId?: boolean
    poll?: boolean | PollDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pollOption"]>

  export type PollOptionSelectScalar = {
    id?: boolean
    label?: boolean
    votes?: boolean
    pollId?: boolean
  }

  export type PollOptionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "label" | "votes" | "pollId", ExtArgs["result"]["pollOption"]>
  export type PollOptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    poll?: boolean | PollDefaultArgs<ExtArgs>
  }
  export type PollOptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    poll?: boolean | PollDefaultArgs<ExtArgs>
  }
  export type PollOptionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    poll?: boolean | PollDefaultArgs<ExtArgs>
  }

  export type $PollOptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PollOption"
    objects: {
      poll: Prisma.$PollPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      label: string
      votes: number
      pollId: string
    }, ExtArgs["result"]["pollOption"]>
    composites: {}
  }

  type PollOptionGetPayload<S extends boolean | null | undefined | PollOptionDefaultArgs> = $Result.GetResult<Prisma.$PollOptionPayload, S>

  type PollOptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PollOptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PollOptionCountAggregateInputType | true
    }

  export interface PollOptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PollOption'], meta: { name: 'PollOption' } }
    /**
     * Find zero or one PollOption that matches the filter.
     * @param {PollOptionFindUniqueArgs} args - Arguments to find a PollOption
     * @example
     * // Get one PollOption
     * const pollOption = await prisma.pollOption.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PollOptionFindUniqueArgs>(args: SelectSubset<T, PollOptionFindUniqueArgs<ExtArgs>>): Prisma__PollOptionClient<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PollOption that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PollOptionFindUniqueOrThrowArgs} args - Arguments to find a PollOption
     * @example
     * // Get one PollOption
     * const pollOption = await prisma.pollOption.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PollOptionFindUniqueOrThrowArgs>(args: SelectSubset<T, PollOptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PollOptionClient<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PollOption that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollOptionFindFirstArgs} args - Arguments to find a PollOption
     * @example
     * // Get one PollOption
     * const pollOption = await prisma.pollOption.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PollOptionFindFirstArgs>(args?: SelectSubset<T, PollOptionFindFirstArgs<ExtArgs>>): Prisma__PollOptionClient<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PollOption that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollOptionFindFirstOrThrowArgs} args - Arguments to find a PollOption
     * @example
     * // Get one PollOption
     * const pollOption = await prisma.pollOption.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PollOptionFindFirstOrThrowArgs>(args?: SelectSubset<T, PollOptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PollOptionClient<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PollOptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollOptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PollOptions
     * const pollOptions = await prisma.pollOption.findMany()
     * 
     * // Get first 10 PollOptions
     * const pollOptions = await prisma.pollOption.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pollOptionWithIdOnly = await prisma.pollOption.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PollOptionFindManyArgs>(args?: SelectSubset<T, PollOptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PollOption.
     * @param {PollOptionCreateArgs} args - Arguments to create a PollOption.
     * @example
     * // Create one PollOption
     * const PollOption = await prisma.pollOption.create({
     *   data: {
     *     // ... data to create a PollOption
     *   }
     * })
     * 
     */
    create<T extends PollOptionCreateArgs>(args: SelectSubset<T, PollOptionCreateArgs<ExtArgs>>): Prisma__PollOptionClient<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PollOptions.
     * @param {PollOptionCreateManyArgs} args - Arguments to create many PollOptions.
     * @example
     * // Create many PollOptions
     * const pollOption = await prisma.pollOption.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PollOptionCreateManyArgs>(args?: SelectSubset<T, PollOptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PollOptions and returns the data saved in the database.
     * @param {PollOptionCreateManyAndReturnArgs} args - Arguments to create many PollOptions.
     * @example
     * // Create many PollOptions
     * const pollOption = await prisma.pollOption.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PollOptions and only return the `id`
     * const pollOptionWithIdOnly = await prisma.pollOption.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PollOptionCreateManyAndReturnArgs>(args?: SelectSubset<T, PollOptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PollOption.
     * @param {PollOptionDeleteArgs} args - Arguments to delete one PollOption.
     * @example
     * // Delete one PollOption
     * const PollOption = await prisma.pollOption.delete({
     *   where: {
     *     // ... filter to delete one PollOption
     *   }
     * })
     * 
     */
    delete<T extends PollOptionDeleteArgs>(args: SelectSubset<T, PollOptionDeleteArgs<ExtArgs>>): Prisma__PollOptionClient<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PollOption.
     * @param {PollOptionUpdateArgs} args - Arguments to update one PollOption.
     * @example
     * // Update one PollOption
     * const pollOption = await prisma.pollOption.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PollOptionUpdateArgs>(args: SelectSubset<T, PollOptionUpdateArgs<ExtArgs>>): Prisma__PollOptionClient<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PollOptions.
     * @param {PollOptionDeleteManyArgs} args - Arguments to filter PollOptions to delete.
     * @example
     * // Delete a few PollOptions
     * const { count } = await prisma.pollOption.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PollOptionDeleteManyArgs>(args?: SelectSubset<T, PollOptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PollOptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollOptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PollOptions
     * const pollOption = await prisma.pollOption.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PollOptionUpdateManyArgs>(args: SelectSubset<T, PollOptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PollOptions and returns the data updated in the database.
     * @param {PollOptionUpdateManyAndReturnArgs} args - Arguments to update many PollOptions.
     * @example
     * // Update many PollOptions
     * const pollOption = await prisma.pollOption.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PollOptions and only return the `id`
     * const pollOptionWithIdOnly = await prisma.pollOption.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PollOptionUpdateManyAndReturnArgs>(args: SelectSubset<T, PollOptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PollOption.
     * @param {PollOptionUpsertArgs} args - Arguments to update or create a PollOption.
     * @example
     * // Update or create a PollOption
     * const pollOption = await prisma.pollOption.upsert({
     *   create: {
     *     // ... data to create a PollOption
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PollOption we want to update
     *   }
     * })
     */
    upsert<T extends PollOptionUpsertArgs>(args: SelectSubset<T, PollOptionUpsertArgs<ExtArgs>>): Prisma__PollOptionClient<$Result.GetResult<Prisma.$PollOptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PollOptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollOptionCountArgs} args - Arguments to filter PollOptions to count.
     * @example
     * // Count the number of PollOptions
     * const count = await prisma.pollOption.count({
     *   where: {
     *     // ... the filter for the PollOptions we want to count
     *   }
     * })
    **/
    count<T extends PollOptionCountArgs>(
      args?: Subset<T, PollOptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PollOptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PollOption.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollOptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PollOptionAggregateArgs>(args: Subset<T, PollOptionAggregateArgs>): Prisma.PrismaPromise<GetPollOptionAggregateType<T>>

    /**
     * Group by PollOption.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollOptionGroupByArgs} args - Group by arguments.
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
      T extends PollOptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PollOptionGroupByArgs['orderBy'] }
        : { orderBy?: PollOptionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PollOptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPollOptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PollOption model
   */
  readonly fields: PollOptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PollOption.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PollOptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    poll<T extends PollDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PollDefaultArgs<ExtArgs>>): Prisma__PollClient<$Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PollOption model
   */
  interface PollOptionFieldRefs {
    readonly id: FieldRef<"PollOption", 'String'>
    readonly label: FieldRef<"PollOption", 'String'>
    readonly votes: FieldRef<"PollOption", 'Int'>
    readonly pollId: FieldRef<"PollOption", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PollOption findUnique
   */
  export type PollOptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * Filter, which PollOption to fetch.
     */
    where: PollOptionWhereUniqueInput
  }

  /**
   * PollOption findUniqueOrThrow
   */
  export type PollOptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * Filter, which PollOption to fetch.
     */
    where: PollOptionWhereUniqueInput
  }

  /**
   * PollOption findFirst
   */
  export type PollOptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * Filter, which PollOption to fetch.
     */
    where?: PollOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PollOptions to fetch.
     */
    orderBy?: PollOptionOrderByWithRelationInput | PollOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PollOptions.
     */
    cursor?: PollOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PollOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PollOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PollOptions.
     */
    distinct?: PollOptionScalarFieldEnum | PollOptionScalarFieldEnum[]
  }

  /**
   * PollOption findFirstOrThrow
   */
  export type PollOptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * Filter, which PollOption to fetch.
     */
    where?: PollOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PollOptions to fetch.
     */
    orderBy?: PollOptionOrderByWithRelationInput | PollOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PollOptions.
     */
    cursor?: PollOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PollOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PollOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PollOptions.
     */
    distinct?: PollOptionScalarFieldEnum | PollOptionScalarFieldEnum[]
  }

  /**
   * PollOption findMany
   */
  export type PollOptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * Filter, which PollOptions to fetch.
     */
    where?: PollOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PollOptions to fetch.
     */
    orderBy?: PollOptionOrderByWithRelationInput | PollOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PollOptions.
     */
    cursor?: PollOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PollOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PollOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PollOptions.
     */
    distinct?: PollOptionScalarFieldEnum | PollOptionScalarFieldEnum[]
  }

  /**
   * PollOption create
   */
  export type PollOptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * The data needed to create a PollOption.
     */
    data: XOR<PollOptionCreateInput, PollOptionUncheckedCreateInput>
  }

  /**
   * PollOption createMany
   */
  export type PollOptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PollOptions.
     */
    data: PollOptionCreateManyInput | PollOptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PollOption createManyAndReturn
   */
  export type PollOptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * The data used to create many PollOptions.
     */
    data: PollOptionCreateManyInput | PollOptionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PollOption update
   */
  export type PollOptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * The data needed to update a PollOption.
     */
    data: XOR<PollOptionUpdateInput, PollOptionUncheckedUpdateInput>
    /**
     * Choose, which PollOption to update.
     */
    where: PollOptionWhereUniqueInput
  }

  /**
   * PollOption updateMany
   */
  export type PollOptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PollOptions.
     */
    data: XOR<PollOptionUpdateManyMutationInput, PollOptionUncheckedUpdateManyInput>
    /**
     * Filter which PollOptions to update
     */
    where?: PollOptionWhereInput
    /**
     * Limit how many PollOptions to update.
     */
    limit?: number
  }

  /**
   * PollOption updateManyAndReturn
   */
  export type PollOptionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * The data used to update PollOptions.
     */
    data: XOR<PollOptionUpdateManyMutationInput, PollOptionUncheckedUpdateManyInput>
    /**
     * Filter which PollOptions to update
     */
    where?: PollOptionWhereInput
    /**
     * Limit how many PollOptions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PollOption upsert
   */
  export type PollOptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * The filter to search for the PollOption to update in case it exists.
     */
    where: PollOptionWhereUniqueInput
    /**
     * In case the PollOption found by the `where` argument doesn't exist, create a new PollOption with this data.
     */
    create: XOR<PollOptionCreateInput, PollOptionUncheckedCreateInput>
    /**
     * In case the PollOption was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PollOptionUpdateInput, PollOptionUncheckedUpdateInput>
  }

  /**
   * PollOption delete
   */
  export type PollOptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
    /**
     * Filter which PollOption to delete.
     */
    where: PollOptionWhereUniqueInput
  }

  /**
   * PollOption deleteMany
   */
  export type PollOptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PollOptions to delete
     */
    where?: PollOptionWhereInput
    /**
     * Limit how many PollOptions to delete.
     */
    limit?: number
  }

  /**
   * PollOption without action
   */
  export type PollOptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollOption
     */
    select?: PollOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PollOption
     */
    omit?: PollOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PollOptionInclude<ExtArgs> | null
  }


  /**
   * Model ProcessedVote
   */

  export type AggregateProcessedVote = {
    _count: ProcessedVoteCountAggregateOutputType | null
    _min: ProcessedVoteMinAggregateOutputType | null
    _max: ProcessedVoteMaxAggregateOutputType | null
  }

  export type ProcessedVoteMinAggregateOutputType = {
    id: string | null
    pollId: string | null
    nullifierHash: string | null
    processedAt: Date | null
  }

  export type ProcessedVoteMaxAggregateOutputType = {
    id: string | null
    pollId: string | null
    nullifierHash: string | null
    processedAt: Date | null
  }

  export type ProcessedVoteCountAggregateOutputType = {
    id: number
    pollId: number
    nullifierHash: number
    processedAt: number
    _all: number
  }


  export type ProcessedVoteMinAggregateInputType = {
    id?: true
    pollId?: true
    nullifierHash?: true
    processedAt?: true
  }

  export type ProcessedVoteMaxAggregateInputType = {
    id?: true
    pollId?: true
    nullifierHash?: true
    processedAt?: true
  }

  export type ProcessedVoteCountAggregateInputType = {
    id?: true
    pollId?: true
    nullifierHash?: true
    processedAt?: true
    _all?: true
  }

  export type ProcessedVoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessedVote to aggregate.
     */
    where?: ProcessedVoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessedVotes to fetch.
     */
    orderBy?: ProcessedVoteOrderByWithRelationInput | ProcessedVoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessedVoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessedVotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessedVotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessedVotes
    **/
    _count?: true | ProcessedVoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessedVoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessedVoteMaxAggregateInputType
  }

  export type GetProcessedVoteAggregateType<T extends ProcessedVoteAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessedVote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessedVote[P]>
      : GetScalarType<T[P], AggregateProcessedVote[P]>
  }




  export type ProcessedVoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessedVoteWhereInput
    orderBy?: ProcessedVoteOrderByWithAggregationInput | ProcessedVoteOrderByWithAggregationInput[]
    by: ProcessedVoteScalarFieldEnum[] | ProcessedVoteScalarFieldEnum
    having?: ProcessedVoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessedVoteCountAggregateInputType | true
    _min?: ProcessedVoteMinAggregateInputType
    _max?: ProcessedVoteMaxAggregateInputType
  }

  export type ProcessedVoteGroupByOutputType = {
    id: string
    pollId: string
    nullifierHash: string
    processedAt: Date
    _count: ProcessedVoteCountAggregateOutputType | null
    _min: ProcessedVoteMinAggregateOutputType | null
    _max: ProcessedVoteMaxAggregateOutputType | null
  }

  type GetProcessedVoteGroupByPayload<T extends ProcessedVoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessedVoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessedVoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessedVoteGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessedVoteGroupByOutputType[P]>
        }
      >
    >


  export type ProcessedVoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pollId?: boolean
    nullifierHash?: boolean
    processedAt?: boolean
  }, ExtArgs["result"]["processedVote"]>

  export type ProcessedVoteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pollId?: boolean
    nullifierHash?: boolean
    processedAt?: boolean
  }, ExtArgs["result"]["processedVote"]>

  export type ProcessedVoteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pollId?: boolean
    nullifierHash?: boolean
    processedAt?: boolean
  }, ExtArgs["result"]["processedVote"]>

  export type ProcessedVoteSelectScalar = {
    id?: boolean
    pollId?: boolean
    nullifierHash?: boolean
    processedAt?: boolean
  }

  export type ProcessedVoteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pollId" | "nullifierHash" | "processedAt", ExtArgs["result"]["processedVote"]>

  export type $ProcessedVotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessedVote"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      pollId: string
      nullifierHash: string
      processedAt: Date
    }, ExtArgs["result"]["processedVote"]>
    composites: {}
  }

  type ProcessedVoteGetPayload<S extends boolean | null | undefined | ProcessedVoteDefaultArgs> = $Result.GetResult<Prisma.$ProcessedVotePayload, S>

  type ProcessedVoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProcessedVoteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProcessedVoteCountAggregateInputType | true
    }

  export interface ProcessedVoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessedVote'], meta: { name: 'ProcessedVote' } }
    /**
     * Find zero or one ProcessedVote that matches the filter.
     * @param {ProcessedVoteFindUniqueArgs} args - Arguments to find a ProcessedVote
     * @example
     * // Get one ProcessedVote
     * const processedVote = await prisma.processedVote.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessedVoteFindUniqueArgs>(args: SelectSubset<T, ProcessedVoteFindUniqueArgs<ExtArgs>>): Prisma__ProcessedVoteClient<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ProcessedVote that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProcessedVoteFindUniqueOrThrowArgs} args - Arguments to find a ProcessedVote
     * @example
     * // Get one ProcessedVote
     * const processedVote = await prisma.processedVote.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessedVoteFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessedVoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessedVoteClient<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProcessedVote that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessedVoteFindFirstArgs} args - Arguments to find a ProcessedVote
     * @example
     * // Get one ProcessedVote
     * const processedVote = await prisma.processedVote.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessedVoteFindFirstArgs>(args?: SelectSubset<T, ProcessedVoteFindFirstArgs<ExtArgs>>): Prisma__ProcessedVoteClient<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProcessedVote that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessedVoteFindFirstOrThrowArgs} args - Arguments to find a ProcessedVote
     * @example
     * // Get one ProcessedVote
     * const processedVote = await prisma.processedVote.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessedVoteFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessedVoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessedVoteClient<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ProcessedVotes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessedVoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessedVotes
     * const processedVotes = await prisma.processedVote.findMany()
     * 
     * // Get first 10 ProcessedVotes
     * const processedVotes = await prisma.processedVote.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processedVoteWithIdOnly = await prisma.processedVote.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessedVoteFindManyArgs>(args?: SelectSubset<T, ProcessedVoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ProcessedVote.
     * @param {ProcessedVoteCreateArgs} args - Arguments to create a ProcessedVote.
     * @example
     * // Create one ProcessedVote
     * const ProcessedVote = await prisma.processedVote.create({
     *   data: {
     *     // ... data to create a ProcessedVote
     *   }
     * })
     * 
     */
    create<T extends ProcessedVoteCreateArgs>(args: SelectSubset<T, ProcessedVoteCreateArgs<ExtArgs>>): Prisma__ProcessedVoteClient<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ProcessedVotes.
     * @param {ProcessedVoteCreateManyArgs} args - Arguments to create many ProcessedVotes.
     * @example
     * // Create many ProcessedVotes
     * const processedVote = await prisma.processedVote.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessedVoteCreateManyArgs>(args?: SelectSubset<T, ProcessedVoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessedVotes and returns the data saved in the database.
     * @param {ProcessedVoteCreateManyAndReturnArgs} args - Arguments to create many ProcessedVotes.
     * @example
     * // Create many ProcessedVotes
     * const processedVote = await prisma.processedVote.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessedVotes and only return the `id`
     * const processedVoteWithIdOnly = await prisma.processedVote.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessedVoteCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessedVoteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ProcessedVote.
     * @param {ProcessedVoteDeleteArgs} args - Arguments to delete one ProcessedVote.
     * @example
     * // Delete one ProcessedVote
     * const ProcessedVote = await prisma.processedVote.delete({
     *   where: {
     *     // ... filter to delete one ProcessedVote
     *   }
     * })
     * 
     */
    delete<T extends ProcessedVoteDeleteArgs>(args: SelectSubset<T, ProcessedVoteDeleteArgs<ExtArgs>>): Prisma__ProcessedVoteClient<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ProcessedVote.
     * @param {ProcessedVoteUpdateArgs} args - Arguments to update one ProcessedVote.
     * @example
     * // Update one ProcessedVote
     * const processedVote = await prisma.processedVote.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessedVoteUpdateArgs>(args: SelectSubset<T, ProcessedVoteUpdateArgs<ExtArgs>>): Prisma__ProcessedVoteClient<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ProcessedVotes.
     * @param {ProcessedVoteDeleteManyArgs} args - Arguments to filter ProcessedVotes to delete.
     * @example
     * // Delete a few ProcessedVotes
     * const { count } = await prisma.processedVote.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessedVoteDeleteManyArgs>(args?: SelectSubset<T, ProcessedVoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessedVotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessedVoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessedVotes
     * const processedVote = await prisma.processedVote.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessedVoteUpdateManyArgs>(args: SelectSubset<T, ProcessedVoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessedVotes and returns the data updated in the database.
     * @param {ProcessedVoteUpdateManyAndReturnArgs} args - Arguments to update many ProcessedVotes.
     * @example
     * // Update many ProcessedVotes
     * const processedVote = await prisma.processedVote.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ProcessedVotes and only return the `id`
     * const processedVoteWithIdOnly = await prisma.processedVote.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProcessedVoteUpdateManyAndReturnArgs>(args: SelectSubset<T, ProcessedVoteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ProcessedVote.
     * @param {ProcessedVoteUpsertArgs} args - Arguments to update or create a ProcessedVote.
     * @example
     * // Update or create a ProcessedVote
     * const processedVote = await prisma.processedVote.upsert({
     *   create: {
     *     // ... data to create a ProcessedVote
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessedVote we want to update
     *   }
     * })
     */
    upsert<T extends ProcessedVoteUpsertArgs>(args: SelectSubset<T, ProcessedVoteUpsertArgs<ExtArgs>>): Prisma__ProcessedVoteClient<$Result.GetResult<Prisma.$ProcessedVotePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ProcessedVotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessedVoteCountArgs} args - Arguments to filter ProcessedVotes to count.
     * @example
     * // Count the number of ProcessedVotes
     * const count = await prisma.processedVote.count({
     *   where: {
     *     // ... the filter for the ProcessedVotes we want to count
     *   }
     * })
    **/
    count<T extends ProcessedVoteCountArgs>(
      args?: Subset<T, ProcessedVoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessedVoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessedVote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessedVoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessedVoteAggregateArgs>(args: Subset<T, ProcessedVoteAggregateArgs>): Prisma.PrismaPromise<GetProcessedVoteAggregateType<T>>

    /**
     * Group by ProcessedVote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessedVoteGroupByArgs} args - Group by arguments.
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
      T extends ProcessedVoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessedVoteGroupByArgs['orderBy'] }
        : { orderBy?: ProcessedVoteGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessedVoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessedVoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessedVote model
   */
  readonly fields: ProcessedVoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessedVote.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessedVoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ProcessedVote model
   */
  interface ProcessedVoteFieldRefs {
    readonly id: FieldRef<"ProcessedVote", 'String'>
    readonly pollId: FieldRef<"ProcessedVote", 'String'>
    readonly nullifierHash: FieldRef<"ProcessedVote", 'String'>
    readonly processedAt: FieldRef<"ProcessedVote", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessedVote findUnique
   */
  export type ProcessedVoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * Filter, which ProcessedVote to fetch.
     */
    where: ProcessedVoteWhereUniqueInput
  }

  /**
   * ProcessedVote findUniqueOrThrow
   */
  export type ProcessedVoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * Filter, which ProcessedVote to fetch.
     */
    where: ProcessedVoteWhereUniqueInput
  }

  /**
   * ProcessedVote findFirst
   */
  export type ProcessedVoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * Filter, which ProcessedVote to fetch.
     */
    where?: ProcessedVoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessedVotes to fetch.
     */
    orderBy?: ProcessedVoteOrderByWithRelationInput | ProcessedVoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessedVotes.
     */
    cursor?: ProcessedVoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessedVotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessedVotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessedVotes.
     */
    distinct?: ProcessedVoteScalarFieldEnum | ProcessedVoteScalarFieldEnum[]
  }

  /**
   * ProcessedVote findFirstOrThrow
   */
  export type ProcessedVoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * Filter, which ProcessedVote to fetch.
     */
    where?: ProcessedVoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessedVotes to fetch.
     */
    orderBy?: ProcessedVoteOrderByWithRelationInput | ProcessedVoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessedVotes.
     */
    cursor?: ProcessedVoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessedVotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessedVotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessedVotes.
     */
    distinct?: ProcessedVoteScalarFieldEnum | ProcessedVoteScalarFieldEnum[]
  }

  /**
   * ProcessedVote findMany
   */
  export type ProcessedVoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * Filter, which ProcessedVotes to fetch.
     */
    where?: ProcessedVoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessedVotes to fetch.
     */
    orderBy?: ProcessedVoteOrderByWithRelationInput | ProcessedVoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessedVotes.
     */
    cursor?: ProcessedVoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessedVotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessedVotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessedVotes.
     */
    distinct?: ProcessedVoteScalarFieldEnum | ProcessedVoteScalarFieldEnum[]
  }

  /**
   * ProcessedVote create
   */
  export type ProcessedVoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * The data needed to create a ProcessedVote.
     */
    data: XOR<ProcessedVoteCreateInput, ProcessedVoteUncheckedCreateInput>
  }

  /**
   * ProcessedVote createMany
   */
  export type ProcessedVoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessedVotes.
     */
    data: ProcessedVoteCreateManyInput | ProcessedVoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessedVote createManyAndReturn
   */
  export type ProcessedVoteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * The data used to create many ProcessedVotes.
     */
    data: ProcessedVoteCreateManyInput | ProcessedVoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessedVote update
   */
  export type ProcessedVoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * The data needed to update a ProcessedVote.
     */
    data: XOR<ProcessedVoteUpdateInput, ProcessedVoteUncheckedUpdateInput>
    /**
     * Choose, which ProcessedVote to update.
     */
    where: ProcessedVoteWhereUniqueInput
  }

  /**
   * ProcessedVote updateMany
   */
  export type ProcessedVoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessedVotes.
     */
    data: XOR<ProcessedVoteUpdateManyMutationInput, ProcessedVoteUncheckedUpdateManyInput>
    /**
     * Filter which ProcessedVotes to update
     */
    where?: ProcessedVoteWhereInput
    /**
     * Limit how many ProcessedVotes to update.
     */
    limit?: number
  }

  /**
   * ProcessedVote updateManyAndReturn
   */
  export type ProcessedVoteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * The data used to update ProcessedVotes.
     */
    data: XOR<ProcessedVoteUpdateManyMutationInput, ProcessedVoteUncheckedUpdateManyInput>
    /**
     * Filter which ProcessedVotes to update
     */
    where?: ProcessedVoteWhereInput
    /**
     * Limit how many ProcessedVotes to update.
     */
    limit?: number
  }

  /**
   * ProcessedVote upsert
   */
  export type ProcessedVoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * The filter to search for the ProcessedVote to update in case it exists.
     */
    where: ProcessedVoteWhereUniqueInput
    /**
     * In case the ProcessedVote found by the `where` argument doesn't exist, create a new ProcessedVote with this data.
     */
    create: XOR<ProcessedVoteCreateInput, ProcessedVoteUncheckedCreateInput>
    /**
     * In case the ProcessedVote was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessedVoteUpdateInput, ProcessedVoteUncheckedUpdateInput>
  }

  /**
   * ProcessedVote delete
   */
  export type ProcessedVoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
    /**
     * Filter which ProcessedVote to delete.
     */
    where: ProcessedVoteWhereUniqueInput
  }

  /**
   * ProcessedVote deleteMany
   */
  export type ProcessedVoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessedVotes to delete
     */
    where?: ProcessedVoteWhereInput
    /**
     * Limit how many ProcessedVotes to delete.
     */
    limit?: number
  }

  /**
   * ProcessedVote without action
   */
  export type ProcessedVoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessedVote
     */
    select?: ProcessedVoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProcessedVote
     */
    omit?: ProcessedVoteOmit<ExtArgs> | null
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


  export const PollScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    imageUrl: 'imageUrl',
    category: 'category',
    startsAt: 'startsAt',
    endsAt: 'endsAt',
    contractAddress: 'contractAddress',
    creatorId: 'creatorId',
    totalVotes: 'totalVotes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PollScalarFieldEnum = (typeof PollScalarFieldEnum)[keyof typeof PollScalarFieldEnum]


  export const PollOptionScalarFieldEnum: {
    id: 'id',
    label: 'label',
    votes: 'votes',
    pollId: 'pollId'
  };

  export type PollOptionScalarFieldEnum = (typeof PollOptionScalarFieldEnum)[keyof typeof PollOptionScalarFieldEnum]


  export const ProcessedVoteScalarFieldEnum: {
    id: 'id',
    pollId: 'pollId',
    nullifierHash: 'nullifierHash',
    processedAt: 'processedAt'
  };

  export type ProcessedVoteScalarFieldEnum = (typeof ProcessedVoteScalarFieldEnum)[keyof typeof ProcessedVoteScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'PollCategory'
   */
  export type EnumPollCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PollCategory'>
    


  /**
   * Reference to a field of type 'PollCategory[]'
   */
  export type ListEnumPollCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PollCategory[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type PollWhereInput = {
    AND?: PollWhereInput | PollWhereInput[]
    OR?: PollWhereInput[]
    NOT?: PollWhereInput | PollWhereInput[]
    id?: StringFilter<"Poll"> | string
    title?: StringFilter<"Poll"> | string
    description?: StringFilter<"Poll"> | string
    imageUrl?: StringFilter<"Poll"> | string
    category?: EnumPollCategoryFilter<"Poll"> | $Enums.PollCategory
    startsAt?: DateTimeFilter<"Poll"> | Date | string
    endsAt?: DateTimeFilter<"Poll"> | Date | string
    contractAddress?: StringNullableFilter<"Poll"> | string | null
    creatorId?: StringFilter<"Poll"> | string
    totalVotes?: IntFilter<"Poll"> | number
    createdAt?: DateTimeFilter<"Poll"> | Date | string
    updatedAt?: DateTimeFilter<"Poll"> | Date | string
    options?: PollOptionListRelationFilter
  }

  export type PollOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    category?: SortOrder
    startsAt?: SortOrder
    endsAt?: SortOrder
    contractAddress?: SortOrderInput | SortOrder
    creatorId?: SortOrder
    totalVotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    options?: PollOptionOrderByRelationAggregateInput
  }

  export type PollWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PollWhereInput | PollWhereInput[]
    OR?: PollWhereInput[]
    NOT?: PollWhereInput | PollWhereInput[]
    title?: StringFilter<"Poll"> | string
    description?: StringFilter<"Poll"> | string
    imageUrl?: StringFilter<"Poll"> | string
    category?: EnumPollCategoryFilter<"Poll"> | $Enums.PollCategory
    startsAt?: DateTimeFilter<"Poll"> | Date | string
    endsAt?: DateTimeFilter<"Poll"> | Date | string
    contractAddress?: StringNullableFilter<"Poll"> | string | null
    creatorId?: StringFilter<"Poll"> | string
    totalVotes?: IntFilter<"Poll"> | number
    createdAt?: DateTimeFilter<"Poll"> | Date | string
    updatedAt?: DateTimeFilter<"Poll"> | Date | string
    options?: PollOptionListRelationFilter
  }, "id">

  export type PollOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    category?: SortOrder
    startsAt?: SortOrder
    endsAt?: SortOrder
    contractAddress?: SortOrderInput | SortOrder
    creatorId?: SortOrder
    totalVotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PollCountOrderByAggregateInput
    _avg?: PollAvgOrderByAggregateInput
    _max?: PollMaxOrderByAggregateInput
    _min?: PollMinOrderByAggregateInput
    _sum?: PollSumOrderByAggregateInput
  }

  export type PollScalarWhereWithAggregatesInput = {
    AND?: PollScalarWhereWithAggregatesInput | PollScalarWhereWithAggregatesInput[]
    OR?: PollScalarWhereWithAggregatesInput[]
    NOT?: PollScalarWhereWithAggregatesInput | PollScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Poll"> | string
    title?: StringWithAggregatesFilter<"Poll"> | string
    description?: StringWithAggregatesFilter<"Poll"> | string
    imageUrl?: StringWithAggregatesFilter<"Poll"> | string
    category?: EnumPollCategoryWithAggregatesFilter<"Poll"> | $Enums.PollCategory
    startsAt?: DateTimeWithAggregatesFilter<"Poll"> | Date | string
    endsAt?: DateTimeWithAggregatesFilter<"Poll"> | Date | string
    contractAddress?: StringNullableWithAggregatesFilter<"Poll"> | string | null
    creatorId?: StringWithAggregatesFilter<"Poll"> | string
    totalVotes?: IntWithAggregatesFilter<"Poll"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Poll"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Poll"> | Date | string
  }

  export type PollOptionWhereInput = {
    AND?: PollOptionWhereInput | PollOptionWhereInput[]
    OR?: PollOptionWhereInput[]
    NOT?: PollOptionWhereInput | PollOptionWhereInput[]
    id?: StringFilter<"PollOption"> | string
    label?: StringFilter<"PollOption"> | string
    votes?: IntFilter<"PollOption"> | number
    pollId?: StringFilter<"PollOption"> | string
    poll?: XOR<PollScalarRelationFilter, PollWhereInput>
  }

  export type PollOptionOrderByWithRelationInput = {
    id?: SortOrder
    label?: SortOrder
    votes?: SortOrder
    pollId?: SortOrder
    poll?: PollOrderByWithRelationInput
  }

  export type PollOptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PollOptionWhereInput | PollOptionWhereInput[]
    OR?: PollOptionWhereInput[]
    NOT?: PollOptionWhereInput | PollOptionWhereInput[]
    label?: StringFilter<"PollOption"> | string
    votes?: IntFilter<"PollOption"> | number
    pollId?: StringFilter<"PollOption"> | string
    poll?: XOR<PollScalarRelationFilter, PollWhereInput>
  }, "id">

  export type PollOptionOrderByWithAggregationInput = {
    id?: SortOrder
    label?: SortOrder
    votes?: SortOrder
    pollId?: SortOrder
    _count?: PollOptionCountOrderByAggregateInput
    _avg?: PollOptionAvgOrderByAggregateInput
    _max?: PollOptionMaxOrderByAggregateInput
    _min?: PollOptionMinOrderByAggregateInput
    _sum?: PollOptionSumOrderByAggregateInput
  }

  export type PollOptionScalarWhereWithAggregatesInput = {
    AND?: PollOptionScalarWhereWithAggregatesInput | PollOptionScalarWhereWithAggregatesInput[]
    OR?: PollOptionScalarWhereWithAggregatesInput[]
    NOT?: PollOptionScalarWhereWithAggregatesInput | PollOptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PollOption"> | string
    label?: StringWithAggregatesFilter<"PollOption"> | string
    votes?: IntWithAggregatesFilter<"PollOption"> | number
    pollId?: StringWithAggregatesFilter<"PollOption"> | string
  }

  export type ProcessedVoteWhereInput = {
    AND?: ProcessedVoteWhereInput | ProcessedVoteWhereInput[]
    OR?: ProcessedVoteWhereInput[]
    NOT?: ProcessedVoteWhereInput | ProcessedVoteWhereInput[]
    id?: StringFilter<"ProcessedVote"> | string
    pollId?: StringFilter<"ProcessedVote"> | string
    nullifierHash?: StringFilter<"ProcessedVote"> | string
    processedAt?: DateTimeFilter<"ProcessedVote"> | Date | string
  }

  export type ProcessedVoteOrderByWithRelationInput = {
    id?: SortOrder
    pollId?: SortOrder
    nullifierHash?: SortOrder
    processedAt?: SortOrder
  }

  export type ProcessedVoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    pollId_nullifierHash?: ProcessedVotePollIdNullifierHashCompoundUniqueInput
    AND?: ProcessedVoteWhereInput | ProcessedVoteWhereInput[]
    OR?: ProcessedVoteWhereInput[]
    NOT?: ProcessedVoteWhereInput | ProcessedVoteWhereInput[]
    pollId?: StringFilter<"ProcessedVote"> | string
    nullifierHash?: StringFilter<"ProcessedVote"> | string
    processedAt?: DateTimeFilter<"ProcessedVote"> | Date | string
  }, "id" | "pollId_nullifierHash">

  export type ProcessedVoteOrderByWithAggregationInput = {
    id?: SortOrder
    pollId?: SortOrder
    nullifierHash?: SortOrder
    processedAt?: SortOrder
    _count?: ProcessedVoteCountOrderByAggregateInput
    _max?: ProcessedVoteMaxOrderByAggregateInput
    _min?: ProcessedVoteMinOrderByAggregateInput
  }

  export type ProcessedVoteScalarWhereWithAggregatesInput = {
    AND?: ProcessedVoteScalarWhereWithAggregatesInput | ProcessedVoteScalarWhereWithAggregatesInput[]
    OR?: ProcessedVoteScalarWhereWithAggregatesInput[]
    NOT?: ProcessedVoteScalarWhereWithAggregatesInput | ProcessedVoteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessedVote"> | string
    pollId?: StringWithAggregatesFilter<"ProcessedVote"> | string
    nullifierHash?: StringWithAggregatesFilter<"ProcessedVote"> | string
    processedAt?: DateTimeWithAggregatesFilter<"ProcessedVote"> | Date | string
  }

  export type PollCreateInput = {
    id?: string
    title: string
    description: string
    imageUrl: string
    category: $Enums.PollCategory
    startsAt: Date | string
    endsAt: Date | string
    contractAddress?: string | null
    creatorId: string
    totalVotes?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: PollOptionCreateNestedManyWithoutPollInput
  }

  export type PollUncheckedCreateInput = {
    id?: string
    title: string
    description: string
    imageUrl: string
    category: $Enums.PollCategory
    startsAt: Date | string
    endsAt: Date | string
    contractAddress?: string | null
    creatorId: string
    totalVotes?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    options?: PollOptionUncheckedCreateNestedManyWithoutPollInput
  }

  export type PollUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    category?: EnumPollCategoryFieldUpdateOperationsInput | $Enums.PollCategory
    startsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contractAddress?: NullableStringFieldUpdateOperationsInput | string | null
    creatorId?: StringFieldUpdateOperationsInput | string
    totalVotes?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: PollOptionUpdateManyWithoutPollNestedInput
  }

  export type PollUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    category?: EnumPollCategoryFieldUpdateOperationsInput | $Enums.PollCategory
    startsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contractAddress?: NullableStringFieldUpdateOperationsInput | string | null
    creatorId?: StringFieldUpdateOperationsInput | string
    totalVotes?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: PollOptionUncheckedUpdateManyWithoutPollNestedInput
  }

  export type PollCreateManyInput = {
    id?: string
    title: string
    description: string
    imageUrl: string
    category: $Enums.PollCategory
    startsAt: Date | string
    endsAt: Date | string
    contractAddress?: string | null
    creatorId: string
    totalVotes?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PollUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    category?: EnumPollCategoryFieldUpdateOperationsInput | $Enums.PollCategory
    startsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contractAddress?: NullableStringFieldUpdateOperationsInput | string | null
    creatorId?: StringFieldUpdateOperationsInput | string
    totalVotes?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PollUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    category?: EnumPollCategoryFieldUpdateOperationsInput | $Enums.PollCategory
    startsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contractAddress?: NullableStringFieldUpdateOperationsInput | string | null
    creatorId?: StringFieldUpdateOperationsInput | string
    totalVotes?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PollOptionCreateInput = {
    id?: string
    label: string
    votes?: number
    poll: PollCreateNestedOneWithoutOptionsInput
  }

  export type PollOptionUncheckedCreateInput = {
    id?: string
    label: string
    votes?: number
    pollId: string
  }

  export type PollOptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    votes?: IntFieldUpdateOperationsInput | number
    poll?: PollUpdateOneRequiredWithoutOptionsNestedInput
  }

  export type PollOptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    votes?: IntFieldUpdateOperationsInput | number
    pollId?: StringFieldUpdateOperationsInput | string
  }

  export type PollOptionCreateManyInput = {
    id?: string
    label: string
    votes?: number
    pollId: string
  }

  export type PollOptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    votes?: IntFieldUpdateOperationsInput | number
  }

  export type PollOptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    votes?: IntFieldUpdateOperationsInput | number
    pollId?: StringFieldUpdateOperationsInput | string
  }

  export type ProcessedVoteCreateInput = {
    id?: string
    pollId: string
    nullifierHash: string
    processedAt?: Date | string
  }

  export type ProcessedVoteUncheckedCreateInput = {
    id?: string
    pollId: string
    nullifierHash: string
    processedAt?: Date | string
  }

  export type ProcessedVoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pollId?: StringFieldUpdateOperationsInput | string
    nullifierHash?: StringFieldUpdateOperationsInput | string
    processedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessedVoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pollId?: StringFieldUpdateOperationsInput | string
    nullifierHash?: StringFieldUpdateOperationsInput | string
    processedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessedVoteCreateManyInput = {
    id?: string
    pollId: string
    nullifierHash: string
    processedAt?: Date | string
  }

  export type ProcessedVoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    pollId?: StringFieldUpdateOperationsInput | string
    nullifierHash?: StringFieldUpdateOperationsInput | string
    processedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessedVoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    pollId?: StringFieldUpdateOperationsInput | string
    nullifierHash?: StringFieldUpdateOperationsInput | string
    processedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type EnumPollCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.PollCategory | EnumPollCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.PollCategory[] | ListEnumPollCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.PollCategory[] | ListEnumPollCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumPollCategoryFilter<$PrismaModel> | $Enums.PollCategory
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

  export type PollOptionListRelationFilter = {
    every?: PollOptionWhereInput
    some?: PollOptionWhereInput
    none?: PollOptionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PollOptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PollCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    category?: SortOrder
    startsAt?: SortOrder
    endsAt?: SortOrder
    contractAddress?: SortOrder
    creatorId?: SortOrder
    totalVotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PollAvgOrderByAggregateInput = {
    totalVotes?: SortOrder
  }

  export type PollMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    category?: SortOrder
    startsAt?: SortOrder
    endsAt?: SortOrder
    contractAddress?: SortOrder
    creatorId?: SortOrder
    totalVotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PollMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    category?: SortOrder
    startsAt?: SortOrder
    endsAt?: SortOrder
    contractAddress?: SortOrder
    creatorId?: SortOrder
    totalVotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PollSumOrderByAggregateInput = {
    totalVotes?: SortOrder
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

  export type EnumPollCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PollCategory | EnumPollCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.PollCategory[] | ListEnumPollCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.PollCategory[] | ListEnumPollCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumPollCategoryWithAggregatesFilter<$PrismaModel> | $Enums.PollCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPollCategoryFilter<$PrismaModel>
    _max?: NestedEnumPollCategoryFilter<$PrismaModel>
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

  export type PollScalarRelationFilter = {
    is?: PollWhereInput
    isNot?: PollWhereInput
  }

  export type PollOptionCountOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    votes?: SortOrder
    pollId?: SortOrder
  }

  export type PollOptionAvgOrderByAggregateInput = {
    votes?: SortOrder
  }

  export type PollOptionMaxOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    votes?: SortOrder
    pollId?: SortOrder
  }

  export type PollOptionMinOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    votes?: SortOrder
    pollId?: SortOrder
  }

  export type PollOptionSumOrderByAggregateInput = {
    votes?: SortOrder
  }

  export type ProcessedVotePollIdNullifierHashCompoundUniqueInput = {
    pollId: string
    nullifierHash: string
  }

  export type ProcessedVoteCountOrderByAggregateInput = {
    id?: SortOrder
    pollId?: SortOrder
    nullifierHash?: SortOrder
    processedAt?: SortOrder
  }

  export type ProcessedVoteMaxOrderByAggregateInput = {
    id?: SortOrder
    pollId?: SortOrder
    nullifierHash?: SortOrder
    processedAt?: SortOrder
  }

  export type ProcessedVoteMinOrderByAggregateInput = {
    id?: SortOrder
    pollId?: SortOrder
    nullifierHash?: SortOrder
    processedAt?: SortOrder
  }

  export type PollOptionCreateNestedManyWithoutPollInput = {
    create?: XOR<PollOptionCreateWithoutPollInput, PollOptionUncheckedCreateWithoutPollInput> | PollOptionCreateWithoutPollInput[] | PollOptionUncheckedCreateWithoutPollInput[]
    connectOrCreate?: PollOptionCreateOrConnectWithoutPollInput | PollOptionCreateOrConnectWithoutPollInput[]
    createMany?: PollOptionCreateManyPollInputEnvelope
    connect?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
  }

  export type PollOptionUncheckedCreateNestedManyWithoutPollInput = {
    create?: XOR<PollOptionCreateWithoutPollInput, PollOptionUncheckedCreateWithoutPollInput> | PollOptionCreateWithoutPollInput[] | PollOptionUncheckedCreateWithoutPollInput[]
    connectOrCreate?: PollOptionCreateOrConnectWithoutPollInput | PollOptionCreateOrConnectWithoutPollInput[]
    createMany?: PollOptionCreateManyPollInputEnvelope
    connect?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumPollCategoryFieldUpdateOperationsInput = {
    set?: $Enums.PollCategory
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PollOptionUpdateManyWithoutPollNestedInput = {
    create?: XOR<PollOptionCreateWithoutPollInput, PollOptionUncheckedCreateWithoutPollInput> | PollOptionCreateWithoutPollInput[] | PollOptionUncheckedCreateWithoutPollInput[]
    connectOrCreate?: PollOptionCreateOrConnectWithoutPollInput | PollOptionCreateOrConnectWithoutPollInput[]
    upsert?: PollOptionUpsertWithWhereUniqueWithoutPollInput | PollOptionUpsertWithWhereUniqueWithoutPollInput[]
    createMany?: PollOptionCreateManyPollInputEnvelope
    set?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
    disconnect?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
    delete?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
    connect?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
    update?: PollOptionUpdateWithWhereUniqueWithoutPollInput | PollOptionUpdateWithWhereUniqueWithoutPollInput[]
    updateMany?: PollOptionUpdateManyWithWhereWithoutPollInput | PollOptionUpdateManyWithWhereWithoutPollInput[]
    deleteMany?: PollOptionScalarWhereInput | PollOptionScalarWhereInput[]
  }

  export type PollOptionUncheckedUpdateManyWithoutPollNestedInput = {
    create?: XOR<PollOptionCreateWithoutPollInput, PollOptionUncheckedCreateWithoutPollInput> | PollOptionCreateWithoutPollInput[] | PollOptionUncheckedCreateWithoutPollInput[]
    connectOrCreate?: PollOptionCreateOrConnectWithoutPollInput | PollOptionCreateOrConnectWithoutPollInput[]
    upsert?: PollOptionUpsertWithWhereUniqueWithoutPollInput | PollOptionUpsertWithWhereUniqueWithoutPollInput[]
    createMany?: PollOptionCreateManyPollInputEnvelope
    set?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
    disconnect?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
    delete?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
    connect?: PollOptionWhereUniqueInput | PollOptionWhereUniqueInput[]
    update?: PollOptionUpdateWithWhereUniqueWithoutPollInput | PollOptionUpdateWithWhereUniqueWithoutPollInput[]
    updateMany?: PollOptionUpdateManyWithWhereWithoutPollInput | PollOptionUpdateManyWithWhereWithoutPollInput[]
    deleteMany?: PollOptionScalarWhereInput | PollOptionScalarWhereInput[]
  }

  export type PollCreateNestedOneWithoutOptionsInput = {
    create?: XOR<PollCreateWithoutOptionsInput, PollUncheckedCreateWithoutOptionsInput>
    connectOrCreate?: PollCreateOrConnectWithoutOptionsInput
    connect?: PollWhereUniqueInput
  }

  export type PollUpdateOneRequiredWithoutOptionsNestedInput = {
    create?: XOR<PollCreateWithoutOptionsInput, PollUncheckedCreateWithoutOptionsInput>
    connectOrCreate?: PollCreateOrConnectWithoutOptionsInput
    upsert?: PollUpsertWithoutOptionsInput
    connect?: PollWhereUniqueInput
    update?: XOR<XOR<PollUpdateToOneWithWhereWithoutOptionsInput, PollUpdateWithoutOptionsInput>, PollUncheckedUpdateWithoutOptionsInput>
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

  export type NestedEnumPollCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.PollCategory | EnumPollCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.PollCategory[] | ListEnumPollCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.PollCategory[] | ListEnumPollCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumPollCategoryFilter<$PrismaModel> | $Enums.PollCategory
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

  export type NestedEnumPollCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PollCategory | EnumPollCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.PollCategory[] | ListEnumPollCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.PollCategory[] | ListEnumPollCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumPollCategoryWithAggregatesFilter<$PrismaModel> | $Enums.PollCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPollCategoryFilter<$PrismaModel>
    _max?: NestedEnumPollCategoryFilter<$PrismaModel>
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

  export type PollOptionCreateWithoutPollInput = {
    id?: string
    label: string
    votes?: number
  }

  export type PollOptionUncheckedCreateWithoutPollInput = {
    id?: string
    label: string
    votes?: number
  }

  export type PollOptionCreateOrConnectWithoutPollInput = {
    where: PollOptionWhereUniqueInput
    create: XOR<PollOptionCreateWithoutPollInput, PollOptionUncheckedCreateWithoutPollInput>
  }

  export type PollOptionCreateManyPollInputEnvelope = {
    data: PollOptionCreateManyPollInput | PollOptionCreateManyPollInput[]
    skipDuplicates?: boolean
  }

  export type PollOptionUpsertWithWhereUniqueWithoutPollInput = {
    where: PollOptionWhereUniqueInput
    update: XOR<PollOptionUpdateWithoutPollInput, PollOptionUncheckedUpdateWithoutPollInput>
    create: XOR<PollOptionCreateWithoutPollInput, PollOptionUncheckedCreateWithoutPollInput>
  }

  export type PollOptionUpdateWithWhereUniqueWithoutPollInput = {
    where: PollOptionWhereUniqueInput
    data: XOR<PollOptionUpdateWithoutPollInput, PollOptionUncheckedUpdateWithoutPollInput>
  }

  export type PollOptionUpdateManyWithWhereWithoutPollInput = {
    where: PollOptionScalarWhereInput
    data: XOR<PollOptionUpdateManyMutationInput, PollOptionUncheckedUpdateManyWithoutPollInput>
  }

  export type PollOptionScalarWhereInput = {
    AND?: PollOptionScalarWhereInput | PollOptionScalarWhereInput[]
    OR?: PollOptionScalarWhereInput[]
    NOT?: PollOptionScalarWhereInput | PollOptionScalarWhereInput[]
    id?: StringFilter<"PollOption"> | string
    label?: StringFilter<"PollOption"> | string
    votes?: IntFilter<"PollOption"> | number
    pollId?: StringFilter<"PollOption"> | string
  }

  export type PollCreateWithoutOptionsInput = {
    id?: string
    title: string
    description: string
    imageUrl: string
    category: $Enums.PollCategory
    startsAt: Date | string
    endsAt: Date | string
    contractAddress?: string | null
    creatorId: string
    totalVotes?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PollUncheckedCreateWithoutOptionsInput = {
    id?: string
    title: string
    description: string
    imageUrl: string
    category: $Enums.PollCategory
    startsAt: Date | string
    endsAt: Date | string
    contractAddress?: string | null
    creatorId: string
    totalVotes?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PollCreateOrConnectWithoutOptionsInput = {
    where: PollWhereUniqueInput
    create: XOR<PollCreateWithoutOptionsInput, PollUncheckedCreateWithoutOptionsInput>
  }

  export type PollUpsertWithoutOptionsInput = {
    update: XOR<PollUpdateWithoutOptionsInput, PollUncheckedUpdateWithoutOptionsInput>
    create: XOR<PollCreateWithoutOptionsInput, PollUncheckedCreateWithoutOptionsInput>
    where?: PollWhereInput
  }

  export type PollUpdateToOneWithWhereWithoutOptionsInput = {
    where?: PollWhereInput
    data: XOR<PollUpdateWithoutOptionsInput, PollUncheckedUpdateWithoutOptionsInput>
  }

  export type PollUpdateWithoutOptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    category?: EnumPollCategoryFieldUpdateOperationsInput | $Enums.PollCategory
    startsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contractAddress?: NullableStringFieldUpdateOperationsInput | string | null
    creatorId?: StringFieldUpdateOperationsInput | string
    totalVotes?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PollUncheckedUpdateWithoutOptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    category?: EnumPollCategoryFieldUpdateOperationsInput | $Enums.PollCategory
    startsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endsAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contractAddress?: NullableStringFieldUpdateOperationsInput | string | null
    creatorId?: StringFieldUpdateOperationsInput | string
    totalVotes?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PollOptionCreateManyPollInput = {
    id?: string
    label: string
    votes?: number
  }

  export type PollOptionUpdateWithoutPollInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    votes?: IntFieldUpdateOperationsInput | number
  }

  export type PollOptionUncheckedUpdateWithoutPollInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    votes?: IntFieldUpdateOperationsInput | number
  }

  export type PollOptionUncheckedUpdateManyWithoutPollInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    votes?: IntFieldUpdateOperationsInput | number
  }



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