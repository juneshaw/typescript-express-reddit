/* tslint:disable: no-console */
import cors from "cors";
import { Express } from "express";


module.exports = async (app: Express) => {
  console.log("- Setting up CORS...".gray);
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "HEAD", "DELETE", "OPTIONS"],
  }));
  return app;
};
