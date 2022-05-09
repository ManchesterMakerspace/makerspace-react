import { LocationDescriptorObject } from "history";
import * as React from "react";
import useReactRouter from "use-react-router";

type SearchParams = {
  [key: string]: string;
}

export const useSearchQuery = (params: SearchParams): SearchParams => {
  const { location: { search } } = useReactRouter();
  const searchParams = new URLSearchParams(search);

  return React.useMemo(() =>  {
    return Object.entries(params).reduce((values, [key, param]) => ({
      ...values,
      [key]: searchParams.get(param)
    }), {})
  },[params, searchParams]);
}

export const useSetSearchQuery = (pushLocationOverloads: LocationDescriptorObject<any> = {}): ((params: SearchParams) => void) => {
  const { history, location: { search } } = useReactRouter();
  const searchParams = new URLSearchParams(search);

  return React.useCallback((params: SearchParams) => {
    Object.entries(params).forEach(([key, value]) => {
      value ? searchParams.set(key, value) : searchParams.delete(key);
    })

    history.push({ search: searchParams.toString(), ...pushLocationOverloads });
  }, [history, searchParams, pushLocationOverloads]);
}

