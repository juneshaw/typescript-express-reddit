import { IDomainSubreddit } from "./IDomainSubreddit";
export interface IDomainUser {
  id: number;
  email: string;
  newsletter_enabled: boolean;
  newsletter_time: number;
  subreddits: IDomainSubreddit[];
} 