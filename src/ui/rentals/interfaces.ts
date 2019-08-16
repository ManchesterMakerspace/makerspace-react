import { RequestStatus, CollectionOf } from "app/interfaces";
import { Rental } from "makerspace-ts-api-client";

export interface RentalsState {
  entities: CollectionOf<Rental>;
  read: RequestStatus & {
    totalItems: number;
  };
  update: RequestStatus;
  delete: RequestStatus;
  create: RequestStatus;
}