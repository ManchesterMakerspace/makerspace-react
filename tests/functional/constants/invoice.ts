import { InvoiceOptionTypes } from "api/invoices/constants";
import { InvoiceOption, Invoice, InvoiceOperation, InvoiceableResource } from "app/entities/invoice";
export const invoiceOptions: InvoiceOption[] = [
  {
    id: "standard_membership",
    description: "Standard Membership Subscription",
    amount: 65
  }, {
    id: "foo",
    description: "Foo Membership",
    amount: 10000
  }, {
    id: "bar",
    description: "Bar Membership",
    amount: 45
  }
];
export const baseInvoice: Invoice = {
  id: "foo",
  description: "random membership invoice",
  notes: "Wrote some notes",
  contact: "test_member@test.com",
  amount: 50,
  discount: false,
  settled: false,
  pastDue: false,
  resourceId: "foobar",
  resource: InvoiceableResource.Membership,
  memberId: "test_member",
  operation: InvoiceOperation.Renew,
  value: 1,
  createdAt: "Some time",
  dueDate: "Another time",
}
export const defaultInvoice: Invoice = {
  ...baseInvoice,
  id: "foo-default"
};
export const pastDueInvoice: Invoice = {
  ...baseInvoice,
  id: "foo-pastdue",
  description: "past due membership invoice",
  pastDue: true,
};
export const settledInvoice: Invoice = {
  ...baseInvoice,
  id: "foo-settled",
  description: "settled membership invoice",
  settled: true,
};
export const discountedInvoice: Invoice = {
  ...baseInvoice,
  id: "foo-discount",
  description: "discounted membership invoice",
  discount: true,
};
export const defaultInvoices: Invoice[] = new Array(20).fill(undefined).map((_v, index) => {
  return {
    ...defaultInvoice,
    id: `invoice-${index}`,
    description: `membership invoice number ${index}`,
    contact: `test_member-${index}.test.com`,
  }
})
export const membershipOptionQueryParams = {
  types: [InvoiceOptionTypes.Membership]
};