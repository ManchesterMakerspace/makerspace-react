import * as React from "react";
import stringifyArgs from "ui/utils/stringifyArgs";
import { TransactionState, ApiFunction } from "ui/hooks/types";
import { isApiErrorResponse } from "makerspace-ts-api-client";
import { useApiState, getApiState } from "../reducer/hooks";
import { buildQueryString } from "../reducer/functions";
import { TransactionAction, } from "../reducer";
import { getStore } from "app/main";

export interface ReadTransaction<Args, T> extends TransactionState<T> {
  refresh: () => void;
}

const useReadTransaction = <Args, Resp>(
  transaction: ApiFunction<Args, Resp>,
  args: Args,
  delay?: boolean,
  key?: string // Can pass optional key to make transaction distinct in store
): ReadTransaction<Args, Resp> => {
  const [state, dispatch] = useApiState<Resp>(buildQueryString(transaction, args, key as any));
  const [force, setForce] = React.useState(false);
  const refresh = React.useCallback(() => setForce(prevState => !prevState), []);

  const getCurrentState = React.useCallback(() => {
    const apiKey = buildQueryString(transaction, args, key as any);
    return getApiState(apiKey, getStore().getState());
  }, [transaction, stringifyArgs(args), key]);

  React.useEffect(() => {
    const callTransaction = async () => {
      const currentState = getCurrentState();
      if (!currentState || !currentState.isRequesting) {
        dispatch({ type: TransactionAction.Start });

        const response = await transaction(args);

        if (isApiErrorResponse(response)) {
          dispatch({
            response,
            type: TransactionAction.Failure,
            error: response.error.message,
            data: undefined
          });
        } else {
          dispatch({
            response,
            type: TransactionAction.Success,
            data: response.data,
            error: ""
          });
        }
      }
    };

    !delay && callTransaction();
  }, [stringifyArgs(args), key, force, delay]);

  return { ...state, refresh };
};

export default useReadTransaction;;