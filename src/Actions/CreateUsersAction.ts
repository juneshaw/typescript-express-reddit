const sqlite = require('sqlite3');
import { Database } from 'sqlite'
import { IDomainAction } from "./IDomainAction";
import { IDomainSubreddit, IDomainUser } from "../Domain";
import { IRawUser } from "../Raw";
import { IResponseView, ISubredditView } from "../View";
import { SubredditViewCreator, UserViewCreator } from "../ViewCreator";
import { IRawSubreddit } from "../Raw/IRawSubreddit";

export class CreateUsersAction implements IDomainAction<IRawUser, IResponseView> {
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

  private selectSubreddit(db: Database, querySql: string): Promise<IDomainSubreddit[]> {
    return new Promise((resolve, reject) => {
        db.all(querySql, (err: any, subredditResults: IDomainSubreddit[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(subredditResults);
          }
        })
    });
  }

  private queryInsertUser = (user: IRawUser) => {
    const { email, newsletter_enabled, newsletter_time, subreddits } = user;
    // Assume same object structure, nothing missing, for now
    const sql = 
      `INSERT INTO users 
      (id, email, newsletter_enabled, newsletter_time)
      VALUES (
        (SELECT id FROM users WHERE email = "${email}"),
        "${email}",
        "${newsletter_enabled}",
        "${newsletter_time}");`;
    return sql;
  }

  private queryInsertSubreddit = (subreddit: IRawSubreddit) => {
    const { url } = subreddit;
    // Assume same object structure, nothing missing, for now
    const sql = 
      `INSERT OR REPLACE INTO subreddits
      (id, url)
      VALUES (
        (SELECT id FROM subreddits WHERE url = "${url}"),
        "${url}");`;
    return sql;
  }

  private queryInsertUserSubreddits = (userId: number, subredditId: number) => {
    console.log('user.id', userId);
    console.log('subreddit.id', subredditId);
    // Assume same object structure, nothing missing, for now
    const sql = 
      `INSERT OR REPLACE INTO user_subreddits
      (id, user_id, subreddit_id)
      VALUES (
        (SELECT id FROM user_subreddits WHERE user_id =  ${userId} AND subreddit_id = ${subredditId}),
        ${userId},
        ${subredditId});`;
    return sql;
  }

  private querySelectUser = (user: IRawUser) => {
    // Assume same object structure, nothing missing, for now
    const sql = 
    `SELECT * FROM users
    WHERE users.email = "${user.email}";`;
    return sql;
  }

  private querySelectSubreddit = (subredditUrl: string) => {
    // Assume same object structure, nothing missing, for now
    const sql = 
    `SELECT subreddits.* FROM subreddits
    WHERE subreddits.url = "${subredditUrl}";`
    return sql;
  }

  public async Execute(params: IRawUser): Promise<IResponseView> {
    let db = await this.connectDb('./db/users.db');
    let responseView: IResponseView;

    try {
      // Valid request params TBD
      // Fix empty array subreddits

      // Insert user
      let userView = null;
      await this.select(db, this.queryInsertUser(params));
      const result = await this.select(db, this.querySelectUser(params));
      const user = result.length > 0
      ? result[0]
      : null;

      if (user) {

        // Insert subreddits
        const subreddits = new Array<IDomainSubreddit>();
        for (const paramSubreddit of params.subreddits) {
          await this.select(db, this.queryInsertSubreddit(paramSubreddit));
          const subreddit = await this.selectSubreddit(db, this.querySelectSubreddit(paramSubreddit.url));
          if (subreddit.length > 0) {
            subreddits.push(subreddit[0]);
          }
        };

        // Insert user subreddit joins
        const subredditViews = new Array<ISubredditView>();
        for (const subreddit of subreddits) {
          await this.select(db, this.queryInsertUserSubreddits(user.id, subreddit.id));
          subredditViews.push(new SubredditViewCreator(subreddit).Execute());
        };
        user.subreddits = subredditViews;
        userView = new UserViewCreator(user).Execute();
      }

      responseView = {
        status: {
          code: 200,
          message: ""
        },
        data: userView
      };
    } catch {
      responseView = {
        status: {
          code: 422,
          message: "Failed to create user"
        }
      };
    }
    return responseView;
  }
}
