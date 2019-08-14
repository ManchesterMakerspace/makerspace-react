import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import omit from "lodash-es/omit";
import { createTransaction, isApiErrorResponse } from "makerspace-ts-api-client";

import isObject from "ui/utils/isObject";
import { Action as CheckoutAction } from "ui/checkout/constants";
import { CheckoutState } from "ui/checkout/interfaces";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";

export const submitPaymentAction = (
  paymentMethodId: string,
  invoices: (MemberInvoice | RentalInvoice)[],
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: CheckoutAction.StartAsyncRequest });
  await Promise.all(invoices.map(async (invoice) => {
    const invoiceId = invoice.id;
    dispatch({ type: CheckoutAction.StartTransactionRequest, data: invoiceId });


    const result = await createTransaction({ paymentMethodId, invoiceId });

    if (isApiErrorResponse(result)) {
      dispatch({
        type: CheckoutAction.FinishTransactionFailure,
        error: result.error.message,
        id: invoiceId
      });
    } else {
      dispatch({
        type: CheckoutAction.FinishTransactionSuccess, data: {
          ...result.data,
          invoice,
        }
      });
    }
  }));
  dispatch({ type: CheckoutAction.StopAsyncRequest });
};

const defaultState: CheckoutState = {
  invoices: {},
  transactions: {},
  isRequesting: false,
  error: ""
}


export const checkoutReducer = (state: CheckoutState = defaultState, action: AnyAction) => {
  let invoiceId;
  switch (action.type) {
    case CheckoutAction.StartAsyncRequest:
      return {
        ...state,
        isRequesting: true
      }

    case CheckoutAction.StopAsyncRequest:
      return {
        ...state,
        isRequesting: false
      }

    case CheckoutAction.StageInvoicesForPayment:
      const invoices = action.data;
      // Can accept array or collection of invoices to stage
      if (Array.isArray(invoices)) {
        const newInvoices = {};
        invoices.forEach((invoice: MemberInvoice | RentalInvoice) => {
          newInvoices[invoice.id] = invoice;
        });
        return {
          ...state,
          invoices: {
            ...state.invoices,
            ...newInvoices,
          }
        }
      } else if (isObject(invoices)) {
        return {
          ...state,
          invoices: {
            ...state.invoices,
            ...invoices,
          }
        }
      }

    case CheckoutAction.ResetStagedInvoice:
      invoiceId = action.data;
      return {
        ...state,
        invoices: omit(state.invoices, invoiceId),
      }

    case CheckoutAction.ResetStagedInvoices:
      return {
        ...state,
        invoices: defaultState.invoices,
        transactions: defaultState.transactions,
      }

    case CheckoutAction.StartTransactionRequest:
      invoiceId = action.data;

      return {
        ...state,
        transactions: {
          ...state.transactions,
          [invoiceId]: {
            ...state.transactions[invoiceId],
            isRequesting: true,
          }
        }
      }
    case CheckoutAction.FinishTransactionSuccess:
      const transaction = action.data;

      return {
        ...state,
        transactions: {
          ...state.transactions,
          [transaction.invoice.id]: {
            ...transaction,
            isRequesting: false,
            error: ""
          }
        }
      }

    case CheckoutAction.FinishTransactionFailure:
      const { id, error } = action;
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [id]: {
            isRequesting: false,
            error,
          }
        }
      }

    default:
      return state;
  }
};

