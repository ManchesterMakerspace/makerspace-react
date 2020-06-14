import * as React from "react";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DocumentFrame, { documents, Documents } from "./Document";

const PreviewMemberContract: React.FC  = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
    <Button onClick={() => setIsOpen(true)}>View Member Contract</Button>
    <Dialog
      fullWidth={true}
      maxWidth="md"
      open={isOpen}
      onClose={() => setIsOpen(false)}
      disableBackdropClick={true}
      scroll={"body"}
    >
      <Grid container justify="center" style={{ margin: "1em 0", padding: "0 1em" }}>
        <Grid item xs={12}>
          <DocumentFrame id="preview-member-contract" src={String(documents[Documents.MemberContract].src)} />
        </Grid>
      </Grid>
      <DialogActions>
        <Button variant="outlined" onClick={() => setIsOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default PreviewMemberContract;
