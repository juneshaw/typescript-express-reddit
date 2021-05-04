/* tslint:disable: no-console */
/* tslint:disable: no-var-requires */
import "colors";
import express from "express";
import { Server } from "typescript-rest";

import { db } from "@old/mysql";

import { initializeConfig } from "./api/Config/SettingsConfig";
import { requestContext } from "./lib/cls";
import { client } from "./lib/redis";

initializeConfig();

requestContext.init("nsid");

db.init({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
});

if (process.env.REDIS_CACHING_ENABLED === "true") {
  client.init({
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
  });
}

const entry: express.Application = express();

require("./api/Pipelines/ExpressPipeline")(entry)
  .then((app: express.Application) => require("./api/Pipelines/SwaggerPipeline")(app))
  .then((app: express.Application) => require("./api/Pipelines/RedisPipeline")(app))
  .then((app: express.Application) => require("./api/Pipelines/CorsPipeline")(app))
  .then((app: express.Application) => {
    console.log("- Setting up controllers...".gray);
    Server.loadServices(app, "api/Controllers/*", __dirname);
    return app;
  })
  .then((app: express.Application) => require("./api/Pipelines/ErrorsPipeline")(app))
  .then((app: express.Application) => {
    app.listen(process.env.PORT, () => {
      console.log(`*** product-csa-admin is listening on ${process.env.PORT} ***`.yellow);
    });
  })
  .catch((err: Error) => {
    err.stack ? console.error(err.stack) : console.error(err);
  });
