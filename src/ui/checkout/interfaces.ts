import { RequestStatus } from "app/interfaces";
import { Transaction } from "makerspace-ts-api-client";
import { CollectionOf } from "app/interfaces";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";

export interface CheckoutState extends RequestStatus {
  invoices: CollectionOf<MemberInvoice | RentalInvoice>;
  transactions: CollectionOf<Transaction & RequestStatus>;
}