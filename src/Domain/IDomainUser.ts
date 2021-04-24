import { IDomainSubreddit } from "./IDomainSubreddit";
export interface IDomainUser {
  id: number;
  email: string;
  newsletter_enabled: boolean;
  newsletter_time: string;
  subreddits: IDomainSubreddit[];
} 