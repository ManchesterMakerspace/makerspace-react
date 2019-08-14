import { RequestStatus, CollectionOf } from "app/interfaces";
import { Transaction } from "makerspace-ts-api-client";

export interface TransactionsState {
  entities: CollectionOf<Transaction>;
  read: RequestStatus & {
    totalItems: number;
  };
  delete: RequestStatus;
}