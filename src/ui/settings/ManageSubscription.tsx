import * as React from "react";
import ChangePaymentMethodModal from "../membership/ChangePaymentMethodModal";
import CancelSubscriptionModal from "../subscriptions/CancelSubscriptionModal";
import { Subscription } from "makerspace-ts-api-client";

interface Props {
  isLoading: boolean;
  error: string;
  subscription: Subscription;
  memberId: string;
  onChange?(): void;
}

const ManageSubscription: React.FC<Props> = ({ subscription, onChange, memberId }) => {
  return (
    <>
      {/* TODO: Add support for changing membership type */}
      <ChangePaymentMethodModal
        subscription={subscription}
        onSuccess={onChange}
      />
      <CancelSubscriptionModal
        subscription={subscription}
        memberId={memberId}
        onSuccess={onChange}
      />
    </>
  )
}

export default ManageSubscription;

