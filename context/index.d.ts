import * as nearApi from "near-api-js";

export declare interface Context {
  nearAPI: typeof nearApi,
  near: nearApi.Near,
  account?: nearApi.Account,
  argv?: string[],
}