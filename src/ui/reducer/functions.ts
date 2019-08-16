import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { ApiErrorResponse, ApiDataResponse, isApiErrorResponse, ApiError } from "makerspace-ts-api-client";

import { TransactionAction, ScopedThunkAction } from "ui/reducer";

type Param = string | string[] | number | number[] | boolean | { [key: string]: Param };
type ApiFunction<T> = (...args: Param[]) => Promise<ApiErrorResponse | ApiDataResponse<T>>;

export const makeTransaction = <T>(
  apiFunction: ApiFunction<T>,
  ...args: Param[]
): ScopedThunkAction<Promise<T>> => async (dispatch, getState) => {

  const reducerKey = buildReducerKey(apiFunction, ...args);

  // Don't dispatch duplicate requests if one is already in flight
  const storedTransaction = getState().base[reducerKey];
  if (storedTransaction && storedTransaction.isRequesting) {
    return;
  }

  dispatch({ type: TransactionAction.Start, key: reducerKey });

  const response = await apiFunction.bind(null, ...args).call();
  if (isApiErrorResponse(response)) {
    const { error } = response;
    dispatch({
      key: reducerKey,
      type: TransactionAction.Failure,
      error: error.message
    });
  } else {
    dispatch({
      key: reducerKey,
      type: TransactionAction.Success,
      data: response.data
    });
    return response.data;
  }
};

export const buildReducerKey =  <T>(
  apiFunction: ApiFunction<T>,
  ...args: Param[]
): string =>  `${apiFunction.name}${JSON.stringify(args)}`;
