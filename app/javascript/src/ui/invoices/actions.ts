import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";
import omit from "lodash-es/omit";

import { Invoice, InvoiceQueryParams, InvoiceableResource } from "app/entities/invoice";
import { getInvoices, postInvoices, getInvoiceOptions } from "api/invoices/transactions";
import { Action as InvoicesAction } from "ui/invoices/constants";
import { InvoicesState } from "ui/invoices/interfaces";

export const readInvoicesAction = (
  isUserAdmin: boolean,
  queryParams?: InvoiceQueryParams,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoicesAction.StartReadRequest });

  try {
    const response = await getInvoices(isUserAdmin, queryParams);
    const {invoices} = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: InvoicesAction.GetInvoicesSuccess,
      data: {
        invoices,
        totalItems: toNumber(totalItems)
      }
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: InvoicesAction.GetInvoicesFailure,
      error: errorMessage
    });
  }
};

export const createInvoiceAction = (
  invoiceForm: Invoice
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoicesAction.StartCreateRequest });

  try {
    await postInvoices(invoiceForm);
    dispatch({
      type: InvoicesAction.CreateInvoiceSuccess,
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: InvoicesAction.CreateInvoiceFailure,
      error: errorMessage
    });
  }
};

const defaultState: InvoicesState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  create: {
    isRequesting: false,
    error: "",
  },
  options: {
    isRequesting: false,
    error: "",
  }
}


export const invoicesReducer = (state: InvoicesState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case InvoicesAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case InvoicesAction.GetInvoicesSuccess:
      const {
        data: {
          invoices,
          totalItems,
        }
      } = action;

      const newInvoices = {};
      invoices.forEach((invoice: Invoice) => {
        newInvoices[invoice.id] = invoice;
      });

      return {
        ...state,
        entities: newInvoices,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case InvoicesAction.GetInvoicesFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case InvoicesAction.UpdateInvoiceSuccess:
      const { data: updatedInvoice } = action;

      return {
        ...state,
        entities: {
          ...state.entities,
          [updatedInvoice.id]: updatedInvoice
        }
      };
    case InvoicesAction.DeleteInvoiceSuccess:
      const { data: deletedId } = action;

      return {
        ...state,
        entities: {
          ...omit(state.entities, deletedId)
        }
      };
    case InvoicesAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case InvoicesAction.CreateInvoiceSuccess:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case InvoicesAction.CreateInvoiceFailure:
      const { error: createError } = action;
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: createError
        }
      }
    case InvoicesAction.ClearInvoices:
      return {
        ...state,
        entities: {}
      };
    default:
      return state;
  }
}