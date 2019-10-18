import * as React from "react";

import FormModal from "ui/common/FormModal";
import { updateSubscription, Subscription } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import PaymentMethodsContainer from "../checkout/PaymentMethodsContainer";

interface Props {
  subscription: Subscription;
  onSuccess?(): void;
}

const ChangePaymentMethodModal: React.FC<Props> = ({ subscription: { id: subscriptionId, paymentMethodToken } = {} }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [paymentMethodId, setPaymentMethodId] = React.useState();

  const { isRequesting, error, call } = useWriteTransaction(updateSubscription, () => {
    closeModal();
  });

  const onSubmit = React.useCallback(async () => {
    paymentMethodId && call(subscriptionId, { paymentMethodToken: paymentMethodId });
  }, [call, subscriptionId, paymentMethodId]);

  if (!subscriptionId) {
    return null;
  }

  return (
    <>
     <ActionButton
        id="subscription-option-payment-method"
        color="primary"
        variant="contained"
        disabled={isRequesting || !!error}
        label="Change Payment Method"
        onClick={openModal}
      />
      {isOpen && (
        <FormModal
          id="change-payment-method"
          isOpen={true}
          closeHandler={closeModal}
          onSubmit={onSubmit}
          loading={isRequesting}
          error={error}
        >
          <PaymentMethodsContainer
            onPaymentMethodChange={setPaymentMethodId}
            title="Select or add a new payment method"
            paymentMethodToken={paymentMethodToken}
          />
        </FormModal>
      )}
    </>
  );
};

export default ChangePaymentMethodModal;
