import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { Action as InvoiceAction } from "ui/invoice/constants";
import { Action as InvoicesAction } from "ui/invoices/constants";
import { InvoiceState } from "ui/invoice/interfaces";
import { adminUpdateInvoice, isApiErrorResponse, adminDeleteInvoice } from "makerspace-ts-api-client";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";

export const updateInvoiceAction = (
  invoiceId: string,
  updateDetails: MemberInvoice | RentalInvoice
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoiceAction.StartUpdateRequest });

  const result = await adminUpdateInvoice(invoiceId, updateDetails);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: InvoiceAction.UpdateInvoiceFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: InvoicesAction.UpdateInvoiceSuccess,
      data: result.data
    });
    dispatch({
      type: InvoiceAction.UpdateInvoiceSuccess,
      data: result.data
    });
  }
};

export const deleteInvoiceAction = (
  invoiceId: string,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: InvoiceAction.StartDeleteRequest });

  const result = await adminDeleteInvoice(invoiceId);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: InvoiceAction.DeleteInvoiceFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: InvoiceAction.DeleteInvoiceSuccess,
    });
    dispatch({
      type: InvoicesAction.DeleteInvoiceSuccess,
      data: invoiceId
    });
  }
}

const defaultState: InvoiceState = {
  entity: undefined,
  stagedEntity: undefined,
  read: {
    isRequesting: false,
    error: "",
  },
  update: {
    isRequesting: false,
    error: "",
  },
  delete: {
    isRequesting: false,
    error: "",
  }
}

export const invoiceReducer = (state: InvoiceState = defaultState, action: AnyAction) => {
  let error;

  switch (action.type) {
    case InvoiceAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case InvoiceAction.GetInvoiceSuccess:
      const { data: invoice } = action;

      return {
        ...state,
        entity: invoice,
        read: {
          ...state.read,
          isRequesting: false,
          error: ""
        }
      };
    case InvoiceAction.GetInvoiceFailure:
      error = action.error;

      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case InvoiceAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      };
    case InvoiceAction.UpdateInvoiceSuccess:
      const { data: updatedInvoice } = action;

      return {
        ...state,
        entity: updatedInvoice,
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      };
    case InvoiceAction.UpdateInvoiceFailure:
      error = action.error;

      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error
        }
      }
      case InvoiceAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case InvoiceAction.DeleteInvoiceSuccess:
      return {
        ...state,
        entity: defaultState.entity,
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case InvoiceAction.DeleteInvoiceFailure:
      error = action.error;

      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: false,
          error
        }
      }
    default:
      return state;
  }
}