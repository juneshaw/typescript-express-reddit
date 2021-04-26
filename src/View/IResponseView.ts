import { IStatusView } from './IStatusView';

export interface IResponseView {
  status: IStatusView,
  data?: any | null
}