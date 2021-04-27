const sqlite = require('sqlite3');
import { inspect } from "util";
import fetch from "node-fetch";
import { Database } from 'sqlite'
// import { EmailService } from "./EmailService"
import { IDomainNewsletter, IDomainSubredditNewsletter, IDomainSubreddit, IDomainUser, IDomainUserNewsletter } from "../Domain";
import { SubredditViewCreator } from "../ViewCreator";

export class NewsletterService {
  constructor(
    // private emailService = new EmailService()
  ) {
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
    WHERE users.newsletter_time = ${hour};`
    return sql;
  }

  public initializeTimer() {
    setInterval(this.generateNewsletter, 6000);
  }

  private async generateNewsletter() {
    let db = await this.connectDb('./db/users.db');
    let date = new Date();
    const users = await this.select(db, this.querySelectUsersByTime(date.getHours()));
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    for (const user of users) {
      const subreddits = await this.selectSubreddit(db, this.querySelectUserSubreddits(user.email));
      const subredditDatas = new Array<IDomainNewsletter>();
      for (const subreddit of subreddits) {
        const data = await this.callRedditApi(subreddit);
        subredditDatas.push(data);
      }
      const userSubredditNewsletter = {
        user,
        subredditDatas
      }
      console.log(inspect(userSubredditNewsletter, {showHidden: false, depth: null}))

      // this.emailService.emailNewsletter(user, userNewsletter);
    }
  }

  private async callRedditApi(subreddit: IDomainSubreddit): Promise<IDomainNewsletter> {
    const absoluteUrl = `${subreddit.url}${process.env.SUBREDDIT_PARAMS}`;
    const response = await (fetch(absoluteUrl));
    const json = await(response.json());
    const subredditData = this.formatRedditData(json);
    const newsletter = { 
      subredditUrl: subreddit.url,
      newsletterSubredditData: subredditData
    }
    return newsletter;
  }

  private formatRedditData(subredditData: any): IDomainSubredditNewsletter[] {
    // const newsletterData = new Array<IDomainNewsletter>();
    // subredditData.forEach(subredditDataElement => {
        const newsletterSubredditData = new Array<IDomainSubredditNewsletter>();
        const { data: { children, subreddit } } = subredditData;
        for (const child of children) {
          const { title, url, thumbnail, score } = child.data;
          newsletterSubredditData.push({title, score, url, thumbnail});
        }
    // })
      
    return newsletterSubredditData;
  }
}
