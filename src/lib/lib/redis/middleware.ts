// tslint:disable-next-line:no-var-requires
const pkg = require("../../../package.json");
import express from "express";
import { RedisClient, RedisError } from "redis";

export class ApiCache {

  private redisClient: RedisClient;

  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  public middleware() {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.headers["x-apicache-bypass"]
        || req.path.toLowerCase().indexOf("/cache/") > -1
        || req.path.toLowerCase().indexOf("/info") > -1
        || req.path.toLowerCase().indexOf("/health_check") > -1
        || req.path.toLowerCase().indexOf("/pc_health_check") > -1
        || req.method === "POST"
        || req.method === "OPTIONS"
        || req.method === "HEAD") {
        console.log("bypassing cache");
        return next();
      }

      let key = req.originalUrl || req.url;
      if (req.body) {
        key = key + JSON.stringify(req.body);
      }

      try {
        this.redisClient.get(key, (err, obj) => {
          if (err) {
            console.log(err);
            return next();
          }

          if (!obj) {
            // console.log(("Cache miss, making response cacheable if 200 status code.");
            return this.makeResponseCacheable(req, res, next, key, this.redisClient);
          }

          console.log("Cache hit, returning from cache");

          return this.sendCachedResponse(req, res, JSON.parse(obj), next);
        });
      } catch (err) {
        // console.log(err);
        next();
      }
    };
  }

  public setKeyValue(req: express.Request, key: string, data: any) {
    const payload = data[0];

    const responseContentType = typeof payload;

    const requestEtag = req.headers["if-none-match"];
    let headers;

    switch (responseContentType) {
      case "object":
        headers = {
          "content-type": "application/json",
          "etag": requestEtag
        };
        break;

      case "string":
        if (payload.toLowerCase().includes("html")) {
          headers = {
            "content-type": "text/html",
            "etag": requestEtag
          };
        } else {
          headers = {
            "content-type": "text/plain",
            "etag": requestEtag
          };
        }
        break;

      default:
        console.log("Unsupported responseContentType: ", responseContentType);
    }

    if (responseContentType === "object" || responseContentType === "string") {
      const cacheObject = createCacheObject(
        200,
        {
          "content-type": "application/json",
          "etag": requestEtag,
        },
        Buffer.from(JSON.stringify(payload)),
      );

      this.redisClient.get(key, (err: Error | null) => {
        if (!err) {
          this.redisClient.set(key, JSON.stringify(cacheObject));
        }
      });
    }
  }

  private sendCachedResponse(req: express.Request, res: express.Response, cacheObject: { data: any, headers: any }, next: express.NextFunction) {
    console.log("Send cached response...");

    if (process.env.NODE_ENV !== "production") {
      res.set("express-api-cache", "redis");
      res.set("express-api-cache-version", pkg.version);
    }

    let data = cacheObject.data;
    if (data && data.type === "Buffer") {
      data = typeof data.data === "number" ? Buffer.alloc(data.data) : Buffer.from(data.data);
    }

    // test Etag against If-None-Match for 304
    const cachedEtag = cacheObject.headers.etag;
    const requestEtag = req.headers["if-none-match"];

    if (requestEtag && cachedEtag === requestEtag) {
      // console.log('Etag match')
      res.set("Etag", requestEtag);
      return res.status(304).send();
    }

    // console.log('returning cached response')
    res.setHeader("content-type", cacheObject.headers["content-type"]);
    return res.status(200).send(data);
  }

  private makeResponseCacheable(req: express.Request, res: express.Response, next: express.NextFunction, key: string, redisClient: RedisClient) {
    // @ts-ignore
    res.sendResponse = res.send;
    // @ts-ignore
    res.send = (content) => {
      try {
        if (res.statusCode === 200) {
          const cacheObject = createCacheObject(
            res.statusCode,
            res.getHeaders(),
            Buffer.from(content),
          );
          // console.log('Caching object as buffer...')

          redisClient.set(key, JSON.stringify(cacheObject));
        } else {
          // console.log('Response not 200, so not caching')
        }
      } catch (e) {
        // console.log(e)
        // console.log(e.stack)
        // console.log('Error caching object')
        // console.log(e.stack);
      }

      // @ts-ignore
      return res.sendResponse(content);
    };

    next();
  }
}

function createCacheObject(status: number, headers: any, data: any) {
  return {
    status,
    headers,
    data,
    timestamp: new Date().getTime() / 1000, // seconds since epoch.  This is used to properly decrement max-age headers in cached responses.
  };
}
