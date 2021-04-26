import { IRawSubreddit } from "./IRawSubreddit";

export interface IRawUser {
  id?: number;
  email?: string;
  newsletter_enabled?: boolean;
  newsletter_time?: number;
  subreddits: IRawSubreddit[];
}
