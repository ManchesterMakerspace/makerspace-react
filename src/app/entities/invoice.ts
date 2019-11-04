import { QueryParams } from "app/interfaces";
import {Invoice, PlanType } from "makerspace-ts-api-client";

export interface MemberInvoice extends Omit<Invoice, "rental"> {}

export interface RentalInvoice extends Invoice {}

export type Invoice = MemberInvoice | RentalInvoice;
export const isMemberInvoice = (item: any): item is MemberInvoice => {
  return item && !!item.member && !item.rental;
}

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
  [Properties.ResourceId]?: string[];
}

export interface InvoiceOptionQueryParams extends QueryParams {
  types: InvoiceableResource[];
  subscriptionOnly?: boolean;
}