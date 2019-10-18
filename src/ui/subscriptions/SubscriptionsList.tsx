import * as React from "react";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import { Subscription, adminListSubscriptions } from "makerspace-ts-api-client";

import { Column } from "../common/table/Table";
import StatefulTable, { useQueryState } from "../common/table/StatefulTable";
import { numberAsCurrency } from "../utils/numberAsCurrency";
import { timeToDate } from "../utils/timeToDate";
import extractTotalItems from "../utils/extractTotalItems";
import CancelSubscriptionModal from "./CancelSubscriptionModal";
import useReadTransaction from "../hooks/useReadTransaction";

const fields: Column<Subscription>[] = [
  {
    id: "memberName",
    label: "Member",
    cell: (row: Subscription) => row.memberName,
  },
  {
    id: "resourceClass",
    label: "Type",
    cell: (row: Subscription) => row.resourceClass,
  }, {
    id: "amount",
    label: "Amount",
    cell: (row: Subscription) => numberAsCurrency(row.amount),
  }, {
    id: "status",
    label: "Status",
    cell: (row: Subscription) => row.status,
  }, {
    id: "nextBilling",
    label: "Next Billing Date",
    cell: (row: Subscription) => timeToDate(row.nextBillingDate),
  }
];

const rowId = (sub: Subscription) => sub.id;

const SubscriptionsTable: React.FC = () => {
  const [hideCanceled, setHideCanceled] = React.useState(true);
  const toggleHideCanceled = React.useCallback(() => {
    setHideCanceled(canceled => !canceled);
  }, [setHideCanceled]);

  const [selectedId, setSelectedId] = React.useState<string>();
  const [queryParams, setQueryState, resetQuery] = useQueryState();

  const {
    isRequesting,
    data: subscriptions = [],
    response,
    refresh,
    error
  } = useReadTransaction(adminListSubscriptions, {
    ...queryParams,
    hideCanceled
  });

  const onCancel = React.useCallback(() => {
    refresh();
    resetQuery();
  }, [refresh, resetQuery]);

  const selectedSubscription = subscriptions.find(sub => sub.id === selectedId);

  return (
    <Grid container spacing={24} justify="center">
      <Grid item xs={12}>
        <Grid>
          <CancelSubscriptionModal 
            subscription={selectedSubscription}
            onSuccess={onCancel}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="hide-canceled"
                value="hide-canceled"
                id="hide-canceled"
                checked={!!hideCanceled}
                onChange={toggleHideCanceled}
                color="default"
              />
            }
            label="Hide canceled subscriptions."
          />
        </Grid>

        <StatefulTable
          id="subscriptions-table"
          title="Subscriptions"
          loading={isRequesting}
          data={Object.values(subscriptions)}
          error={error}
          totalItems={extractTotalItems(response)}
          selectedIds={selectedId}
          setSelectedIds={setSelectedId}
          queryParams={queryParams}
          setQuery={setQueryState}
          columns={fields}
          rowId={rowId}
        />
      </Grid>
    </Grid>
  )
}

export default SubscriptionsTable;
