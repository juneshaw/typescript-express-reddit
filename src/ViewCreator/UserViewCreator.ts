import { IDomainUser } from "../Domain";
import { ISubredditView, IUserDataView } from "../View";
import { IViewCreator, SubredditViewCreator } from "../ViewCreator";

export class UserViewCreator implements IViewCreator<IUserDataView> {
  constructor(
    private user: IDomainUser
  ) {}

  public Execute(): IUserDataView {
    const { id, email, newsletter_enabled: newsletterEnabled, newsletter_time: newsletterTime, subreddits } = this.user;
    const subredditViews = new Array<ISubredditView>();
    subreddits && subreddits.forEach(subreddit => {
      subredditViews.push(new SubredditViewCreator(subreddit).Execute());
    })
    const userView: IUserDataView = {
      id,
      email,
      newsletterEnabled,
      newsletterTime,
      subreddits: subredditViews,
    };
    return userView;
  }
}
