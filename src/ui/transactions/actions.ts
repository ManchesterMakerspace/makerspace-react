import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { Action as TransactionsAction } from "ui/transactions/constants";
import { TransactionsState } from "ui/transactions/interfaces";
import { TransactionQueryParams } from "app/entities/transaction";
import { Transaction, deleteTransaction, adminListTransaction, listTransactions, isApiErrorResponse, adminDeleteTransaction } from "makerspace-ts-api-client";

export const readTransactionsAction = (
  isUserAdmin: boolean,
  queryParams?: TransactionQueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: TransactionsAction.StartReadRequest });

  const func = isUserAdmin ? adminListTransaction : listTransactions;
  const result = await func(queryParams as any);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: TransactionsAction.GetTransactionsFailure,
      error: result.error.message
    });
  } else {
    const { response, data } = result;
    const totalItems = response.headers.get("total-items");
    dispatch({
      type: TransactionsAction.GetTransactionsSuccess,
      data: {
        transactions: data,
        totalItems: Number(totalItems)
      }
    });
  }
};

export const refundTransactionAction = (
  transactionId: string,
  admin: boolean,
): ThunkAction<Promise<boolean>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: TransactionsAction.StartDeleteRequest });

  const func = admin ? adminDeleteTransaction : deleteTransaction;
  const result = await func(transactionId);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: TransactionsAction.DeleteTransactionFailure,
      error: result.error.message
    });
    return false;
  } else {
    dispatch({
      type: TransactionsAction.DeleteTransactionSuccess,
    });
    return true;
  }
}

const defaultState: TransactionsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  delete: {
    isRequesting: false,
    error: "",
  }
}

export const transactionsReducer = (state: TransactionsState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case TransactionsAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case TransactionsAction.GetTransactionsSuccess:
      const {
        data: {
          transactions,
          totalItems,
        }
      } = action;

      const newTransactions = {};
      transactions.forEach((transaction: Transaction) => {
        newTransactions[transaction.id] = transaction;
      });

      return {
        ...state,
        entities: newTransactions,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case TransactionsAction.GetTransactionsFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case TransactionsAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case TransactionsAction.DeleteTransactionSuccess:
      const refundedTransaction = action.data;

      return {
        ...state,
        entities: {
          ...state.entities,
          ...refundedTransaction && { [refundedTransaction.id]: refundedTransaction },
        },
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case TransactionsAction.DeleteTransactionFailure:
      const deleteError = action.error;

      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: false,
          error: deleteError
        }
      }
    default:
      return state;
  }
}