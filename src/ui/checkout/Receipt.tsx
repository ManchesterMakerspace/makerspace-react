import * as React from "react";
import useReactRouter from "use-react-router";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import { buildProfileRouting } from "ui/member/utils";
import { useAuthState } from "../reducer/hooks";
import { ActionButton } from "../common/ButtonRow";
import DocumentFrame from "../documents/Document";

const buildReceiptUrl = (id: string) => `${process.env.BASE_URL || ""}/api/billing/receipts/${id}`;
const receiptContainerId = "receipt-container";

const Receipt: React.FC = () => {
  const { currentUser: { id: userId } } = useAuthState();
  const { history, match: { params: { invoiceId } } } = useReactRouter();
  const goToProfile = React.useCallback(() => history.push(buildProfileRouting(userId)), [history, userId]);
  const printReceipt = React.useCallback(() => {
    window.frames[receiptContainerId].focus();
    window.frames[receiptContainerId].print();
  }, [window.frames]);

  return (
    <>
      <Grid container spacing={16}>
        <Grid item sm={6} xs={12}>
          <Typography variant="h4">Thank you for your purchase!</Typography>
          <Typography variant="subheading">Details regarding your purchase can be found below.</Typography>
        </Grid>
        <Grid item sm={6} xs={12}>
          <ActionButton
            id="return-to-profile"
            variant="outlined"
            style={{float: "right"}}
            color="primary"
            label="Return to profile"
            onClick={goToProfile}
          />
          <ActionButton
            label="Print Receipt"
            style={{float: "right"}}
            color="primary"
            variant="contained"
            onClick={printReceipt}
          />
        </Grid>
      </Grid>
      <DocumentFrame id={receiptContainerId} src={buildReceiptUrl(invoiceId)} />
    </>
  )
}

export default Receipt;