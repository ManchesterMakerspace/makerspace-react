import * as React from "react";

import Grid from "@material-ui/core/Grid";
import KeyValueItem from "ui/common/KeyValueItem";

import { useAuthState } from "../reducer/hooks";
import useReadTransaction from "../hooks/useReadTransaction";
import { adminListInvoices, listInvoices, getSubscription, Invoice } from "makerspace-ts-api-client";
import { timeToDate } from "../utils/timeToDate";
import LoadingOverlay from "../common/LoadingOverlay";
import ChangePaymentMethodModal from "./ChangePaymentMethodModal";
import CancelMembershipModal from "./CancelMembershipModal";

interface Props {
  subscriptionId: string;
  memberId: string;
  getMember: () => void;
}

const SubscriptionDetails: React.FC<Props> = ({ subscriptionId, memberId, getMember }) => {
  const { currentUser: { isAdmin } } = useAuthState();

  let data;
  let invoicesLoading;
  if (isAdmin) {
    const result = useReadTransaction(adminListInvoices, { resourceId: memberId });
    data = result.data || [];
    invoicesLoading = result.isRequesting;
  } else {
    const result = useReadTransaction(listInvoices, {});
    data = result.data || [];
    invoicesLoading = result.isRequesting;
  }
  const invoice = data.find(invoice => invoice.subscriptionId === subscriptionId);
  const { isRequesting, data: subscription } = useReadTransaction(getSubscription, subscriptionId);

  const loading = isRequesting || invoicesLoading;

  return (
    <>
      <Grid container spacing={24}>
        <Grid item xs={12}>
        {(loading || !subscription) 
          ? <LoadingOverlay  id="update-membership-modal-loading" contained={true}/>
          : (<>
            { invoice &&
              <>
                <KeyValueItem label="Name">
                  <span id="cancel-subscription-name">{invoice.name}</span>
                </KeyValueItem>
                <KeyValueItem label="Description">
                  <span id="cancel-subscription-description">{invoice.description}</span>
                </KeyValueItem>
              </>
            }
            <KeyValueItem label="Status">
              <span id="subscription-status">{`${subscription.status}`}</span>
            </KeyValueItem>
            <KeyValueItem label="Next Payment">
              <span id="subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
            </KeyValueItem>
          </>)
        }
        </Grid>
      </Grid>

      <Grid container spacing={24}>
        { subscriptionId && (
          <Grid item xs={12}>
            {/* TODO: Add support for changing membership type */}
            <ChangePaymentMethodModal subscriptionId={subscriptionId}/>
            <CancelMembershipModal subscriptionId={subscriptionId} memberId={memberId} getMember={getMember}/>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default SubscriptionDetails;
