import * as React from "react";
import useReactRouter from "use-react-router";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import MembershipSelectForm from "ui/membership/MembershipSelectForm";
import KeyValueItem from "ui/common/KeyValueItem";
import { displayMemberExpiration } from "ui/member/utils";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import { getDetailsForMember } from "ui/membership/constants";
import { Routing } from "app/constants";
import FormModal from "ui/common/FormModal";
import { Member, createInvoice } from "makerspace-ts-api-client";
import useModal from "../hooks/useModal";
import { useBillingState, useCheckoutState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { Action } from "../checkout/constants";

interface Props {
  member: Member;
}

/**
 * Component for when a member is viewing membership details but they don't have a subscription yet
 */
const NoSubscriptionDetails: React.FC<Props> = ({ member }) => {
  const {isOpen, openModal, closeModal} = useModal();
  const [{ selectedOption }] = useBillingState();
  const [option, setOption] = React.useState(selectedOption);
  const [_, dispatch] = useCheckoutState();

  const { history } = useReactRouter();

  const { call, isRequesting, error } = useWriteTransaction(createInvoice, ({ response }) => {
    dispatch({
      type: Action.StageInvoicesForPayment,
      data: [response.data]
    });
    history.push(Routing.Checkout);
  });
  const onSelect = React.useCallback((id: string, discountId: string) => {
    setOption({ id, discountId });
  }, [setOption]);

  const onSubmit = React.useCallback(async () => {
    call(option);
  }, [option, call]);

  const details = getDetailsForMember(member);

  return (
    <>
      {isOpen && (
        <FormModal
          id="select-membership"
          fullScreen={true}
          isOpen={isOpen}
          closeHandler={closeModal}
          onSubmit={onSubmit}
          loading={isRequesting}
          error={error}
        >
          <MembershipSelectForm subscriptionOnly={true} onSelect={onSelect}/>
        </FormModal>
      )}
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <KeyValueItem label="Membership Expiration">
            <span id="member-detail-expiration">{displayMemberExpiration(member)}</span>
          </KeyValueItem>
          <KeyValueItem label="Membership Status">
            <MemberStatusLabel id="member-detail-status" member={member} />
          </KeyValueItem>
          <KeyValueItem label="Membership Type">
            <span id="member-detail-type">{details.type}</span>
          </KeyValueItem>
        </Grid>
        <Grid item xs={12}>
          <Typography>{details.description}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            id="settings-create-membership-button"
            variant="contained"
            disabled={!details.allowMod}
            onClick={openModal}
          >
            {member.expirationTime ? "Update Membership" : "Create Membership"}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default NoSubscriptionDetails;