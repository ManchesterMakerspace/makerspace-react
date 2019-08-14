import { RequestStatus, CollectionOf } from "app/interfaces";
import { Member } from "makerspace-ts-api-client";

export interface MembersState {
  entities: CollectionOf<Member>;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
}