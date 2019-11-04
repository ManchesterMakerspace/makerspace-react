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
import { renderPlanType, isCanceled } from "./utils";
import NoSubscriptionDetails from "./NoSubscriptionDetails";
import ChangePaymentMethodModal from "../membership/ChangePaymentMethodModal";
import CancelSubscriptionModal from "./CancelSubscriptionModal";

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
        {!isCanceled(subscription) && (
          <KeyValueItem label="Next Payment">
            <span id="subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
          </KeyValueItem>
        )}
      </Grid>
    </Grid>
  )
}

const SubscriptionDetails: React.FC<{ memberId: string, rentalSubId?: string }> = ({ memberId, rentalSubId }) => {
  const { currentUser: { id, isAdmin } } = useAuthState();
  const asAdmin = isAdmin && id !== memberId;

  const {
    isRequesting: loadingMember,
    error: getMemberError,
    data: member,
    refresh: reloadMember
  } = useReadTransaction(getMember, { id });

  const adminResult = useReadTransaction(adminListInvoices, { resourceId: [memberId] }, !asAdmin);
  const baseResult = useReadTransaction(listInvoices, { }, asAdmin);
  const { isRequesting: invoicesLoading, data: invoices = [], error: invoicesError, refresh: reloadInvoices } = asAdmin ? adminResult : baseResult;

  // Use prop if exists
  const subscriptionId = rentalSubId || (member ? member.subscriptionId : undefined);
  const { isRequesting: subscriptionLoading, data: subscription, error: subError, refresh: reloadSubscription } = useReadTransaction(getSubscription, { id: subscriptionId }, !subscriptionId);

  const isLoading = loadingMember || subscriptionLoading || invoicesLoading;
  const error = getMemberError || subError || invoicesError;
  const subscriptionInvoice = invoices.find(invoice => invoice.subscriptionId === subscriptionId);

  const onChange = React.useCallback(() => {
    reloadMember();
    reloadInvoices();
    reloadSubscription();
  }, [reloadMember, reloadInvoices, reloadSubscription]);

  const fallbackUI = (isLoading && <LoadingOverlay  id="update-membership-modal-loading" contained={true}/>)
  || (error && <ErrorMessage error={error} />);

  const subDetails = subscription && subscription.id ? (
    <>
      <SubscriptionDetailsInner subscription={subscription} invoice={subscriptionInvoice}/>
      {!isCanceled(subscription) &&  (
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <ChangePaymentMethodModal
              subscription={subscription}
              onSuccess={onChange}
            />
            <CancelSubscriptionModal
              subscription={subscription}
              memberId={memberId}
              onSuccess={onChange}
            />
          </Grid>
        </Grid>
      )}
    </>
  ) : (
    <NoSubscriptionDetails member={member || { id: memberId } as Member}/>
  )
  return fallbackUI || subDetails;
}

export default SubscriptionDetails;
