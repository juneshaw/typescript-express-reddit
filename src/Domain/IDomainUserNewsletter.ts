import { IDomainUser } from "./IDomainUser";
import { IDomainNewsletter } from "./IDomainNewsletter";
export interface IDomainUserNewsletter {
  user: IDomainUser;
  newsletters: IDomainNewsletter[];
} 