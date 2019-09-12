import * as React from "react";
import Typography from "@material-ui/core/Typography";

import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import { getSubscription, listInvoices, adminListInvoices, adminCancelSubscription, cancelSubscription } from "makerspace-ts-api-client";
import { timeToDate } from "ui/utils/timeToDate";
import useReadTransaction from "../hooks/useReadTransaction";
import { useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";

interface Props {
  subscriptionId: string;
  memberId: string;
  getMember: () => void;
}

const CancelMembershipModal: React.FC<Props> = ({ subscriptionId, memberId, getMember }) => {
  const { currentUser: { isAdmin } } = useAuthState();
  const { isOpen, openModal, closeModal } = useModal();

  let data;
  if (isAdmin) {
    const result = useReadTransaction(adminListInvoices, { resourceId: memberId });
    data = result.data || [];
  } else {
    const result = useReadTransaction(listInvoices, {});
    data = result.data || [];
  }
  const invoice = data.find(invoice => invoice.subscriptionId === subscriptionId);
  const { isRequesting: loading, error: loadingError, data: subscription } = useReadTransaction(getSubscription, subscriptionId);
  const { isRequesting, error, call } = useWriteTransaction(isAdmin ? adminCancelSubscription : cancelSubscription, () => {
    closeModal();
    getMember();
  });

  const onSubmit = React.useCallback(() => {
    call(subscriptionId);
  }, [call, subscriptionId]);

  if (!subscriptionId) {
    return null;
  }

  const isLoading = loading || isRequesting;
  const apiError = error || loadingError;

  return (
    <>
     <ActionButton 
        id="subscription-option-cancel"
        color="secondary"
        variant="outlined"
        disabled={isLoading || !!apiError}
        label="Cancel Membership"
        onClick={openModal}
      />
      {isOpen && (
        <FormModal
          id="cancel-subscription"
          loading={isLoading}
          isOpen={isOpen}
          closeHandler={closeModal}
          title="Cancel Membership"
          onSubmit={onSubmit}
          submitText="Submit"
          cancelText="Close"
          error={apiError}
        >
          <Typography gutterBottom>
            Are you sure you want to cancel your recurring membership?  This action cannot be undone.
          </Typography>
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
            <span id="cancel-subscription-status">{`${subscription.status}`}</span>
          </KeyValueItem>
          <KeyValueItem label="Next Payment">
            <span id="cancel-subscription-next-payment">{timeToDate(subscription.nextBillingDate)}</span>
          </KeyValueItem>
        </FormModal>
      )}
    </>
  );
};

export default CancelMembershipModal;
