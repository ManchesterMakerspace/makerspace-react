import { RequestStatus, CollectionOf } from "app/interfaces";
import { Report } from "makerspace-ts-api-client";

export interface ReportsState {
  entities: CollectionOf<Report>;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
}