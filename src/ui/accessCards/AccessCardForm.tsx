
import * as React from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { adminGetNewCard, adminCreateCard, Member } from "makerspace-ts-api-client";

import FormModal from "ui/common/FormModal";
import useWriteTransaction from "ui/hooks/useWriteTransaction";
import useReadTransaction from "ui/hooks/useReadTransaction";

interface Props {
  member: Member;
  onClose: () => void;
}

const AccessCardForm: React.FC<Props> = ({ member, onClose }) => {
  const [error, setError] = React.useState();
  const { loading: createLoading, error: createError, call: createCard, data: newCard } = useWriteTransaction(adminCreateCard);
  const {
    loading: newCardLoading,
    error: newCardError,
    refresh: getNewCard,
    data: rejectionCard
  } = useReadTransaction(adminGetNewCard, [member.id]);


  const onSubmit = React.useCallback(() => {
    if (!rejectionCard) {
      setError("Import new key fob before proceeding.");
      return;
    }
    createCard({
      memberId: member.id,
      uid: rejectionCard.uid,
      cardLocation: undefined // TODO: this should be optional
    });
  }, [rejectionCard, createCard, setError, member.id]);

  React.useEffect(() => {
    !createLoading && !createError && !!newCard && onClose();
  }, [createLoading, createError, newCard, onClose]);

  return (
    <FormModal
      id="card-form"
      loading={createLoading || newCardLoading}
      isOpen={true}
      title="Register New Fob"
      closeHandler={onClose}
      onSubmit={onSubmit}
      error={createError || newCardError || error}
    >
      <Typography variant="body1" gutterBottom>Instructions to register new member key fob</Typography>
      {(member && member.cardId) ?
        <Typography color="default" variant="body1" gutterBottom>Access card exists for {member.firstname}</Typography>
        : <Typography color="secondary" variant="body1" gutterBottom>No access card exists for {member.firstname}</Typography>
      }
      <ol className="instruction-list">
        <li>Scan a new keyfob at the front door</li>
        <li>
          <div>Click the following button to import the new key fob's ID</div>
          <div>
            <Button
              id="card-form-import-new-key"
              color="primary"
              variant="contained"
              onClick={getNewCard}
            >
              Import New Key
            </Button>
          </div>
        </li>
        <li>Confirm new ID is displayed here:
          <span id="card-form-key-confirmation">
            {
              rejectionCard ?
                <span style={{ color: "green" }}> {rejectionCard.uid}</span>
                : <span style={{ color: "red" }}> No Card Found</span>
            }
          </span>
        </li>
        <ul>
          <li>If 'No Card Found', check for error message in this form.  If no error, try steps 1 and 2 again</li>
          <li>If ID displayed, click 'Submit' button</li>
        </ul>
      </ol>
    </FormModal>
  );
};

export default AccessCardForm;