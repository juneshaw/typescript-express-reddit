const sqlite = require('sqlite3');
import { inspect } from "util";
import fetch from "node-fetch";
import { Database } from 'sqlite'
// import { EmailService } from "./EmailService"
import { IDomainUserNewsletter } from "../Domain";
import { SubredditViewCreator } from "../ViewCreator";
import { IUserDataView } from "../View";

export class EmailService {
  constructor(
  ) {}


  public sendNewsletter(
    newsletter: IDomainUserNewsletter
  ) {
    console.log(inspect(newsletter, {showHidden: false, depth: null}))
  }
}
