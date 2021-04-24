"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersAction = void 0;
const sqlite = require('sqlite3');
const ViewCreator_1 = require("../ViewCreator");
class GetUsersAction {
    constructor() {
        this.connectDb = (databaseName) => {
            return new Promise(function (resolve, reject) {
                let db = new sqlite.Database(databaseName, sqlite.OPEN_READWRITE, (err) => {
                    if (err) {
                        reject(new Error('Failed database connect'));
                        console.error(err.message);
                    }
                    resolve(db);
                });
            });
        };
        this.queryBasic = () => `SELECT users.id, email, newsletter_enabled, newsletter_time, subreddits.* FROM users
    LEFT JOIN user_subreddits on users.id = user_subreddits.user_id
    LEFT JOIN subreddits on user_subreddits.subreddit_id = subreddits.id`;
    }
    select(db, querySql) {
        return new Promise((resolve, reject) => {
            db.all(querySql, (err, userResults) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(userResults);
                }
            });
        });
    }
    Execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let userView;
            let errorMessages = new Array();
            if (errorMessages.length !== 0) {
                userView = {
                    status: {
                        code: 422,
                        message: errorMessages.join(", ")
                    }
                };
            }
            else {
                let querySql = this.queryBasic();
                let db = yield this.connectDb('./db/users.db');
                const users = yield this.select(db, querySql);
                const data = new Array();
                users.forEach(user => {
                    data.push(new ViewCreator_1.UserViewCreator(user).Execute());
                });
                userView = {
                    status: {
                        code: 200
                    },
                    data
                };
            }
            return userView;
        });
    }
}
exports.GetUsersAction = GetUsersAction;
