import { IDomainSubredditNewsletter } from "./IDomainSubredditNewsletter";

export interface IDomainNewsletter {
  subredditUrl: string;
  newsletterSubredditData: IDomainSubredditNewsletter[]
}