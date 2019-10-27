import * as React from "react";
import useReactRouter from "use-react-router";

import { updateMember } from "makerspace-ts-api-client";
import { buildProfileRouting } from "../member/utils";
import { useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import DocumentForm from "./DocumentForm";
import { Documents, documents } from "./Document";

const MembershipAgreement: React.FC = () => {
  const [display, setDisplay] = React.useState<Documents>(Documents.CodeOfConduct);
  const { history } = useReactRouter();
  const { currentUser: { id: currentUserId } } = useAuthState();

  const onSuccess = React.useCallback(() => {
    history.push(buildProfileRouting(currentUserId));
  }, [history]);

  const {
    error,
    isRequesting: updating,
    call: update
  } = useWriteTransaction(updateMember, onSuccess);

  const onContractAccept = React.useCallback(async (signature: string) => {
    await update(currentUserId, { signature });
  }, [update]);

  const onConductAccept = React.useCallback(() => {
    setDisplay(Documents.MemberContract);
  }, [setDisplay]);

  const onAccept = display === Documents.MemberContract ? onContractAccept : onConductAccept;

  return (
    <DocumentForm 
      error={error} 
      loading={updating}
      doc={{
        ...documents[display],
        src: String(documents[display].src)
      }} 
      onAccept={onAccept}
      requestSignature={display === Documents.MemberContract}
    />
  );
}

export default MembershipAgreement;
