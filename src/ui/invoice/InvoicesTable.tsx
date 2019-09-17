import * as React from "react";
import useReactRouter from "use-react-router";
import { useAuthState } from "../reducer/hooks";
import useReadTransaction from "../hooks/useReadTransaction";
import { adminListInvoices, listInvoices, getMember, Invoice } from "makerspace-ts-api-client";
import StatefulTable, { useQueryState } from "../common/table/StatefulTable";
import { InvoiceableResourceDisplay, MemberInvoice, RentalInvoice } from "app/entities/invoice";
import { SortDirection } from "ui/common/table/constants";
import { timeToDate } from "ui/utils/timeToDate";
import { Column } from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import StatusLabel from "ui/common/StatusLabel";
import { Status } from "ui/constants";
import extractTotalItems from "../utils/extractTotalItems";
import SettleInvoiceModal from "../invoice/SettleInvoiceModal";
import CreateInvoiceModal from "../invoice/CreateInvoiceModal";
import DeleteInvoiceModal from "../invoice/DeleteInvoiceModal";
import { ActionButton } from "../common/ButtonRow";
import { isInvoicePayable } from "./utils";


const getFields = (memberId: string, isAdmin: boolean, onSuccess: () => void): Column<MemberInvoice | RentalInvoice>[] => [
  ...memberId ? [] : [{
    id: "member",
    label: "Member",
    cell: (row: MemberInvoice | RentalInvoice) => row.memberName,
    defaultSortDirection: SortDirection.Desc,
  }],
  {
    id: "resourceClass",
    label: "Type",
    cell: (row: MemberInvoice | RentalInvoice) => InvoiceableResourceDisplay[row.resourceClass]
  },
  {
    id: "description",
    label: "Description",
    cell: (row: MemberInvoice | RentalInvoice) => row.description,
    defaultSortDirection: SortDirection.Desc,
  },
  {
    id: "dueDate",
    label: "Due Date",
    cell: (row: MemberInvoice | RentalInvoice) => {
      const dueDate = timeToDate(row.dueDate);
      if (row.subscriptionId) {
        return `Automatic Payment on ${dueDate}`
      } else {
        if (row.settled) {
          return "Paid"
        } else {
          return dueDate;
        }
      }
    },
    defaultSortDirection: SortDirection.Desc
  },
  {
    id: "amount",
    label: "Amount",
    cell: (row: MemberInvoice | RentalInvoice) => numberAsCurrency(row.amount),
    defaultSortDirection: SortDirection.Desc
  },
  ...isAdmin ? [{
    id: "settled",
    label: "Paid?",
    cell: (row: MemberInvoice | RentalInvoice) => {
      return (
        <SettleInvoiceModal invoice={row} onSuccess={onSuccess} />
      );
    },
    defaultSortDirection: SortDirection.Desc
  }] : [],
  {
    id: "status",
    label: "Status",
    cell: (row: MemberInvoice | RentalInvoice) => {
      const statusColor = (row.pastDue && !row.settled) ? Status.Danger : Status.Success;
      const label = row.settled ? "Paid" : (row.pastDue ? "Past Due" : "Upcoming");
      return (
        <StatusLabel label={label} color={statusColor} />
      );
    },
  }
];

const InvoicesTable: React.FC<{ stageInvoices(invoices: Invoice[]): void }> = ({ stageInvoices }) => {
  const { match: { params: { memberId } } } =  useReactRouter<{ memberId: string }>();
  const { currentUser: { isAdmin, id: currentUserId } } = useAuthState();
  const [queryParams, setQueryState] = useQueryState();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const { refresh: refreshMember } = useReadTransaction(getMember, memberId);

  const {
    isRequesting,
    error,
    data = [],
    response,
    refresh
  } = useReadTransaction(
    isAdmin ? adminListInvoices : listInvoices,
    {
      resourceId: memberId,
      ...queryParams
    });

  React.useEffect(() => {
    if (Array.isArray(data) && data.length) {
      setSelectedIds(data.reduce((selected, invoice) => {
        if (invoice.memberId === currentUserId && isInvoicePayable(invoice)) {
          selected.push(invoice.id);
        }
        return selected;
      }, []));
    }
  }, [JSON.stringify(data), setSelectedIds]);

  const onSuccess = React.useCallback(() => {
    refreshMember();
    refresh();
  }, [refresh, refreshMember]);

  const rowId = React.useCallback(invoice => invoice.id, []);
  const fields = getFields(memberId, isAdmin, onSuccess);

  const selectedInvoices: Invoice[] = React.useMemo(() => {
    return data.reduce((selectedInvoice, invoice) => {
      if (selectedIds.includes(invoice.id)) {
        selectedInvoice.push(invoice)
      }
      return selectedInvoice
    }, []);
  }, [data, selectedIds]);

  const viewingOwnInvoices = memberId === currentUserId;
  const payNow = viewingOwnInvoices && selectedInvoices.length && selectedInvoices.every(invoice => isInvoicePayable(invoice));


  const goToCheckout = React.useCallback(() => stageInvoices(selectedInvoices), [selectedInvoices, stageInvoices]);

  return (
    <>
    {isAdmin && (
      <>
        <CreateInvoiceModal memberId={memberId} onSuccess={onSuccess}/>
        <DeleteInvoiceModal invoice={selectedInvoices.length === 1 && selectedInvoices[0]} onSuccess={onSuccess}/>
      </>
    )}
    {viewingOwnInvoices && (
      <ActionButton
        id="invoices-list-payNow"
        style={{ float: "right" }}
        variant="contained"
        color="primary"
        disabled={!payNow}
        onClick={goToCheckout}
        label="Pay Selected Dues"
      />
    )}
    <StatefulTable
      id="invoices-table"
      title="Dues"
      loading={isRequesting}
      data={data}
      error={error}
      queryParams={queryParams}
      setQuery={setQueryState}
      columns={fields}
      rowId={rowId}
      totalItems={extractTotalItems(response)}
      selectedIds={selectedIds}
      setSelectedIds={setSelectedIds}
    />
    </>
  )
};

export default InvoicesTable;