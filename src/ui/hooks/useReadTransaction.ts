import * as React from "react";
import stringifyArgs from "ui/utils/stringifyArgs";
import { TransactionState, ApiFunction } from "ui/hooks/types";
import { isApiErrorResponse } from "makerspace-ts-api-client";
import { useApiState, getApiState } from "../reducer/hooks";
import { buildQueryString } from "../reducer/functions";
import { TransactionAction, } from "../reducer";
import { getStore } from "src/app/main";

interface ReadTransaction<Args, T> extends TransactionState<T> {
  refresh: () => void;
}

const useReadTransaction = <Args, Resp>(
  transaction: ApiFunction<Args, Resp>,
  args: Args
): ReadTransaction<Args, Resp> => {
  const [state, dispatch] = useApiState<Resp>(buildQueryString(transaction, args))
  const [force, setForce] = React.useState(false);
  const refresh = React.useCallback(() => setForce(prevState => !prevState), []);

  const getCurrentState = React.useCallback(() => {
    const key = buildQueryString(transaction, args);
    return getApiState(key, getStore().getState());
  }, [transaction, stringifyArgs(args)]);

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

    callTransaction();
  }, [stringifyArgs(args), force]);

   return { ...state, refresh };
};

export default useReadTransaction;;