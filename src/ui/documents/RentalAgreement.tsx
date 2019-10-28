import * as React from "react";
import useReactRouter from "use-react-router";

import { updateRental } from "makerspace-ts-api-client";
import { buildProfileRouting } from "../member/utils";
import { useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import DocumentForm from "./DocumentForm";
import { Documents, documents } from "./Document";
import { useScrollToHeader } from "../hooks/useScrollToHeader";

const rentalAgreement = documents[Documents.RentalAgreement];

const RentalAgreement: React.FC<{ rentalId: string }> = ({ rentalId }) => {
  const { history } = useReactRouter();
  const { currentUser: { id: currentUserId } } = useAuthState();
  const { executeScroll } = useScrollToHeader();

  const onSuccess = React.useCallback(() => {
    executeScroll();
    history.push(buildProfileRouting(currentUserId));
  }, [history]);

  const {
    error,
    isRequesting: updating,
    call: update
  } = useWriteTransaction(updateRental, onSuccess);

  const onContractAccept = React.useCallback(async (signature: string) => {
    await update(rentalId, { signature });
  }, [update]);


  return (
    <DocumentForm
      error={error}
      loading={updating}
      doc={{
        ...rentalAgreement,
        src: typeof rentalAgreement.src === "function" && rentalAgreement.src(rentalId)
      }}
      onAccept={onContractAccept}
      requestSignature={true}
    />
  );
}

export default RentalAgreement;
