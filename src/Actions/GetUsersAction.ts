const sqlite = require('sqlite3');
import { Database } from 'sqlite'
import { IDomainAction } from "./IDomainAction";
import { IDomainUser } from "../Domain";
import { IRawUser } from "../Raw";
import { IUserView, IUserDataView } from "../View";
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

  private queryBasic = () =>
    `SELECT users.id, email, newsletter_enabled, newsletter_time, subreddits.* FROM users
    LEFT JOIN user_subreddits on users.id = user_subreddits.user_id
    LEFT JOIN subreddits on user_subreddits.subreddit_id = subreddits.id`;
  
  public async Execute(params: IRawUser): Promise<IUserView> {
    let userView: IUserView;

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
      let querySql = this.queryBasic();
      let db = await this.connectDb('./db/users.db');

      const users = await this.select(db, querySql);
      const data = new Array<IUserDataView>();
      users.forEach(user => {
        data.push(new UserViewCreator(user).Execute());
      });
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
