import { inspect } from "util";
import { IDomainUserNewsletter } from "../Domain";

export class EmailService {
  constructor(
  ) {}


  public sendNewsletter(
    newsletter: IDomainUserNewsletter
  ) {
    console.log(inspect(newsletter, {showHidden: false, depth: null}))
  }
}
