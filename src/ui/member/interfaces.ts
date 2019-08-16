import { RequestStatus } from "app/interfaces";
import { Member } from "makerspace-ts-api-client";

export interface MemberState {
  entity: Member;
  read: RequestStatus;
  update: RequestStatus;
}