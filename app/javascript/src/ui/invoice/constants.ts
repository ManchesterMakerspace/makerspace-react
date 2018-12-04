export enum Action {
  StartReadRequest = "INVOICE/START_READ_REQUEST",
  GetInvoiceSuccess = "INVOICE/GET_INVOICE_SUCCESS",
  GetInvoiceFailure = "INVOICE/GET_INVOICE_FAILURE",

  StartUpdateRequest = "INVOICE/START_UPDATE_REQUEST",
  UpdateInvoiceSuccess = "INVOICE/UPDATE_INVOICE_SUCCESS",
  UpdateInvoiceFailure = "INVOICE/UPDATE_INVOICE_FAILURE",

  StartDeleteRequest = "INVOICE/START_DELETE_REQUEST",
  DeleteInvoiceSuccess = "INVOICE/DELETE_INVOICE_SUCCESS",
  DeleteInvoiceFailure = "INVOICE/DELETE_INVOICE_FAILURE",
}

const formPrefix = "invoice-form";
export const fields = {
  description: {
    label: "Description",
    name: `${formPrefix}-description`,
    placeholder: "Enter description",
    validate: (val: string) => !!val,
  },
  notes: {
    label: "Notes",
    name: `${formPrefix}-notes`,
    placeholder: "Enter notes",
    validate: (_val: string) => true,
  },
  member: {
    label: "Select a member",
    name: `${formPrefix}-member`,
    placeholder: `Search by name or email`,
    validate: (val: string) => !!val,
    error: "Member required"
  },
  dueDate: {
    label: "Due Date",
    name: `${formPrefix}-due-date`,
    placeholder: "Select a due date",
    validate: (val: string) => true,
    error: "Due date required"
  },
  amount: {
    label: "Amount ($)",
    name: `${formPrefix}-amount`,
    placeholder: "Enter amount",
    validate: (val: number) => (!!val && val > 0),
    error: "Invoice amount required"
  },
  type: {
    label: "Invoice Type",
    name: `${formPrefix}-type`,
  },
  // term: {
  //   label: "Renewal Length",
  //   name: `${formPrefix}-term`,
  //   placeholder: "Select a term to renew",
  //   validate: (val: string) => !!val,
  //   error: "Invalid selection"
  // }
}