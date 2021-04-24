"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserViewCreator = void 0;
const ViewCreator_1 = require("../ViewCreator");
class UserViewCreator {
    constructor(user) {
        this.user = user;
    }
    Execute() {
        const { id, email, newsletter_enabled: newsletterEnabled, newsletter_time: newsletterTime, subreddits } = this.user;
        const subredditViews = new Array();
        subreddits && subreddits.forEach(subreddit => {
            subredditViews.push(new ViewCreator_1.SubredditViewCreator(subreddit).Execute());
        });
        const userView = {
            id,
            email,
            newsletterEnabled,
            newsletterTime,
            subreddits: subredditViews,
        };
        return userView;
    }
}
exports.UserViewCreator = UserViewCreator;
