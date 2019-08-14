import * as React from "react";
import { ApiErrorResponse, ApiDataResponse } from "makerspace-ts-api-client";

import { TransactionState, ApiFunction } from "ui/hooks/types";

interface CallTransactionState<Args, Data> extends TransactionState<Data> {
  called: boolean;
  call: ApiFunction<Args, Data>;
}

const useWriteTransaction = <Args, Resp>(
  transaction: ApiFunction<Args, Resp>
): CallTransactionState<Args, Resp> => {
  const [state, setState] = React.useState({ loading: false, error: "", data: undefined, called: false });
  const call = React.useCallback(async (args: Args) => {
    setState(prevState => ({ ...prevState, loading: true, called: true }));

    const result = await transaction(args);
    const error = (result as ApiErrorResponse).error;

    setState(prevState => ({
      ...prevState,
      loading: false,
      error: error && error.message,
      data: (result as ApiDataResponse<Resp>).data
    }));

    return result;
  }, []);

  return { ...state, call };
};

export default useWriteTransaction;;
