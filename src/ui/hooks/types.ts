import { ApiErrorResponse, ApiDataResponse } from "makerspace-ts-api-client";

export interface TransactionState<T> {
  loading: boolean;
  error: string;
  data: T;
}

export type ApiFunction<Args, Data> = (args: Args) => Promise<ApiErrorResponse | ApiDataResponse<Data>>;
