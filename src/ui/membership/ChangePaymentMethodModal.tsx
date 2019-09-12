import * as React from "react";

import FormModal from "ui/common/FormModal";
import { getSubscription, updateSubscription } from "makerspace-ts-api-client";
import useReadTransaction from "../hooks/useReadTransaction";
import { useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import PaymentMethodsContainer from "../checkout/PaymentMethodsContainer";

interface Props {
  subscriptionId: string;
}

const ChangePaymentMethodModal: React.FC<Props> = ({ subscriptionId }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [paymentMethodId, setPaymentMethodId] = React.useState();

  const { isRequesting: loading, error: loadingError, data: subscription, refresh } = useReadTransaction(getSubscription, subscriptionId);
  const { isRequesting, error, call } = useWriteTransaction(updateSubscription, () => {
    closeModal();
    refresh();
  });

  React.useEffect(() => {
    subscription && setPaymentMethodId(subscription.paymentMethodToken);
  }, [JSON.stringify(subscription)]);

  const onSubmit = React.useCallback(async () => {
    paymentMethodId && call(subscriptionId, { paymentMethodToken: paymentMethodId });
  }, [call, subscriptionId, paymentMethodId]);

  if (!subscriptionId) {
    return null;
  }

  const isLoading = loading || isRequesting;
  const apiError = error || loadingError;

  return (
    <>
     <ActionButton 
        id="subscription-option-payment-method"
        color="primary"
        variant="contained"
        disabled={isLoading || !!apiError}
        label="Change Payment Method"
        onClick={openModal}
      />
      {isOpen && (
        <FormModal
          id="change-payment-method"
          isOpen={true}
          closeHandler={closeModal}
          onSubmit={onSubmit}
          loading={isLoading}
          error={apiError}
        >
          <PaymentMethodsContainer
            onPaymentMethodChange={setPaymentMethodId}
            title="Select or add a new payment method"
            subscription={subscription}
          />
        </FormModal>
      )}
    </>
  );
};

export default ChangePaymentMethodModal;
