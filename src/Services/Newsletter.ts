const sqlite = require('sqlite3');
import { json } from "body-parser";
import fetch from "node-fetch";
import { Database } from 'sqlite'
import { IDomainSubreddit, IDomainUser } from "../Domain";

export class Newsletter {
  constructor() {
    this.generateNewsletter = this.generateNewsletter.bind(this)
  }

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

  private querySelectUsersByTime = (hour: number) => {
    // Assume same object structure, nothing missing, for now
    const sql =
    `SELECT users.*, subreddits.* FROM users
    JOIN user_subreddits on users.id = user_subreddits.user_id
    JOIN subreddits on user_subreddits.subreddit_id = subreddits.id
    WHERE users.newsletter_time = ${hour};`
    return sql;
  }

  public initializeTimer() {
    console.log('in initializeTimer');
    setInterval(this.generateNewsletter, 6000);
  }

  private async generateNewsletter() {
    console.log('in generateNewsletter');
    let db = await this.connectDb('./db/users.db');
    let date = new Date();
    const users = await this.select(db, this.querySelectUsersByTime(date.getHours()));
    console.log('users', users);
    for (const user of users) {
      const subreddits = await this.selectSubreddit(db, this.querySelectUserSubreddits(user.id));
      console.log('subreddits', subreddits);
      const data = await this.callRedditApis(subreddits);
      console.log('data', data);
    }
    // call formatRedditData
    // call Emailservice
  }

  private async callRedditApis(subreddits: IDomainSubreddit[]): Promise<any[]> {
    const absoluteUrls = subreddits.map(subreddit => `${subreddit.url}${process.env.SUBREDDIT_PARAMS}`);
    return Promise.all(absoluteUrls.map(u=>fetch(u))).then(responses =>
      // Promise.all(responses.map(res => res.text())
      //   ).then(texts => {
      Promise.all(responses.map(res => res.json())
        ).then(json => {
          console.log('texts', json);
          return json;
        })
    )
  }

  private formatRedditData(data: any) {

  }
}
