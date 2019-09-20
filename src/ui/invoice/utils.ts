import { Invoice } from "makerspace-ts-api-client";

// export const isInvoiceSettled = (invoice: Invoice): boolean => invoice && (invoice.settled);
export const isInvoiceSettled = (invoice: Invoice): boolean => invoice && (invoice.settled || !!invoice.transactionId);

export const isInvoicePayable = (invoice: Invoice): boolean => invoice && !isInvoiceSettled(invoice) && !invoice.subscriptionId;