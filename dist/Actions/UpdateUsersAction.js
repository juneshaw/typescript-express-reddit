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
exports.UpdateUsersAction = void 0;
const sqlite = require('sqlite3');
class UpdateUsersAction {
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
        this.queryBasic = () => `SELECT id, email, newsletter_enabled, newsletter_time FROM users `;
        this.buildSubredditViews = (subreddits) => {
            const subredditViews = new Array();
            subreddits.forEach(subreddit => {
                const { identifier } = subreddit;
                subredditViews.push({
                    identifier
                });
            });
            return subredditViews;
        };
        this.buildViews = (users) => {
            const userViews = new Array();
            users.forEach(user => {
                const { id, email, newsletter_enabled: newsletterEnabled, newsletter_time: newsletterTime } = user;
                const subredditViews = this.buildSubredditViews(user.subreddits);
                userViews.push({
                    id,
                    email,
                    newsletterEnabled,
                    newsletterTime,
                    subreddits: subredditViews,
                });
            });
            return userViews;
        };
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
                let users;
                users = yield this.select(db, querySql);
                const data = this.buildViews(users);
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
exports.UpdateUsersAction = UpdateUsersAction;
