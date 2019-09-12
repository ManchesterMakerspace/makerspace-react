import * as React from "react";
import Form from "ui/common/Form";
import { Member } from "makerspace-ts-api-client";
import SubscriptionDetails from "./SubscriptionDetails";
import NoSubscriptionDetails from "./NoSubscriptionDetails";
import LoadingOverlay from "../common/LoadingOverlay";

/*
View Current Membership Info
If no subscription, can purchase a membership
When selecting a membership & submitting form, create an invoice, and go to checkout

If subscription, can cancel or change payment method
Need to display notification that can only have one subscription active so if they'd like to change
membership then they need to cancel their current one and select a new one.
Changing methods renders PaymentMethodsContainer w/ managing methods false

*/


// Need to determine current membership state
// If has subscription, can cancel or change - change is just a cancel and create
  // Cancelling subscription needs to delete all oustanding invoices for that subscription
  // Creating a subscription will create an invoice for it to be settled automatically
  // Need to watch for payments from subscription in order to settle automatically

  // Also need to support changing payment methods


// If doesn't have subscription, may be month to month or non member
  // If month to month, delete existing invoice & create subscription

  // If non member, going through orig checkout process

interface Props {
  subscriptionId: string;
  member: Member;
  getMember: () => void;
}

const UpdateMembershipForm: React.FC<Props> = ({ member, subscriptionId, getMember }) => {
  return (
    <Form
      id="update-membership-modal"
      title="Membership"
    >
      {!member ? <LoadingOverlay id="update-membership-modal-loading" />
      : (subscriptionId 
        ? <SubscriptionDetails subscriptionId={subscriptionId} memberId={member.id} getMember={getMember}/> 
        : <NoSubscriptionDetails member={member} />)
      }
    </Form>
  )
}

export default UpdateMembershipForm;
