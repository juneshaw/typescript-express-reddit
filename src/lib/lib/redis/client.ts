import * as r from "redis";
// @ts-ignore
import patchRedis from "cls-redis-patch";
// @ts-ignore
import { requestContext } from "../cls/index";


class Redis {
  private client: r.RedisClient;

  public init(params: { host: string; port: number }) {
    this.client = r.createClient(params);
  }

  get Client(): r.RedisClient {
    patchRedis(requestContext.namespace());
    return this.client;
  }
}

export const client = new Redis();
