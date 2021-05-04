/* tslint:disable: no-console */
import { Express } from "express";
import { Server } from "typescript-rest";

module.exports = (app: Express) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("- Setting up swagger...".gray);
      Server.swagger(app, {
        endpoint: "swagger-ui",
        filePath: "./src/swagger.json",
        schemes: ["http"]
      });
      app.get("/", (req, res) => res.redirect("/swagger-ui"));
      resolve(app);
    } catch (err) {
      reject(err);
    }
  });
};
