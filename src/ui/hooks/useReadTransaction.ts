import * as React from "react";
import stringifyArgs from "ui/utils/stringifyArgs";
import { TransactionState, ApiFunction } from "ui/hooks/types";
import { ApiErrorResponse, ApiDataResponse } from "makerspace-ts-api-client";

interface ReadTransaction<T> extends TransactionState<T> {
  refresh: () => void;
}

const useReadTransaction = <Args, Resp>(
  transaction: ApiFunction<Args, Resp>,
  args: Args
): ReadTransaction<Resp> => {
  const [state, setState] = React.useState({ loading: false, error: "", data: undefined });
  const [force, setForce] = React.useState(false);
  const refresh = React.useCallback(() => setForce(prevState => !prevState), []);

   React.useEffect(() => {
    let aborted = false;

     const callTransaction = async () => {
      !aborted && setState(prevState => ({ ...prevState, loading: true }));

       const result = await transaction(args);

       const error = (result as ApiErrorResponse).error;

       !aborted && setState({
        loading: false,
        error: error && error.message,
        data: (result as ApiDataResponse<Resp>).data
      });
    };

     callTransaction();

     return () => { aborted = true; };
  }, [stringifyArgs(args), force]);

   return { ...state, refresh };
};

export default useReadTransaction;;