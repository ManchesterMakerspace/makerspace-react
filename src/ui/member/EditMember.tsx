import * as React from "react";
import useReadTransaction from "../hooks/useReadTransaction";
import { getMember, adminUpdateMember, Member } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import Form from "../common/Form";
import { useAuthState } from "../reducer/hooks";
import MemberForm from "./MemberForm";


const EditMember: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const { currentUser: { isAdmin } } = useAuthState();
  const formRef = React.useRef<MemberForm>();
  const { 
    isRequesting: memberLoading,
    refresh: refreshMember,
    data: member = {}
  } = useReadTransaction(getMember, memberId);

  const onSuccess = React.useCallback(() => {
    refreshMember();
    closeModal();
  }, [refreshMember, closeModal]);
  const {
    isRequesting: memberUpdating,
    error: updateError,
    call: update,
  } = useWriteTransaction(adminUpdateMember, onSuccess);

  const onSubmit = React.useCallback(async (form: Form) => {
    const validUpdate: Member = await formRef.current.validate(form);

    if (!form.isValid()) return;

    update(memberId, validUpdate);
  }, [formRef, update]);

  return (
    <>
      <ActionButton
        id="member-detail-open-edit-modal"
        color="primary"
        variant="outlined"
        disabled={memberLoading || memberUpdating}
        label="Edit"
        onClick={openModal}
      />
      {isOpen && (
        <MemberForm
          ref={formRef}
          member={member}
          isAdmin={isAdmin}
          isOpen={true}
          isRequesting={memberUpdating}
          error={updateError}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}

export default EditMember;
