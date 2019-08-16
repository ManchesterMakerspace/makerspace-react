import { RequestStatus } from "app/interfaces";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";

export interface InvoiceState {
  entity: MemberInvoice | RentalInvoice;
  stagedEntity: Partial<MemberInvoice | RentalInvoice>;
  read: RequestStatus;
  update: RequestStatus;
  delete: RequestStatus;
}