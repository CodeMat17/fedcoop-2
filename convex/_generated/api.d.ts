/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as forms from "../forms.js";
import type * as migrations from "../migrations.js";
import type * as public_ from "../public.js";
import type * as register from "../register.js";
import type * as revalidate from "../revalidate.js";
import type * as seed from "../seed.js";
import type * as stateRows from "../stateRows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  forms: typeof forms;
  migrations: typeof migrations;
  public: typeof public_;
  register: typeof register;
  revalidate: typeof revalidate;
  seed: typeof seed;
  stateRows: typeof stateRows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
