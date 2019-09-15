import * as React from "react";
import { membershipRenewalOptions } from "ui/members/constants";
import { memberToRenewal } from "ui/member/utils";
import RenewalForm, { RenewForm } from "ui/common/RenewalForm";
import useReadTransaction from "../hooks/useReadTransaction";
import { getMember, adminUpdateMember } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import Form from "../common/Form";


const RenewMember: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const formRef = React.useRef<RenewalForm>();
  const { 
    isRequesting: memberLoading,
    refresh: refreshMember,
    data: member
  } = useReadTransaction(getMember, memberId);

  const onSuccess = React.useCallback(({ reset }) => {
    refreshMember();
    closeModal();
    reset();
  }, [refreshMember, closeModal]);
  const {
    isRequesting: memberRenewing,
    error: renewError,
    call: renew,
  } = useWriteTransaction(adminUpdateMember, onSuccess);

  const onSubmit = React.useCallback(async (form: Form) => {
    const validUpdate: RenewForm = await formRef.current.validate(form);

    if (!form.isValid()) return;

    // TODO: Renew isn't supported in update shape but it should be
    renew(memberId, validUpdate as any);
  }, [formRef, renew]);

  return (
    <>
      <ActionButton
        id="member-detail-open-renew-modal"
        color="primary"
        variant="contained"
        disabled={memberLoading || memberRenewing}
        label="Renew"
        onClick={openModal}
      />
      {isOpen && (
        <RenewalForm
          ref={formRef}
          renewalOptions={membershipRenewalOptions}
          title="Renew Membership"
          entity={memberToRenewal(member)}
          isOpen={true}
          isRequesting={memberRenewing}
          error={renewError}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}

export default RenewMember;
