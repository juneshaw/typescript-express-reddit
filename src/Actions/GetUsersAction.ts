const sqlite = require('sqlite3');
import { Database } from 'sqlite'
import { IDomainAction } from "./IDomainAction";
import { IDomainSubreddit, IDomainUser } from "../Domain";
import { IRawUser } from "../Raw";
import { IResponseView, IUserView, IUserDataView } from "../View";
import { UserViewCreator } from "../ViewCreator"

export class GetUsersAction implements IDomainAction<IRawUser, IUserView> {
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

  private querySelectSubreddit = (subredditUrl: string) => {
    // Assume same object structure, nothing missing, for now
    const sql =
    `SELECT subreddits.* FROM subreddits
    WHERE subreddits.url = "${subredditUrl}";`
    return sql;
  }

  private querySelectUsers = () =>
    `SELECT * from users;`;

  private querySelectUserSubreddits = (userId: number) => {
    // Assume same object structure, nothing missing, for now
    const sql =
    `SELECT subreddits.* FROM users
    JOIN user_subreddits on users.id = user_subreddits.user_id
    JOIN subreddits on user_subreddits.subreddit_id = subreddits.id
    WHERE users.id = "${userId}";`
    return sql;
  }

  public async Execute(params: IRawUser): Promise<IUserView> {
    let userView: IResponseView;

    // Validate inputs, if any
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
      let db = await this.connectDb('./db/users.db');

      const users = await this.select(db, this.querySelectUsers());
      const data = new Array<IUserDataView>();
      let subreddits;
      for (const user of users) {
        user.subreddits = await this.selectSubreddit(db, this.querySelectUserSubreddits(user.id));
        data.push(new UserViewCreator(user).Execute());
      };
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
