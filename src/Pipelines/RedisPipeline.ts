/* tslint:disable: no-console */
import { Express } from "express";
import { client } from "../../lib/redis";
import { ApiCache } from "../../lib/redis"

module.exports = async (app: Express) => {

  /*
   ********************************************************
   * products-csa-admin is not expected to require caching
   * therefore we just return the express app
   * IF in the future caching is desired, remove this comment
   * and the next active line of code (return app;)
   ********************************************************
   */
  return app;

  if (process.env.REDIS_CACHING_ENABLED !== "true") {
    console.log(
      `- Setting up caching... Redis caching disabled - REDIS_CACHING_ENABLED set to ${process.env.REDIS_CACHING_ENABLED}, `
        .gray
    );
    return app;
  }

  console.log("- Setting up caching... Redis caching enabled...".gray);
  //todo: remove after caching is accepted
  // const cache = apicache.options({
  //   redisClient: client.Client
  // }).middleware;

  const apicache = new ApiCache(client.Client);
  app.use(apicache.middleware());

   //todo: remove comments after caching is accepted
  // add route to display cache index
  // app.get("/cache/index", (req, res) => {
  //   res.json(apicache.getIndex());
  // });

  // // add route to manually clear target/group
  // app.get("/cache/clear/:target?", (req, res) => {
  //   res.json(apicache.clear(req.params.target));
  // });

  return app;
};
