export interface IViewCreator<T> {
  Execute(arg: T): T;
}
