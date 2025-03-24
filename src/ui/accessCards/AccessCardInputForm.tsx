import * as React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { adminGetNewCard, adminCreateCard, getMember, Member } from "makerspace-ts-api-client";

import FormModal from "ui/common/FormModal";
import useWriteTransaction from "ui/hooks/useWriteTransaction";
import useReadTransaction from "ui/hooks/useReadTransaction";
import useModal from "../hooks/useModal";
import { ActionButton } from "../common/ButtonRow";

const AccessCardForm: React.FC<{ memberId: string }> = ({ memberId }) => {
  const [error, setError] = React.useState<string>();
  const [idVerified, setIdVerified] = React.useState(false);
  const [cardInput, setCardInput] = React.useState<string>("");

  const toggleVerified = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIdVerified(event.currentTarget.checked);
    setError("");
  }, [setError, setIdVerified]);

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isRequesting: newCardLoading,
    error: newCardError,
    refresh: getNewCard,
    data: rejectionCard,
  } = useReadTransaction(adminGetNewCard, { uid: memberId });

  React.useEffect(() => {
    if (!newCardLoading) getNewCard();
  }, [isOpen]);

  React.useEffect(() => {
    if (rejectionCard?.uid) {
      setCardInput(rejectionCard.uid);
    }
  }, [rejectionCard]);

  const {
    isRequesting: memberLoading,
    refresh: refreshMember,
    data: member = {} as Member
  } = useReadTransaction(getMember, { id: memberId });

  const onSuccess = React.useCallback(({ reset }) => {
    refreshMember();
    getNewCard();
    closeModal();
    reset();
  }, [refreshMember, closeModal]);

  const { isRequesting: createLoading, error: createError, call: createCard } = useWriteTransaction(adminCreateCard, onSuccess);

  const onSubmit = React.useCallback(() => {
    if (!rejectionCard) {
      setError("Import new key fob before proceeding.");
      return;
    }

    if (!idVerified) {
      setError("Member ID verification required to issue key.");
      return;
    }

    if (cardInput && !/^([a-fA-F0-9]{2})*$/i.test(cardInput)) {
      setError("UID must be an even number of hexadecimal characters.");
      return;
    }

    const uidToUse = cardInput ? cardInput.toUpperCase() : rejectionCard.uid;
    createCard({ body: { memberId: member.id, uid: uidToUse } });
  }, [rejectionCard, createCard, setError, member.id, idVerified, cardInput]);

  return (
    <>
      <ActionButton
        id="member-detail-open-card-modal"
        color="primary"
        variant={member && member.cardId ? "outlined" : "contained"}
        disabled={memberLoading}
        label={member && member.cardId ? "Replace Fob" : "Register Fob"}
        onClick={openModal}
      />
      {isOpen && <FormModal
        id="card-form"
        loading={createLoading || newCardLoading}
        isOpen={true}
        title="Register New Fob"
        closeHandler={closeModal}
        onSubmit={onSubmit}
        error={createError || newCardError || error}
      >
        <Typography variant="body1" gutterBottom>Instructions to register new member key fob</Typography>
        {(member && member.cardId) ?
          <Typography variant="body1" gutterBottom>Access card exists for {member.firstname}</Typography>
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
            <TextField
              id="card-form-key-input"
              value={cardInput}
              onChange={(e) => setCardInput(e.target.value)}
              inputProps={{ maxLength: 14 }}
              variant="outlined"
              size="small"
              style={{ marginLeft: "10px" }}
            />
          </li>
          <ul>
            <li>If 'No Card Found', check for error message in this form. If no error, try steps 1 and 2 again</li>
            <li>If ID displayed, click 'Submit' button</li>
          </ul>
        </ol>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="id-verified"
                id="card-form-id-verified"
                value="id-verified"
                checked={idVerified}
                onChange={toggleVerified}
                color="default"
              />
            }
            label="Verified member's name and address with valid identification"
          />
        </Grid>
      </FormModal>}
    </>
  );
};

export default AccessCardInputForm;
