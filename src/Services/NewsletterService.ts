const sqlite = require('sqlite3');
import fetch from "node-fetch";
import { Database } from 'sqlite'
import { EmailService } from "./EmailService"
import { IDomainArticle, IDomainPost, IDomainSubreddit, IDomainUser, IDomainUserNewsletter } from "../Domain";

export class NewsletterService {
  constructor(
    private emailService = new EmailService()
  ) {
    this.buildNewsletter = this.buildNewsletter.bind(this)
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

  private querySelectUserSubreddits = (email: string) => {
    const sql =
    `SELECT subreddits.* FROM users
    JOIN user_subreddits on users.id = user_subreddits.user_id
    JOIN subreddits on user_subreddits.subreddit_id = subreddits.id
    WHERE users.email = "${email}";`
    return sql;
  }

  private querySelectUsersByTime = (hour: number) => {
    const sql =
    `SELECT users.* FROM users
    WHERE users.newsletter_time = ${hour}
    AND users.newsletter_enabled = 1;`
    return sql;
  }

  public initializeTimer() {
    setInterval(this.buildNewsletter, 6000);
  }

  private async buildNewsletter() {
    let db = await this.connectDb('./db/users.db');
    let date = new Date();
    const users = await this.select(db, this.querySelectUsersByTime(date.getHours()));
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    for (const user of users) {
      const subreddits = await this.selectSubreddit(db, this.querySelectUserSubreddits(user.email));
      const newsletters = new Array<IDomainArticle>();
      for (const subreddit of subreddits) {
        const data = await this.buildSubredditArticle(subreddit);
        newsletters.push(data);
      }
      const userNewsletter = {
        user,
        newsletters
      }
      this.emailService.sendNewsletter(userNewsletter);
    }
  }

  private async buildSubredditArticle(subreddit: IDomainSubreddit): Promise<IDomainArticle> {
    const absoluteUrl = `${subreddit.url}${process.env.SUBREDDIT_PARAMS}`;
    const response = await fetch(absoluteUrl);
    const json = await response.json();
    const subredditData = this.buildSubredditData(json);
    const newsletter = { 
      subredditUrl: subreddit.url,
      newsletterSubredditData: subredditData
    }
    return newsletter;
  }

  private buildSubredditData(subredditData: any): IDomainPost[] {
    const newsletterSubredditData = new Array<IDomainPost>();
    const { data: { children } } = subredditData;
    for (const child of children) {
      const { title, url, thumbnail, score } = child.data;
      newsletterSubredditData.push({title, score, url, thumbnail});
    }
    return newsletterSubredditData;
  }
}
