import { QueryParams } from "app/interfaces";
import {Invoice } from "makerspace-ts-api-client";

export interface MemberInvoice extends Invoice {
  rental: undefined;
}

export interface RentalInvoice extends Invoice {}

export type Invoice = MemberInvoice | RentalInvoice;
export const isMemberInvoice = (item: any): item is MemberInvoice => {
  return item && !!item.member && !item.rental;
}

export interface InvoiceOption {
  id: string;
  name: string;
  description: string;
  amount: string;
  quantity: number;
  operation: InvoiceOperation,
  resourceClass: InvoiceableResource;
  planId: string;
  disabled: boolean;
  discountId: string;
}

export interface InvoiceOptionSelection {
  id: string;
  discountId: string;
}

export const isInvoiceOptionSelection = (item: any): item is InvoiceOptionSelection => !!item.invoiceOptionId;


export enum InvoiceOperation {
  Renew = "renew"
}

export enum InvoiceableResource {
  Membership = "member",
  Rental = "rental",
}

export const InvoiceableResourceDisplay = {
  [InvoiceableResource.Membership]: "Membership",
  [InvoiceableResource.Rental]: "Rental",
}

export enum Properties {
  Id = "id",
  Name = "name",
  Description = "description",
  Contact = "contact",
  CreatedAt = "createdAt",
  DueDate = "dueDate",
  Amount = "amount",
  Quantity = "quantity",
  Operation = "operation",
  Settled = "settled",
  PastDue = "pastDue",
  ResourceId = "resourceId",
  ResourceClass = "resourceClass",
  MemberId = "memberId",
  SubscriptionId = "subscriptionId",
  PlanId = "planId",
  Disabled = "disabled",
  DiscountId = "discountId",
}



export interface InvoiceQueryParams extends QueryParams {
  [Properties.ResourceId]?: string;
}

export interface InvoiceOptionQueryParams extends QueryParams {
  types: InvoiceableResource[];
  subscriptionOnly?: boolean;
}