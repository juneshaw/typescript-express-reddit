"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubredditViewCreator = void 0;
class SubredditViewCreator {
    constructor(subreddit) {
        this.subreddit = subreddit;
    }
    Execute() {
        const { identifier } = this.subreddit;
        const subredditView = {
            identifier
        };
        return subredditView;
    }
}
exports.SubredditViewCreator = SubredditViewCreator;
