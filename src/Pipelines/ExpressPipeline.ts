/* eslint-disable no-unused-expressions */
/* tslint:disable: no-console */
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import uuid from "uuid";
import { requestContext } from "../../lib/cls";

import { client } from "../../lib/redis";
import { ApiCache } from "../../lib/redis";
import { TimeOut } from "../../lib/timeout";

const apicache = new ApiCache(client.Client);

// tslint:disable-next-line:no-var-requires
const timeout = new TimeOut();

// tslint:disable-next-line:no-var-requires
const logger = require("@old/logger").logger;

module.exports = (app: express.Application) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("- Setting up express...".gray);
      app.set("trust proxy", 1);

      const validLocales = ["en", "es", "gu", "hi", "pa", "pt-BR"];
      const defaultLocale = "en";
      app.use(
        bodyParser.urlencoded({
          extended: false,
        }),
      );
      // To preserve context bodyParser must be loaded before the requestContext.middleware
      app.use(bodyParser.json());
      app.use(requestContext.middleware());

      app.use("/*", cookieParser());

      // config for express-timeout-handler
      const timeoutConfig = {
        timeout: 6000000, // required timeout in milliseconds
        onTimeout: (req: express.Request, res: express.Response) => {
          res.statusMessage = "Server Timeout";
          res.status(503).send("Service timed out. Please retry.");
        },
        onDelayedResponse: (req: express.Request, method: any, value: any, requestTime: any = 1000) => {
          console.log(`Attempted to call ${method} after timeout`);
          let key = req.originalUrl || req.url;
          if (!!req.body) {
            key = key + JSON.stringify(req.body);
          }
          const isError = typeof value === "object" &&
            (
              JSON.stringify(value).includes("error") ||
              JSON.stringify(value).includes("404") ||
              JSON.stringify(value).includes("422") ||
              JSON.stringify(value).includes("500") ||
              JSON.stringify(value).includes("text/html") ||
              Object.keys(JSON.stringify(value)).length === 0 ||
              JSON.stringify(value).includes("[]")
            )
            ? true : false;
          if (!isError && req.method.toUpperCase() === "GET" && (method === "res.json" || method === "res.send")) {
            apicache.setKeyValue(req, key, value);
          }
        },
      };

      app.use(timeout.handler(timeoutConfig));


      app.use((req, res, next) => {
        const traceId = req.headers["x-b3-traceid"] || uuid.v4();
        res.set("X-B3-TraceId", traceId);
        requestContext.set("X-B3-TraceId", traceId);
        next();
      });

      app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`.yellow);
        req.url = req.url.replace(".json", "");
        let message;
        if (req.body === {}) {
          message = {
            method: req.method,
            url: req.url,
            user_agent: req.headers["user-agent"],
            env: process.env.NODE_ENV,
          };

          // logger.info(`method: ${req.method}, path: ${req.url}, useragent: ${req.headers['user-agent']}, environment: ${process.env.NODE_ENV}`, requestContext);
        } else {
          const requestBody = JSON.stringify(req.body);
          const requestQuery = JSON.stringify(req.query);
          // message = `method: ${req.method}, url: ${req.url}, path: ${req.path}, query: ${requestQuery}, body: ${requestBody}, useragent: ${req.headers['user-agent']}, environment: ${process.env.NODE_ENV}`;

          message = {
            method: req.method,
            url: req.url,
            user_agent: req.headers["user-agent"],
            env: process.env.NODE_ENV,
            path: req.path,
            query: requestQuery,
            body: requestBody,
          };

          // logger.info(`method: ${req.method}, url: ${req.url}, path: ${req.path}, query: ${requestQuery}, body: ${requestBody}, useragent: ${req.headers['user-agent']}, environment: ${process.env.NODE_ENV}`, requestContext);
        }
        logger.info(JSON.stringify(message), requestContext);
        next();
      });

      app.use((req, res, next) => {
        if (process.env.NODE_ENV !== "production") {
          res.setHeader("x-server", "nodejs");
        }
        next();
      });

      /* This middleware will attempt to use locale if provided as a query param, if no valid query param for local given
      it will fall back to a default. */
      app.use((req, res, next) => {
        // @ts-ignore
        const locale: string = req.query.locale!;
        const headerLocale = req.headers["accept-language"]!;
        if (validLocales.includes(locale)) {
          requestContext.set("locale", locale);
        } else if (validLocales.includes(headerLocale)) {
          requestContext.set("locale", headerLocale);
        } else {
          requestContext.set("locale", defaultLocale);
        }
        next();
      });

      resolve(app);
    } catch (err) {
      reject(err);
    }
  });
};
