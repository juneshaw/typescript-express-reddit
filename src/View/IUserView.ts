import { ISubredditView } from './ISubredditView';
import { IStatusView } from './IStatusView';

export interface IUserDataView {
  id: number;
  email: string;
  newsletterEnabled: boolean;
  newsletterTime: string;
  subreddits: ISubredditView[];
}
export interface IUserView {
  status: IStatusView,
  data?: IUserDataView[]
}