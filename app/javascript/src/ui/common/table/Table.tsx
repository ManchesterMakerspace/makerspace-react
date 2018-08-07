import * as React from "react";
import {
  Table,
  TableCell,
  Tooltip,
  TableSortLabel,
  Checkbox,
  TableRow,
  TableHead,
  TableBody,
} from '@material-ui/core';
import { SortDirection } from 'ui/common/table/constants';

export interface Column<T> {
  id: string;
  label: string;
  cell: (row: T) => JSX.Element | number | string | boolean;
  defaultSortDirection?: SortDirection;
  numeric?: boolean;
}

interface Props<T> {
  id: string;
  page: number;
  data: T[];
  columns: Column<T>[];
  selectedIds: string[];
  order: SortDirection;
  orderBy: string;
  onSelectAll: () => void;
  onSelect: (id: string, direction: boolean) => void;
  rowId: (row: T) => string;
  onSort: (property: string) => void;
}

class EnhancedTable<T> extends React.Component<Props<T>, {}> {

  private getHeaderRow = () => {
    const { onSelect, onSelectAll, selectedIds, data } = this.props;
    const numSelected = selectedIds && selectedIds.length;
    const rowCount = data.length;

    const checkbox = (
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          indeterminate={numSelected > 0 && numSelected < rowCount}
          checked={numSelected > 0 && numSelected === rowCount}
          onChange={onSelectAll}
        />
      </TableCell>
    )

    return (
      <TableHead>
        <TableRow>
          {onSelect &&
            checkbox
          }
          {this.getHeaderCells()}
        </TableRow>
      </TableHead>
    )
  }

  private createSortHandler = (property: string) => (_event: React.ChangeEvent<EventTarget>) => {
    this.props.onSort(property);
  };

  private getHeaderCells = () => {
    const {
      id: tableId,
      columns,
      order,
      orderBy,
    } = this.props;

    return columns.map((column) => {
      const { label, id, numeric, defaultSortDirection } = column;
      return (
        <TableCell
          id={tableId && `${tableId}-${id}`}
          key={`header-${id}`}
        >
        {
          defaultSortDirection ?
            <Tooltip
              title="Sort"
              placement={numeric ? 'bottom-end' : 'bottom-start'}
              enterDelay={300}
            >
              <TableSortLabel
                active={orderBy === id}
                direction={order}
                onClick={this.createSortHandler(id)}
              >
                {label}
              </TableSortLabel>
            </Tooltip>
          : label
        }
      </TableCell>
      )
    })
  }

  private getBodyRows = () => {
    const {
      id: tableId,
      data,
      rowId,
      selectedIds,
      onSelect
    } = this.props;

    return Array.isArray(data) ? data.map((row) => {
      const id = rowId(row);
      const tableRowId = `${tableId}-${id}`;
      let checked = false;
      let checkbox = null;

      if (onSelect) {
        checked = selectedIds && selectedIds.includes(id);
        const checkHandler = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
          onSelect(id, checked);
        }
        checkbox = (
          <TableCell padding="checkbox">
            <Checkbox
              id={id}
              color="primary"
              checked={checked}
              onChange={checkHandler}
            />
          </TableCell>
        )
      }

      return (
        <TableRow key={tableRowId}>
          {checkbox}
          {...this.getBodyCells(row)}
        </TableRow>
      )
    }): [];
  }

  private getBodyCells = (row: T)  => {
    const {
      columns,
      id: tableId,
      rowId
    } = this.props;
    const tableRowId = rowId(row);

    return columns.map((column) => {
      const columnId = `${tableId}-${tableRowId}-${column.id}`;
      return (
        <TableCell
          id={columnId}
          numeric={column.numeric}
          key={columnId}
        >
          {column.cell(row)}
        </TableCell>
      )
    })
  }

  public render() {
    const {
      id,
    } = this.props;

    return (
      <>
        <Table>
          {this.getHeaderRow()}
          <TableBody>
            {this.getBodyRows()}
          </TableBody>
        </Table>
      </>
    );
  }
}

export default EnhancedTable;