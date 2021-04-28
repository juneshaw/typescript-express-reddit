import { IDomainUser } from "./IDomainUser";
import { IDomainArticle } from "./IDomainArticle";
export interface IDomainUserNewsletter {
  user: IDomainUser;
  newsletters: IDomainArticle[];
}
