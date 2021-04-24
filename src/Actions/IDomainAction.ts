export interface IDomainAction<TParam, TResult> {
  Execute(param: TParam): Promise<TResult>;
}