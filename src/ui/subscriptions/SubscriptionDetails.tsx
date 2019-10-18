import * as React from "react";
import { listInvoices, getSubscription, adminListInvoices, Invoice, Subscription, getMember, Member } from "makerspace-ts-api-client";
import KeyValueItem from "ui/common/KeyValueItem";
import Grid from "@material-ui/core/Grid";

import LoadingOverlay from "../common/LoadingOverlay";
import useReadTransaction, { ReadTransaction } from "../hooks/useReadTransaction";
import ErrorMessage from "../common/ErrorMessage";
import InvoiceDetails from "../invoice/InvoiceDetails";
import { timeToDate } from "../utils/timeToDate";
import { useAuthState } from "../reducer/hooks";
import { renderPlanType } from "./utils";
import ManageSubscription from "../settings/ManageSubscription";
import NoSubscriptionDetails from "./NoSubscriptionDetails";

interface RenderProps {
  isLoading: boolean;
  error: string;
  subscription: Subscription;
  invoice: Invoice;
  member: Member;
  onChange(): void;
}

interface Props {
  subscriptionId: string;
  memberId: string;
  onChange(): void;
}

export const SubscriptionDetailsInner: React.FC<{ subscription: Subscription, invoice?: Invoice}> = ({ invoice, subscription }) => {
  const type = subscription && renderPlanType(subscription.planId);

  return (
    <Grid container spacing={24}>
      <Grid item xs={12}>
      {invoice && <InvoiceDetails invoice={invoice} summaryOnly={true}/>}
        <KeyValueItem label="Status">
          <span id="subscription-status">{`${subscription.status}`}</span>
        </KeyValueItem>
        {type && <KeyValueItem label="Type">
          <span id="subscription-type">{type}</span>
        </KeyValueItem>}
        <KeyValueItem label="Next Payment">
          <span id="subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
        </KeyValueItem>
      </Grid>
    </Grid>
  )
}

export const SubscriptionDetailsWithManagement: React.FC<RenderProps> = ({
  member,
  subscription,
  isLoading,
  error,
  onChange,
  invoice
}) => {
  const fallbackUI = (isLoading && <LoadingOverlay  id="update-membership-modal-loading" contained={true}/>)
  || (error && <ErrorMessage error={error} />);

  const subDetails = subscription && subscription.id ? (
    <>
      <SubscriptionDetailsInner subscription={subscription} invoice={invoice}/>
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <ManageSubscription memberId={member.id} subscription={subscription} onChange={onChange} isLoading={isLoading} error={error}/>
        </Grid>
      </Grid>
    </>
  ) : (
    <NoSubscriptionDetails member={member}/>
  )
  return fallbackUI || subDetails;
}

const SubscriptionDetails: React.FC<{ memberId: string, rentalSubId?: string }> = ({ memberId, rentalSubId }) => {
  const { currentUser: { id, isAdmin } } = useAuthState();
  const asAdmin = isAdmin && id !== memberId;

  const {
    isRequesting: loadingMember,
    error: getMemberError,
    data: member,
    refresh: reloadMember
  } = useReadTransaction(getMember, id);

  let result = {} as ReadTransaction<any, Invoice[]>;
  if (asAdmin) {
    result = useReadTransaction(adminListInvoices, { resourceId: memberId });
  } else {
    result = useReadTransaction(listInvoices, {});
  }

  // Use prop if exists
  const subscriptionId = rentalSubId || member ? member.subscriptionId : undefined;
  const { isRequesting: invoicesLoading, data: invoices = [], error: invoicesError, refresh: reloadInvoices } = result;
  // TODO: this should delay calling until we have sub ID
  const { isRequesting: subscriptionLoading, data: subscription, error: subError, refresh: reloadSubscription } = useReadTransaction(getSubscription, subscriptionId);

  const isLoading = loadingMember || (subscriptionId && subscriptionLoading) || invoicesLoading;
  const error = getMemberError || (subscriptionId && subError) || invoicesError;
  const subscriptionInvoice = invoices.find(invoice => invoice.subscriptionId === subscriptionId);

  const onChange = React.useCallback(() => {
    reloadMember();
    reloadInvoices();
    reloadSubscription();
  }, [reloadMember, reloadInvoices, reloadSubscription]);

  const context: RenderProps = React.useMemo(() => ({
    isLoading,
    error,
    subscription,
    member: member || { id: memberId } as Member,
    onChange,
    invoice: subscriptionInvoice
  }), [isLoading, error, subscription, onChange, subscriptionInvoice]);

  return <SubscriptionDetailsWithManagement {...context} />;
}

export default SubscriptionDetails;
