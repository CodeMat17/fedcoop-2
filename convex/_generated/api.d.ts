/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as access from "../access.js";
import type * as admin_albums from "../admin/albums.js";
import type * as admin_cooperatives from "../admin/cooperatives.js";
import type * as admin_dashboard from "../admin/dashboard.js";
import type * as admin_directors from "../admin/directors.js";
import type * as admin_events from "../admin/events.js";
import type * as admin_inbox from "../admin/inbox.js";
import type * as admin_pages from "../admin/pages.js";
import type * as admin_posts from "../admin/posts.js";
import type * as admin_resources from "../admin/resources.js";
import type * as cloudinary from "../cloudinary.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as forms from "../forms.js";
import type * as migrations from "../migrations.js";
import type * as public_ from "../public.js";
import type * as register from "../register.js";
import type * as revalidate from "../revalidate.js";
import type * as seed from "../seed.js";
import type * as slug from "../slug.js";
import type * as stateRows from "../stateRows.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  access: typeof access;
  "admin/albums": typeof admin_albums;
  "admin/cooperatives": typeof admin_cooperatives;
  "admin/dashboard": typeof admin_dashboard;
  "admin/directors": typeof admin_directors;
  "admin/events": typeof admin_events;
  "admin/inbox": typeof admin_inbox;
  "admin/pages": typeof admin_pages;
  "admin/posts": typeof admin_posts;
  "admin/resources": typeof admin_resources;
  cloudinary: typeof cloudinary;
  emailTemplates: typeof emailTemplates;
  forms: typeof forms;
  migrations: typeof migrations;
  public: typeof public_;
  register: typeof register;
  revalidate: typeof revalidate;
  seed: typeof seed;
  slug: typeof slug;
  stateRows: typeof stateRows;
  users: typeof users;
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
