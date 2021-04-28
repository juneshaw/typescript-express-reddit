import { IDomainPost } from "./IDomainPost";

export interface IDomainArticle {
  subredditUrl: string;
  newsletterSubredditData: IDomainPost[]
}