import * as React from "react";
import SignatureCanvas from "react-signature-canvas";

import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { timeToDate } from "ui/utils/timeToDate";
import Form from "ui/common/Form";
import { useAuthState } from "../reducer/hooks";
import { withLoading } from "../common/LoadingOverlay";
const memberContract = require('documents/member_contract.html') as string;

const id = "member-contract";
const document = {
  displayName: "Member Contract",
  name: `${id}-checkbox`,
  transform: (val: string) => !!val,
  validate: (val: boolean) => val,
  error: "You must accept to continue",
  label: "I have read and agree to the Manchester Makerspace Member Contract",
}

interface Props {
  onAccept: (signature: string) => void;
}

const MemberContract: React.FC<Props> = ({ onAccept }) => {
  const { currentUser } = useAuthState();
  const [error, setError ] = React.useState();
  const formattedMemberContract = memberContract.replace('[name]', `<b>${currentUser.firstname} ${currentUser.lastname}</b>`)
                                                .replace('[today]', `<b>${timeToDate(new Date())}</b>`);

  const signatureRef = React.useRef<any>();
  const clearSignature = React.useCallback(() => {
    signatureRef.current && signatureRef.current.clear();
  }, [signatureRef]);

  const onSubmit = React.useCallback(async (form: Form) => {
    await form.simpleValidate({ [id]: document });
    if (!form.isValid()) {
      return;
    }
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setError("Signature required to proceed");
      return;
    }
    const signature: string = signatureRef.current.toDataURL();
    onAccept(signature);
  }, [onAccept, signatureRef, setError]);

  
  return (
    <Form
      key={id}
      id={`${id}-form`}
      submitText="Proceed"
      onSubmit={onSubmit}
      error={error}
    >
      <div dangerouslySetInnerHTML={{ __html: formattedMemberContract }} />
      <div key={document.name}>
        <FormControlLabel
          control={
            <Checkbox
              id={document.name}
              name={document.name}
              color="primary"
            />
          }
          label={document.label}
        />
      </div>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" align="left">Please sign below</Typography>
        </Grid>
        <Grid item xs={12} style={{ border: "1px solid black", borderRadius: "4px" }}>
          <SignatureCanvas ref={signatureRef} canvasProps={{ height: "250", width: "1000" }} />
          <Grid container justify="flex-end">
            <Grid item xs={12}>
              <Button variant="contained" color="secondary" onClick={clearSignature}>Reset Signature</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  );
};

export default withLoading(MemberContract);
