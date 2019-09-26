import * as React from "react";
import TableContainer from "./TableContainer";
import { SortDirection } from "./constants";
import { Column } from "./Table";

interface Props<Ids, Resp> {
  id: string;
  loading: boolean;
  data: Resp[];
  error: string;
  queryParams: QueryState;
  setQuery: SetQuery;
  rowId(row: Resp): string;
  columns: Column<Resp>[];
  title?: string;
  renderSearch?: boolean;
  totalItems?: number;
  selectedIds: Ids;
  setSelectedIds: (ids: Ids) => void;
}

export interface QueryState {
  pageNum?: number,
  orderBy?: string;
  order?: SortDirection;
  search?: string;
}

type SetAllQuery = (queryState: QueryState) => void;
type SetQuery =  SetAllQuery & {
  setOrder(order: SortDirection): void;
  setOrderBy(orderBy: string): void;
  setSearch(search: string): void;
  setPageNum(page: number): void;
};

export const useQueryState = (initialState: QueryState = {}): [QueryState, SetQuery, () => void] => {
  const [order, setOrder] = React.useState<SortDirection>(initialState.order || SortDirection.Asc);
  const [orderBy, setOrderBy] = React.useState<string>(initialState.orderBy);
  const [search, setSearch] = React.useState<string>(initialState.search);
  const [pageNum, setPageNum] = React.useState<number>(initialState.pageNum || 0);


  const setAllQuery: SetAllQuery = React.useCallback((newQuery: QueryState) => {
    const { order: newOrder, orderBy: newOrderBy, search: newSearch, pageNum: newPageNum } = newQuery;
    newOrder && setOrder(newOrder);
    newOrderBy && setOrderBy(newOrderBy);
    newSearch && setSearch(newSearch);
    newPageNum && setPageNum(newPageNum);
  }, [setOrder, setOrderBy, setSearch, setPageNum]);

  const setQuery: SetQuery = Object.assign(setAllQuery, {
    setOrder,
    setSearch,
    setOrderBy,
    setPageNum
  });

  const reset = React.useCallback(() => {
    setPageNum(initialState.pageNum || 0);
  }, [setPageNum]);

  return [{
    order,
    orderBy,
    search,
    pageNum,
  }, setQuery, reset];
};

const StatefulTable: React.FC<Props<unknown, unknown>> = ({
  id,
  title,
  loading,
  data = [],
  error,
  queryParams,
  setQuery,
  rowId,
  columns,
  renderSearch,
  selectedIds,
  setSelectedIds,
  totalItems,
}) => {

  const {
    setOrder,
    setOrderBy,
    setSearch,
    setPageNum
  } = setQuery;

  const { order, orderBy, pageNum } = queryParams;

  React.useEffect(() => setQuery(queryParams), [JSON.stringify(queryParams), setQuery]);

  const onSort = React.useCallback((newOrderBy: string) => {
    let newOrder = SortDirection.Desc;
    if (orderBy === newOrderBy && order === newOrder) {
      newOrder = SortDirection.Asc;
    }
    setOrder(newOrder);
    setOrderBy(orderBy);
    setPageNum(0);
  }, [pageNum, setOrder, setOrderBy]);

  const onPageChange = React.useCallback((newPage: number) => setPageNum(newPage), [setPageNum]);
  const onSelect = React.useCallback(
    (id: string, selected: boolean) => {
      if (Array.isArray(selectedIds)) {
        const updatedIds = selectedIds.slice();
        const existingIndex = selectedIds.indexOf(id);
        const alreadySelected = existingIndex > -1;
        if (selected && alreadySelected) {
          return;
        } else if (alreadySelected) {
          updatedIds.splice(existingIndex, 1)
        } else {
          updatedIds.push(id)
        }
        return setSelectedIds(updatedIds);
      } else {
        return setSelectedIds(selected ? id : undefined);
      }
  },
    [setSelectedIds, selectedIds]
  );

  // SelectAll only works with lists of IDs
  const onSelectAll = React.useCallback(() => {
    if (Array.isArray(selectedIds)) {
      const allIds = data.map(rowId);
      if (selectedIds.length === allIds.length) {
        setSelectedIds([]);
      } else {
        setSelectedIds(allIds);
      }
    }
  }, [setSelectedIds, data]);

  const onSearchEnter = React.useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPageNum(0);
  }, [setSearch, setPageNum]);

  return (
    <TableContainer
      id={id}
      title={title}
      loading={loading}
      data={data}
      error={error}
      totalItems={totalItems}
      selectedIds={Array.isArray(selectedIds) ? selectedIds : [selectedIds]}
      pageNum={pageNum}
      columns={columns}
      order={order}
      orderBy={orderBy}
      onSort={onSort}
      rowId={rowId}
      onPageChange={onPageChange}
      onSelect={setSelectedIds && onSelect}
      onSelectAll={Array.isArray(selectedIds) && setSelectedIds && onSelectAll}
      onSearchEnter={renderSearch && onSearchEnter}
    />
  )
}

export default function<Args, Resp>(props: Props<Args, Resp>): React.ReactElement<Props<Args, Resp>> {
  return <StatefulTable {...props} />
}