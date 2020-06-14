import * as React from "react";
import useModal from "../hooks/useModal";
import { ActionButton } from "../common/ButtonRow";
import FormModal from "ui/common/FormModal";
import SubscriptionDetails from "./SubscriptionDetails";

interface Props {
  memberId: string;
  onChange?: () => void;
}

const ViewSubscriptionModal: React.FC<Props> = ({ memberId, onChange }) => {
  const {isOpen, openModal, closeModal} = useModal();

  return (
    <>
      <ActionButton
        id="view-subscription-button"
        color="secondary"
        variant="outlined"
        label="View / Manage"
        onClick={openModal}
      />
    {isOpen && (
      <FormModal
          id="view-subscription"
          title="Subscription"
          isOpen={isOpen}
          closeHandler={closeModal}
          cancelText="Close"
        >
          <SubscriptionDetails
            memberId={memberId}
            onChange={onChange}
          />
        </FormModal>
      )}
    </>
  )
};

export default ViewSubscriptionModal;
