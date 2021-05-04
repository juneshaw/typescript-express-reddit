/* tslint:disable: no-console */
import express from "express";
import { ExceptionType } from "../../framework/Common/HandledException";
import { HandledExceptionResponse } from "../../framework/Common/HandledExceptionResponse";
import { requestContext } from "../../lib/cls";

// tslint:disable-next-line:no-var-requires
const logger = require("@old/logger").logger;

/*
    This is the global error handler that captures all
    non-handled and thrown exceptions and ensures they
    are all handled through the same pipeline. This allows
    thrown exceptions to be declarative and standout as
    expected business logic.
*/
function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = (app: express.Application) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("- Setting up error handler...".gray);

      app.use(
        (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
          const responseOverride = {
            status: {},
            error: {},
          };
          const responseOverrideMessage = { message: {} };
          const emptyArray: any[] = [];

          const useCases = {
            "GET_/testTimeout/error": {},
            "GET_/health_check.*": {},
            "GET_/pc_health_check.*": {},
            "GET_/recurly/diff": {},
            "GET_/recurly/plans/*/diff*": {},
            "GET_/recurly/sync": {},
            "POST_/create-update-channel": {},
            "PUT_/create-update-channel": {},
            "POST_/clone-channel": {},
            "PUT_/disable-channel": {},
            "PUT_/disable-package": {},
            "PUT_/create-update-pay-per-view": {},
            "POST_/create-update-pay-per-view": {},
            "POST_/create-update-freemium": {},
            "PUT_/create-update-freemium": {},
            "GET_/channels/*": {},
            "GET_/channel/*": {},
            "DELETE_/recurly/job/details*": {},
            "GET_/packages-by-classification*": {},
            "GET_/classifications": {},
            "PUT_/disable-classification": {},
            "POST_/clone-classification": {},
            "GET_/classification/*": {},
            "GET_/pay-per-view/*": {},
            "GET_/partner-platform/*": {},
            "GET_/package/*": {},
            "POST_/clone-package": {},
            "PUT_/create-update-package": {},
            "GET_/plan/*": {},
            "GET_/freemiums": {},
            "GET_/freemium/*": {},
            "GET_/default-packages": {},
            "GET_/lines-of-business": {},
            "POST_/create-update-classification": {},
            "POST_/create-update-package": {},
            "POST_/create-update-plan": {},
            "PUT_/create-update-classification": {},
            "PUT_/create-update-plan": {},
            "PUT_/update-package-priority": {},
            "PUT_/update-package-classification-priority": {},
            "PUT_/update-package-classification": {},
            "PUT_/translationsGenerator": {},
            "POST_/create-package-classifications": {},
            "GET_/iau_enabled_status/*": {},
            "DELETE_/channel/*": {},
            "GET_/partner_packages/:packageId/*": {},
            "GET_/partner_classifications/:packageId/*": {},
            "DELETE_/delete-package/*": {},
          };
          const toBeAppended = `_${err.name}` || "";

          // TODO: This fix gets us past the regex's inability to detect/a/*/b/* paths effectively
          const urlSegment = req.url.split("?")[0];

          let useCase = `${req.method}_${urlSegment}`;

          const useCaseKeys = Object.keys(useCases);

          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < useCaseKeys.length; i++) {
            const uc = useCaseKeys[i];

            const regexStr = "^" + escapeRegExp(uc).replace(/\*/g, ".*") + "$";
            const regx = new RegExp(regexStr);

            if (regx.test(useCase)) {
              useCase = `${uc}${toBeAppended}`;
              break;
            }
          }
          switch (useCase) {
            // Return 500 with specific HTML message
            case "GET_/health_check":
            case "GET_/pc_health_check":
              responseOverride.error = `
<!DOCTYPE html>
<html>

<head>
  <title>Action Controller: Exception caught (500)</title>
  <style type="text/css">
    body {
      background-color: #fff;
      color: #666;
      text-align: center;
      font-family: arial, sans-serif;
    }

    div.dialog {
      width: 25em;
      padding: 0 4em;
      margin: 4em auto 0 auto;
      border: 1px solid #ccc;
      border-right-color: #999;
      border-bottom-color: #999;
    }

    h1 {
      font-size: 100%;
      color: #f00;
      line-height: 1.5em;
    }
  </style>
</head>

<body>
        <!-- This file lives in public/500.html -->
        <div class="dialog">
           <h1>We're sorry, but something went wrong.</h1>
        </div>
</body>

</html>`;
              res.status(500);
              res.set("Content-Type", "text/html");
              res.send(responseOverride.error);
              break;

            // Return 404 with generic 404 HTML page
            // TestTimeOut Error - Should be removed later
            case "GET_/testTimeout/errorNotFound":
            case "GET_/channels/*_ResultNotFoundError":
              responseOverride.error = `
<!DOCTYPE html>
<html>

<head>
  <title>The page you were looking for doesn't exist (404)</title>
  <style type="text/css">
    body {
      background-color: #fff;
      color: #666;
      text-align: center;
      font-family: arial, sans-serif;
    }

    div.dialog {
      width: 25em;
      padding: 0 4em;
      margin: 4em auto 0 auto;
      border: 1px solid #ccc;
      border-right-color: #999;
      border-bottom-color: #999;
    }

    h1 {
      font-size: 100%;
      color: #f00;
      line-height: 1.5em;
    }
  </style>
</head>

<body>
  <!-- This file lives in public/404.html -->
  <div class="dialog">
    <h1>The page you were looking for doesn't exist.</h1>
    <p>You may have mistyped the address or the page may have moved.</p>
  </div>
</body>

</html>`;
              res.status(404);
              res.set("Content-Type", "text/html");
              res.send(responseOverride.error);
              break;

            case "POST_/selected/packages/channels*_NotFoundError": {
              if (err.message == "channels") {
                responseOverride.error = "No Channels Found";
                res.status(404);
              } else if (err.message == "request_invalid") {
                res.status(422);
                responseOverride.error = "Requested Body is Invalid";
              }
              res.send(responseOverride);
              break;
            }

            case "GET_/plan/*_ResultNotFoundError": {
              responseOverrideMessage.message = "(FAILURE):Plans not found!";
              res.status(404);
              res.send(responseOverrideMessage);
              break;
            }

            case "GET_/classification/*_ResultNotFoundError": {
              responseOverrideMessage.message = "(ERROR):No Classification found!";
              res.status(404);
              res.send(responseOverrideMessage);
              break;
            }

            case "GET_/partner-platform/*_ResultNotFoundError": {
              responseOverrideMessage.message = "(FAILURE):Partner Platform not found!";
              res.status(404);
              res.send(responseOverrideMessage);
              break;
            }

            case "GET_/pay-per-view/*_NotFoundError": {
              responseOverrideMessage.message = "(FAILURE):Pay per view not found!";
              res.status(404);
              res.send(responseOverrideMessage);
              break;
            }

            case "GET_/recurly/diff_BadRequestError": {
              responseOverride.error = `${err.message}`;
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "GET_/channels/*_BadRequestError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "GET_/channel/*_ResultNotFoundError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "DELETE_/delete-package/*_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "GET_/channel/*_NotFoundError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "GET_/recurly/plans/*/diff*_BadRequestError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "GET_/iau_enabled_status/*_BadRequestError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "GET_/partner_classifications/:packageId/*_BadRequestError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "GET_/recurly/sync_BadRequestError": {
              if (err.message) {
                responseOverride.error = err.message;
              } else {
                responseOverride.error =
                  "Plan is more than an hour old, please run a new diff analysis.";
              }
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "DELETE_/channel/*_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "PUT_/disable-channel_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/create-update-channel_BadRequestError":
            case "POST_/create-update-channel_Error": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/create-update-channel_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "GET_/plan/*_BadRequestError":
            case "GET_/partner_packages/:packageId/*_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "PUT_/create-update-channel_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/create-update-pay-per-view_BadRequestError":
            case "PUT_/create-update-pay-per-view_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }
            case "POST_/create-update-freemium_BadRequestError":
            case "PUT_/create-update-freemium_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "PUT_/disable-channel_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "PUT_/disable-package_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/clone-channel_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/clone-package_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/clone-package_Error": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(422);
              res.send(responseOverride);
              break;
            }

            case "PUT_/create-update-package_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "PUT_/update-package-classification-priority_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "PUT_/update-package-classification_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/create-package-classifications_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/create-package-classifications_ResultNotFoundError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "POST_/create-package-classifications_NotFoundError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "PUT_/disable-classification_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "POST_/clone-classification_BadRequestError": {
              responseOverride.error = `${err.message}`;
              responseOverride.status = {
                code: "ERROR",
                message: `${err.message}`,
              };
              res.status(400);
              res.send(responseOverride);
              break;
            }

            case "DELETE_/recurly/job/details*_NotFoundError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "DELETE_/recurly/job/details*_BadRequestError": {
              responseOverride.error = `${err.message}`;
              res.status(422);
              res.send(responseOverride);
              break;
            }

            case "GET_/packages-by-classification*_NotFoundError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }

            case "GET_/classifications_NotFoundError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }
            case "GET_/package/*_NotFoundError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }
            case "GET_/freemiums_NotFoundError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }
            case "GET_/freemium/*_NotFoundError": {
              responseOverride.error = "(ERROR):Freemium not found!";
              res.status(404);
              res.send(responseOverride);
              break;
            }
            case "GET_/default-packages_NotFoundError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }
            case "GET_/package/*_Error": {
              responseOverride.error = `${err.message}`;
              res.status(400);
              res.send(responseOverride);
              break;
            }
            case "GET_/package/*_BadRequestError": {
              responseOverride.error = `${err.message}`;
              res.status(400);
              res.send(responseOverride);
              break;
            }
            case "GET_/lines-of-business_NotFoundError": {
              responseOverride.error = `${err.message}`;
              res.status(404);
              res.send(responseOverride);
              break;
            }
            case "POST_/create-update-classification_BadRequestError": {
              responseOverride.error = `${err.message}`;
              res.status(422);
            }
            case "POST_/create-update-package_BadRequestError": {
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              responseOverride.error = err.message;
              res.status(400);
              res.send(responseOverride);
              break;
            }
            case "POST_/create-update-plan_BadRequestError": {
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              responseOverride.error = err.message;
              res.status(400);
              res.send(responseOverride);
              break;
            }
            case "PUT_/create-update-classification_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              responseOverride.error = err.message;
              res.status(400);
              res.send(responseOverride);
              break;
            }
            case "PUT_/create-update-plan_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              responseOverride.error = err.message;
              res.status(400);
              res.send(responseOverride);
              break;
            }
            case "PUT_/update-package-priority_BadRequestError": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              responseOverride.error = err.message;
              res.status(400);
              res.send(responseOverride);
              break;
            }
            case "POST_/translationsGenerator": {
              responseOverride.error = err.message;
              responseOverride.status = {
                code: "ERROR",
                message: err.message,
              };
              responseOverride.error = err.message;
              res.status(400);
              res.send(responseOverride);
              break;
            }
            default:
              console.log(
                `Handled Exception (${err.exceptionType || ExceptionType.SERVICE}): ${err}`.red
                  .italic
              );

              res.status(err.exceptionType || ExceptionType.SERVICE);
              res.send(
                new HandledExceptionResponse("An error occurred. See body for details.", err)
              );
          }
          const errorLog = {
            useCase,
            url: req.url,
            name: err.name,
            message: err.message,
            stack: err.stack,
            status: res.statusCode,
            env: process.env.NODE_ENV,
          };
          logger.error(JSON.stringify(errorLog), requestContext);
        }
      );
      resolve(app);
    } catch (err) {
      reject(err);
    }
  });
};
