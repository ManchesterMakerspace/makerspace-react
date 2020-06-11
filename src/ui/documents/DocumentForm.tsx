import * as React from "react";
import SignatureCanvas from "react-signature-canvas";

import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import Form from "ui/common/Form";
import DocumentFrame, { documents, DocDetails } from "./Document";

interface Props {
  doc: DocDetails & { src: string };
  onAccept: (signature?: string) => void;
  requestSignature?: boolean;
  loading: boolean;
  error: string;
}

const DocumentForm: React.FC<Props> = ({ error, loading, onAccept, doc, requestSignature }) => {
  const { id, name, src, label } = doc;

  const [signatureError, setError ] = React.useState<string>();
  const signatureRef = React.useRef<any>();
  const clearSignature = React.useCallback(() => {
    signatureRef.current && signatureRef.current.clear();
  }, [signatureRef]);

  const onSubmit = React.useCallback(async (form: Form) => {
    await form.simpleValidate({ [id]: doc });
    if (!form.isValid()) {
      return;
    }
    let signature: string;
    if (requestSignature) {
      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        setError("Signature required to proceed");
        return;
      } else {
        setError("");
        signature = signatureRef.current.toDataURL();
      }
    }
    
    onAccept(signature);
  }, [onAccept, signatureRef, setError]);
  
  return (
    <Form
      key={id}
      id={`${id}-form`}
      submitText="Proceed"
      onSubmit={onSubmit}
      error={signatureError || error}
      loading={loading}
      style={{ maxWidth: "900px", margin: "auto" }}
    >
      <DocumentFrame id={id} src={src} />
      <div key={name}>
        <FormControlLabel
          control={
            <Checkbox id={name} name={name} color="primary" />
          }
          label={label}
        />
      </div>
      {requestSignature && (
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
      )}
    </Form>
  );
};

export default DocumentForm;
