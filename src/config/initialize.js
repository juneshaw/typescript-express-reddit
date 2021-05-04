"use strict";

const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const awsParamStore = require("aws-param-store");
const region = process.env.NODE_ENV === "beta" ? "us-west-2" : "us-east-1";

/*
 * Initialize environment variables
 */
function init(ctl) {
  console.log("- Initializing configuration...");

  process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local") {
    console.log(`- Sourcing configuration values from local .env file for ${process.env.NODE_ENV}`.gray);

    try {
      const pathToEnvConfig = path.join(__dirname, `../../.env`);
      const fileExists = fs.existsSync(pathToEnvConfig);

      if (!fileExists) {
        console.log(`Invalid .env.${process.env.NODE_ENV} file:`.red);
        console.log(`${pathToEnvConfig}`.red);
        process.exit(1);
      }

      dotenv.config({ path: pathToEnvConfig });

      const { env, config, isDryRun, verbose } = ctl;

    } catch (e) {
      console.log(`${e.message}`.red);
      process.exit(1);
    }
  } else {
    console.log("--- Sourcing configuration from awsParamStore...");

    const env = awsParamStore.getParameterSync("/account_environment", { region }).Value;

    console.log("env from awsParamStore:", env);

    const parameters = awsParamStore.getParametersByPathSync(`/${env}/application-config/products-csa`, {
      region,
    });

    console.log({ parameters });

    console.log("  - Loading the following configuration values from AWS SSM Parameter Store".gray);

    for (const p of parameters) {
      process.env[p.Name.split("/").pop()] = p.Value;
      console.log(`${p.Name.split("/").pop()}`);
    }

    console.log("Inside init");
    console.log(`mysql_host:\t${process.env.DB_HOST}`.yellow);
    console.log(`mysql_user:\t${process.env.DB_USERNAME}`.yellow);
    console.log(`mysql_pw:\t${process.env.DB_PASSWORD ? "pw present" : "pw not present"}`.yellow);
    console.log(`mysql_db:\t${process.env.DB_NAME}`.yellow);
  }
}

module.exports = {
  init,
};
