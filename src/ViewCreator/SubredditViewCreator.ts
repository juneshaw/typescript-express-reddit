import { IDomainSubreddit } from "../Domain";
import { ISubredditView } from "../View";
import { IViewCreator } from ".";

export class SubredditViewCreator implements IViewCreator<ISubredditView> {
  constructor(
    private subreddit: IDomainSubreddit
  ) {}

  public Execute(): ISubredditView {
    const { id, url } = this.subreddit;
    const subredditView: ISubredditView = {
      id,
      url
    };
    return subredditView;
  }

}
