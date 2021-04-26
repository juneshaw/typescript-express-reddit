import { ISubredditView } from './ISubredditView';
import { IStatusView } from './IStatusView';

export interface IUserDataView {
  id: number;
  email: string;
  newsletterEnabled: boolean;
  newsletterTime: number;
  subreddits: ISubredditView[];
}
export interface IUserView {
  status: IStatusView,
  data?: IUserDataView[]
}