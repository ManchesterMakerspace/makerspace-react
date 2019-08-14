import { RequestStatus, CollectionOf } from "app/interfaces";
import { InvoiceOptionSelection } from "app/entities/invoice";
import { InvoiceOption } from "makerspace-ts-api-client";

export interface BillingState {
  entities: CollectionOf<InvoiceOption>;
  selectedOption: InvoiceOptionSelection;
  read: RequestStatus & {
    totalItems: number;
  };
  create: RequestStatus;
  update: RequestStatus;
  delete: RequestStatus;
}
