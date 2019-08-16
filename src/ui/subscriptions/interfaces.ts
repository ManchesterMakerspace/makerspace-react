import { RequestStatus, CollectionOf } from "app/interfaces";
import { Subscription } from "makerspace-ts-api-client";

export interface SubscriptionsState {
  entities: CollectionOf<Subscription>;
  read: RequestStatus & {
    totalItems: number;
  };
  delete: RequestStatus;
  update: RequestStatus;
}