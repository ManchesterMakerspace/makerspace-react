import { RequestStatus, CollectionOf } from "app/interfaces";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";

export interface InvoicesState {
  entities: CollectionOf<MemberInvoice | RentalInvoice>;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
  options: RequestStatus;
}