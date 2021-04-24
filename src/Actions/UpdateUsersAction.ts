const sqlite = require('sqlite3');
import { Database } from 'sqlite'
import { IDomainAction } from "./IDomainAction";
import { IDomainSubreddit, IDomainUser } from "../Domain";
import { IRawUser } from "../Raw";
import { ISubredditView, IUserView, IUserDataView } from "../View";

export class UpdateUsersAction implements IDomainAction<IRawUser, IUserView> {
  constructor() {}
  private connectDb = (databaseName: string): Promise<Database> => {
    return new Promise(function(resolve, reject) {
      let db = new sqlite.Database(databaseName, sqlite.OPEN_READWRITE, (err: any) => {
        if (err) {
            reject(new Error('Failed database connect'));
            console.error(err.message);
        }
        resolve(db);
      })
    })
  }

  private select(db: Database, querySql: string): Promise<IDomainUser[]> {
    return new Promise((resolve, reject) => {
        db.all(querySql, (err: any, userResults: IDomainUser[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(userResults);
          }
        })
    });
  }

  private queryBasic = () => `SELECT id, email, newsletter_enabled, newsletter_time FROM users `;

  private buildSubredditViews = (subreddits: IDomainSubreddit[]): ISubredditView[] => {
    const subredditViews = new Array<ISubredditView>();
    subreddits.forEach(subreddit => {
      const { identifier } = subreddit;
      subredditViews.push(
        {
          identifier 
        }
      )
    })
    return subredditViews;
  }

  private buildViews = (users: IDomainUser[]): IUserDataView[] => {
    const userViews = new Array<IUserDataView>();
    users.forEach(user => {
      const { id, email, newsletter_enabled: newsletterEnabled, newsletter_time: newsletterTime } = user;
      const subredditViews = this.buildSubredditViews(user.subreddits);
      userViews.push(
        {
          id,
          email,
          newsletterEnabled,
          newsletterTime,
          subreddits: subredditViews,
        }
      )
    })
    return userViews;
  }
  
  public async Execute(params: IRawUser): Promise<IUserView> {
    let userView: IUserView;

    // Validate inputs
    let errorMessages = new Array<string>();

    // Invalid request params
    if (errorMessages.length !== 0) {
      userView = {
        status: {
          code: 422,
          message: errorMessages.join(", ")
        }
      }
    } else {
      // Valid request params
      let querySql = this.queryBasic();
      let db = await this.connectDb('./db/users.db');
      let users;
      users = await this.select(db, querySql);
      const data = this.buildViews(users);
      userView = {
        status: {
          code: 200
        },
        data
      };
    }
    return userView;
  }
}
