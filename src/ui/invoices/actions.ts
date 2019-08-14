import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import omit from "lodash-es/omit";

import { InvoiceQueryParams, InvoiceOptionSelection, MemberInvoice, RentalInvoice } from "app/entities/invoice";
import { Action as InvoicesAction } from "ui/invoices/constants";
import { InvoicesState } from "ui/invoices/interfaces";
import { adminListInvoices, listInvoices, isApiErrorResponse, adminCreateInvoices, createInvoice } from "makerspace-ts-api-client";

export const readInvoicesAction = (
  isUserAdmin: boolean,
  queryParams?: InvoiceQueryParams,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoicesAction.StartReadRequest });

  const func = isUserAdmin ? adminListInvoices : listInvoices;
  const result = await func(queryParams);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: InvoicesAction.GetInvoicesFailure,
      error: result.error.message
    });
  } else {
    const { response, data } = result;
    const totalItems = response.headers["total-items"];
    dispatch({
      type: InvoicesAction.GetInvoicesSuccess,
      data: {
        invoices: data,
        totalItems: Number(totalItems)
      }
    });
  }
};

export const createInvoiceAction = (
  invoiceForm: MemberInvoice | RentalInvoice | InvoiceOptionSelection,
  admin: boolean,
): ThunkAction<Promise<MemberInvoice | RentalInvoice>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoicesAction.StartCreateRequest });

  const result = admin
    ? await adminCreateInvoices(invoiceForm as MemberInvoice | RentalInvoice)
    : await createInvoice(invoiceForm as InvoiceOptionSelection);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: InvoicesAction.CreateInvoiceFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: InvoicesAction.CreateInvoiceSuccess,
      data: result.data,
    });
    return result.data;
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
      invoices.forEach((invoice: MemberInvoice | RentalInvoice) => {
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
      const newInvoice = action.data;
      return {
        ...state,
        entities: {
          ...state.entities,
          [newInvoice.id]: newInvoice,
        },
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