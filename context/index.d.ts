import * as nearApi from "near-api-js";

export declare interface Context {
  nearAPI: nearApi,
  near: nearApi.Near,
  account?: nearApi.Account,
  argv?: string[],
}