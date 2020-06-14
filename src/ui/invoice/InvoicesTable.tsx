import * as React from "react";
import useReactRouter from "use-react-router";


import { adminListInvoices, listInvoices, getMember, Invoice } from "makerspace-ts-api-client";
import { useAuthState } from "../reducer/hooks";
import useReadTransaction from "../hooks/useReadTransaction";
import StatefulTable from "../common/table/StatefulTable";
import { InvoiceableResourceDisplay, MemberInvoice, RentalInvoice } from "app/entities/invoice";
import { SortDirection } from "ui/common/table/constants";
import { Column } from "ui/common/table/Table";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import StatusLabel from "ui/common/StatusLabel";
import { Status } from "ui/constants";
import extractTotalItems from "../utils/extractTotalItems";
import CreateInvoiceModal from "../invoice/CreateInvoiceModal";
import DeleteInvoiceModal from "../invoice/DeleteInvoiceModal";
import { ActionButton } from "../common/ButtonRow";
import { isInvoicePayable, renderInvoiceDueDate, renderInvoiceStatus } from "./utils";
import ViewInvoiceModal from "./ViewInvoiceModal";
import ViewSubscriptionModal from "../subscriptions/ViewSubscriptionModal";
import { useQueryContext, withQueryContext } from "../common/Filters/QueryContext";
import InvoiceFilters from "./InvoiceFilters";


const InvoicesTable: React.FC<{ stageInvoice(invoice: Invoice): void }> = ({ stageInvoice }) => {
  const { match: { params: { memberId } } } =  useReactRouter<{ memberId: string }>();
  const { currentUser: { isAdmin, id: currentUserId } } = useAuthState();
  const viewingOwnInvoices = memberId === currentUserId;

  const { params } = useQueryContext({
    settled: false,
    refunded: undefined,
    pastDue: undefined,
    refundRequested: undefined,
    memberId: [memberId],
  });

  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice>();

  const { refresh: refreshMember } = useReadTransaction(getMember, { id: memberId });

  const adminInvoiceResponse = useReadTransaction(adminListInvoices, params, !isAdmin);
  const invoiceResponse = useReadTransaction(listInvoices, params, isAdmin);

  const {
    isRequesting,
    error,
    data = [],
    response,
    refresh
  } = isAdmin ? adminInvoiceResponse : invoiceResponse;

  React.useEffect(() => {
    if (Array.isArray(data) && data.length) {
      const newSelection = data.find((invoice) =>  (invoice.memberId === currentUserId && isInvoicePayable(invoice)));
      setSelectedInvoice(newSelection);
    }
  }, [JSON.stringify(data), setSelectedInvoice]);

  const setSelected = React.useCallback((id: string) => {
    setSelectedInvoice(data.find(invoice => invoice.id === id));
  }, [setSelectedInvoice, data]);

  const onSuccess = React.useCallback(() => {
    refreshMember();
    refresh();
  }, [refresh, refreshMember]);

  const rowId = React.useCallback(invoice => invoice.id, []);
  const fields: Column<MemberInvoice | RentalInvoice>[] = [
    ...(memberId
      ? []
      : [
          {
            id: "member",
            label: "Member",
            cell: (row: MemberInvoice | RentalInvoice) => row.memberName,
            defaultSortDirection: SortDirection.Desc
          }
        ]),
    {
      id: "resourceClass",
      label: "Type",
      cell: (row: MemberInvoice | RentalInvoice) => InvoiceableResourceDisplay[row.resourceClass],
      defaultSortDirection: SortDirection.Desc
    },
    {
      id: "dueDate",
      label: "Due Date",
      cell: (row: MemberInvoice | RentalInvoice) => renderInvoiceDueDate(row),
      defaultSortDirection: SortDirection.Desc
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: MemberInvoice | RentalInvoice) => numberAsCurrency(row.amount),
      defaultSortDirection: SortDirection.Desc
    },
    {
      id: "status",
      label: "Status",
      cell: (row: MemberInvoice | RentalInvoice) => {
        const statusColor = row.pastDue && !row.settled ? Status.Danger : Status.Success;
        const label = renderInvoiceStatus(row);
        return <StatusLabel label={label} color={statusColor} />;
      }
    },
    {
      id: "view",
      label: "View",
      cell: (row: MemberInvoice | RentalInvoice) => {
        if (row.subscriptionId && viewingOwnInvoices) {
          return <ViewSubscriptionModal memberId={row.memberId} />;
        }
        return <ViewInvoiceModal invoice={row} onUpdate={onSuccess} />;
      }
    }
  ];
  const payNow = viewingOwnInvoices && isInvoicePayable(selectedInvoice);

  const goToCheckout = React.useCallback(() => stageInvoice(selectedInvoice), [selectedInvoice, stageInvoice]);

  return (
    <>
    {isAdmin && (
      <>
        <CreateInvoiceModal memberId={memberId} onSuccess={onSuccess}/>
        <DeleteInvoiceModal invoice={selectedInvoice} onSuccess={onSuccess}/>
        <InvoiceFilters onChange={refresh}/>
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
      columns={fields}
      rowId={rowId}
      totalItems={extractTotalItems(response)}
      selectedIds={selectedInvoice && selectedInvoice.id}
      setSelectedIds={setSelected}
    />
    </>
  )
};

export default withQueryContext(InvoicesTable);